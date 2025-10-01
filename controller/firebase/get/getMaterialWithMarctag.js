import {
	getDoc,
	doc,
	collection,
	query,
	where,
	getDocs,
} from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import { formatDate, formatYear } from "../../custom/customFunction";

export async function getMaterialWithMarctag(
	maID,
	setMaterialData,
	setLoading,
	Alert,
	transaction = true
) {
	setLoading(true);

	try {
		const materialRef = doc(db, "material", maID);
		const docSnap = await getDoc(materialRef);

		if (!docSnap.exists()) {
			Alert.showDanger("Material not found.");
			return;
		}

		const data = docSnap.data();

		const MaterialData = {
			ma_id: docSnap.id,
			ma_qr: data.ma_qr,
			ma_liID: data.ma_liID,
			ma_status: data.ma_status || "NA",
			ma_title: data.ma_title || "NA",
			ma_author: data.ma_author || "NA",
			ma_description: data.ma_description || "NA",
			ma_callNumber: data.ma_libraryCall || "NA",
			ma_formats: {
				coverCopy: data.ma_coverQty > 0,
				softCopy: data.ma_softQty > 0,
				audioCopy: data.ma_audioQty != 0,
			},
			ma_coverURL: data.ma_coverURL ?? "/placeholder.svg?height=400&width=256",
			ma_sections: [],
			ma_holdings: data.ma_holdings || [],
			ma_subjects: [],
		};

		// 🔹 Check transactions if formats/holdings exist
		if (
			transaction &&
			(data.ma_coverQty > 0 || data.ma_softQty > 0 || data.ma_audioQty > 0)
		) {
			const transactionRef = collection(db, "transaction");
			const q = query(
				transactionRef,
				where("tr_status", "==", "Utilized"),
				where("tr_maID", "==", materialRef)
			);

			const snapshot = await getDocs(q);
			const transactions = snapshot.docs.map((d) => d.data());

			// --- 🔹 Adjust holdings for Hard Copy
			MaterialData.ma_holdings = (data.ma_holdings || []).map((holding) => {
				const used = transactions.find(
					(t) =>
						t.tr_format === "Hard Copy" && t.tr_accession === holding.ho_access
				);
				return {
					...holding,
					ho_status: used ? "In Use" : "On Shelf",
				};
			});

			// --- 🔹 Compute available copies properly
			const softUsed = transactions.filter(
				(t) => t.tr_format === "Soft Copy"
			).length;
			const audioUsed = transactions.filter(
				(t) => t.tr_format === "Audio Copy"
			).length;

			// ✅ For Hard/ Cover Copy → based on "On Shelf" holdings
			const coverOnShelf = MaterialData.ma_holdings.filter(
				(h) => h.ho_status === "On Shelf"
			).length;

			const softRemaining = (data.ma_softQty ?? 0) - softUsed;
			const audioRemaining = (data.ma_audioQty ?? 0) - audioUsed;

			MaterialData.ma_formats.softCopyStatus = `${Math.max(
				softRemaining,
				0
			)} / ${data.ma_softQty ?? 0}`;
			MaterialData.ma_formats.audioCopyStatus = `${Math.max(
				audioRemaining,
				0
			)} / ${data.ma_audioQty ?? 0}`;
			MaterialData.ma_formats.coverCopyStatus = `${coverOnShelf} / ${
				data.ma_coverQty ?? 0
			}`;
		}

		// --- 🔹 Material Type & sections
		const [mtSnap, caSnap, shSnap] = await Promise.all([
			getDoc(data.ma_mtID),
			getDoc(data.ma_caID),
			getDoc(data.ma_shID),
		]);

		if (!mtSnap.exists()) {
			Alert.showDanger("Material type not found.");
			return;
		}
		if (!caSnap.exists()) {
			Alert.showDanger("Category type not found.");
			return;
		}
		if (!shSnap.exists()) {
			Alert.showDanger("Shelf type not found.");
			return;
		}

		const mtData = mtSnap.data();
		MaterialData.ma_materialType = mtData.mt_name;

		// --- 🔹 Fill sections & values
		mtData.mt_section?.forEach((item, idx) => {
			const fieldsWithValues = item.mt_fields
				.map((field) => {
					let value = "";

					if (idx === 0) {
						switch (field.mt_title) {
							case "Call Number":
								value = data.ma_libraryCall || "NA";
								break;
							case "Title":
								value = data.ma_title || "NA";
								break;
							case "Author":
								value = data.ma_author || "NA";
								break;
							case "Publisher":
								value = data.ma_publisher || "NA";
								break;
							case "Place of Publication":
								value = data.ma_publication;
								break;
							case "Copyright/Publication Year":
								value = formatYear(data.ma_copyright);
								break;
							case "Pages":
								value = data.ma_pages || "NA";
								break;
							case "Size":
								value = data.ma_size || "NA";
								break;
							case "ISBN":
								value = data.ma_isbn || "NA";
								break;
							case "Language":
								value = data.ma_language || "NA";
								break;
							case "Description":
								value = data.ma_description || "NA";
								break;
							case "Subject":
								value = data.ma_subjects?.join(", ") ?? "";
								break;
							default:
								value = "";
						}
					} else {
						const match = data.ma_fields?.find(
							(f) => f.mt_title === field.mt_title
						);
						value = match ? match.mt_value : "";
					}

					return {
						mt_marcTag: field.mt_marcTag,
						mt_title: field.mt_title,
						mt_value: value,
					};
				})
				.filter((f) => f.mt_value !== null && f.mt_value !== "");

			if (fieldsWithValues.length > 0) {
				MaterialData.ma_sections.push({
					mt_section: item.mt_section,
					mt_fields: fieldsWithValues,
				});
			}
		});

		MaterialData.ma_category = caSnap.data().ca_name;
		MaterialData.ma_shelf = shSnap.data().sh_name;

		// ✅ Only fetch library if `transaction === true`
		if (transaction) {
			const liSnap = await getDoc(data.ma_liID);
			if (!liSnap.exists()) {
				Alert.showDanger("Library not found.");
				return;
			}
			const liData = liSnap.data() || {};

			MaterialData.ma_library = liData.li_name ?? "";
			MaterialData.ma_school = liData.li_schoolname ?? "";
			MaterialData.ma_operation = liData.li_resources?.material ?? false;
		}

		setMaterialData(MaterialData);
	} catch (error) {
		Alert.showDanger(error.message);
		console.error("getMaterialWithMarctag Error:", error);
	} finally {
		setLoading(false);
	}
}
