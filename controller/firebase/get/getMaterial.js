import { getDoc, doc } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import { formatYear } from "../../custom/customFunction";

export async function getMaterial(
	maID,
	setRegisteredMaterialTypes,
	setFormData,
	setSelectedMaterialType,
	setSubjects,
	setHoldings,
	setFiles,
	setLoading,
	Alert
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

		if (!data.ma_mtID || !data.ma_caID || !data.ma_shID) {
			Alert.showDanger("Missing reference fields in material data.");
			return;
		}

		setFormData({
			id: maID,
			ma_status: data.ma_status,
			ma_materialType: data.ma_mtID.id,
			ma_materialCategory: data.ma_caID.id,
			ma_shelf: data.ma_shID.id,
			ma_acquisitionType: data.ma_acquisitionType || "Donated",
			ma_donor: data.ma_donor || "",
			ma_pricePerItem: data.ma_pricePerItem || "",
		});

		setSubjects(data.ma_subjects);
		setHoldings(data.ma_holdings);

		setFiles({
			ma_coverURL: data.ma_coverURL || "",
			ma_coverDeleteURL: data.ma_coverURL || null,
			ma_coverQty: data.ma_coverQty || 0,

			ma_softURL: data.ma_softURL || "",
			ma_softDeleteURL: data.ma_softURL || null,
			ma_softQty: data.ma_softQty || 0,

			ma_audioURL: data.ma_audioURL || "",
			ma_audioDeleteURL: data.ma_audioURL || null,
			ma_audioQty: data.ma_audioQty || 0,
		});

		const mtDocSnap = await getDoc(data.ma_mtID);

		if (mtDocSnap.exists()) {
			const mtData = mtDocSnap.data();

			setRegisteredMaterialTypes([
				{
					mt_id: mtDocSnap.id,
					...mtData,
				},
			]);

			let MaterialType = {
				mt_id: mtDocSnap.id,
				...mtData,
				mt_section: [],
			};

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
									value = data.ma_publication || "NA";
									break;
								case "Copyright/Publication Year":
									value = formatYear(data.ma_copyright);
									break;
								case "Pages":
									value = data.ma_pages || "NA";
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
									value = "NA";
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
							mt_type: field.mt_type,
							mt_value: value,
						};
					})
					.filter((f) => f.mt_value !== null && f.mt_value !== "");

				if (fieldsWithValues.length > 0) {
					MaterialType.mt_section.push({
						mt_section: item.mt_section,
						mt_fields: fieldsWithValues,
					});
				}
			});

			setSelectedMaterialType(MaterialType);
		} else {
			Alert.showDanger("Material type info not found.");
		}
	} catch (error) {
		Alert.showDanger(error.message);
		console.error("getMaterial error:", error);
	} finally {
		setLoading(false);
	}
}
