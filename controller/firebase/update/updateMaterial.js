import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../../../server/firebaseConfig";
import {
	ref,
	uploadBytes,
	getDownloadURL,
	deleteObject,
} from "firebase/storage";
import {
	convertYearToTimestamp,
	getFieldValue,
	extractFieldsFromSections,
	stringToNumberIfNumeric,
} from "../../custom/customFunction";
import { insertAudit } from "../insert/insertAudit";

export async function updateMaterial(
	maID,
	li_id,
	us_id,
	formData,
	selectedMaterialType,
	holdings,
	subjects,
	files,
	setBtnloading,
	Alert
) {
	try {
		setBtnloading(true);

		const urls = {
			ma_coverURL: null,
			ma_softURL: null,
			ma_audioURL: null,
		};

		const qty = {
			ma_coverQty: holdings.length || 0,
			ma_softQty: stringToNumberIfNumeric(files.ma_softQty) || 0,
			ma_audioQty: stringToNumberIfNumeric(files.ma_audioQty) || 0,
		};

		const general = selectedMaterialType.mt_section[0].mt_fields;

		// --- Cover Image
		if (files.ma_coverURL instanceof File) {
			const coverRef = ref(storage, `material/${li_id.id}/cover_${Date.now()}`);
			const snapshot = await uploadBytes(coverRef, files.ma_coverURL);
			urls.ma_coverURL = await getDownloadURL(snapshot.ref);
		} else if (typeof files.ma_coverURL === "string") {
			urls.ma_coverURL = files.ma_coverURL;
		}

		// ✅ Delete old cover if exists
		if (
			(!files.ma_coverURL ||
				files.ma_coverURL instanceof File ||
				qty.ma_coverQty == 0) &&
			files.ma_coverDeleteURL
		) {
			try {
				const oldRef = ref(storage, getPathFromURL(files.ma_coverDeleteURL));
				await deleteObject(oldRef);
			} catch (err) {
				console.warn("Failed to delete old cover:", err.message);
			}
		}

		// --- Soft Copy (PDF)
		if (qty.ma_softQty > 0 && files.ma_softURL instanceof File) {
			const pdfRef = ref(storage, `material/${li_id.id}/soft_${Date.now()}`);
			const snapshot = await uploadBytes(pdfRef, files.ma_softURL);
			urls.ma_softURL = await getDownloadURL(snapshot.ref);
		} else if (typeof files.ma_softURL === "string") {
			urls.ma_softURL = files.ma_softURL;
		}

		// ✅ Delete old soft copy if exists
		if (
			(!files.ma_softURL ||
				files.ma_softURL instanceof File ||
				qty.ma_softQty == 0) &&
			files.ma_softDeleteURL
		) {
			try {
				const oldRef = ref(storage, getPathFromURL(files.ma_softDeleteURL));
				await deleteObject(oldRef);
			} catch (err) {
				console.warn("Failed to delete old soft copy:", err.message);
			}
		}

		// --- Audio Copy
		if (qty.ma_audioQty > 0 && files.ma_audioURL instanceof File) {
			const audioRef = ref(storage, `material/${li_id.id}/audio_${Date.now()}`);
			const snapshot = await uploadBytes(audioRef, files.ma_audioURL);
			urls.ma_audioURL = await getDownloadURL(snapshot.ref);
		} else if (typeof files.ma_audioURL === "string") {
			urls.ma_audioURL = files.ma_audioURL;
		}

		// ✅ Delete old audio if exists
		if (
			(!files.ma_audioURL ||
				files.ma_audioURL instanceof File ||
				qty.ma_audioQty == 0) &&
			files.ma_audioDeleteURL
		) {
			try {
				const oldRef = ref(storage, getPathFromURL(files.ma_audioDeleteURL));
				await deleteObject(oldRef);
			} catch (err) {
				console.warn("Failed to delete old audio:", err.message);
			}
		}

		// Reference to Firestore document
		const docRef = doc(db, "material", maID);

		await setDoc(
			docRef,
			{
				ma_liID: li_id,
				ma_mtID: doc(db, "materialType", formData.ma_materialType),
				ma_caID: doc(db, "category", formData.ma_materialCategory),
				ma_shID: doc(db, "shelves", formData.ma_shelf),
				ma_status: formData.ma_status || "Active",

				// Extracted values
				ma_libraryCall: getFieldValue(general, "Call Number"),
				ma_title: getFieldValue(general, "Title"),
				ma_author: getFieldValue(general, "Author"),
				ma_publication: getFieldValue(general, "Place of Publication"),
				ma_publisher: getFieldValue(general, "Publisher"),
				ma_copyright: convertYearToTimestamp(
					getFieldValue(general, "Copyright/Publication Year")
				),
				ma_pages: getFieldValue(general, "Pages"),
				ma_size: getFieldValue(general, "Size"),
				ma_isbn: getFieldValue(general, "ISBN"),
				ma_language: getFieldValue(general, "Language"),
				ma_description: getFieldValue(general, "Description"),

				// Others
				ma_fields: extractFieldsFromSections(selectedMaterialType.mt_section),
				ma_holdings: holdings,
				ma_subjects: subjects,

				// File URLs & Quantities
				ma_coverURL: urls.ma_coverURL,
				ma_coverQty: qty.ma_coverQty,
				ma_softURL: urls.ma_softURL,
				ma_softQty: qty.ma_softQty,
				ma_audioURL: urls.ma_audioURL,
				ma_audioQty: qty.ma_audioQty,

				ma_updatedAt: serverTimestamp(),
			},
			{ merge: true }
		);

		// Audit trail
		await insertAudit(
			li_id,
			us_id,
			"Update",
			`The material '${getFieldValue(
				general,
				"Title"
			)}' was updated successfully.`,
			Alert
		);

		Alert.showSuccess("Material updated successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
		console.error("updateMaterial error:", error);
	} finally {
		setBtnloading(false);
	}
}

function getPathFromURL(url) {
	return decodeURIComponent(url.split("/o/")[1].split("?")[0]);
}
