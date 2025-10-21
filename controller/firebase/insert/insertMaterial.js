"use client";

import { doc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../../../server/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { generateQrID } from "../../firebase/get/getGeneratedQR";
import {
	convertYearToTimestamp,
	getFieldValue,
	extractFieldsFromSections,
	stringToNumberIfNumeric,
} from "../../custom/customFunction";

import { insertAudit } from "../insert/insertAudit";

export async function insertMaterial(
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

		// Upload cover image
		if (files.ma_coverURL) {
			const coverRef = ref(storage, `material/${li_id.id}/cover_${Date.now()}`);
			const snapshot = await uploadBytes(coverRef, files.ma_coverURL);
			urls.ma_coverURL = await getDownloadURL(snapshot.ref);
		}

		// Upload soft copy (PDF)
		if (qty.ma_softQty > 0 && files.ma_softURL) {
			const pdfRef = ref(storage, `material/${li_id.id}/soft_${Date.now()}`);
			const snapshot = await uploadBytes(pdfRef, files.ma_softURL);
			urls.ma_softURL = await getDownloadURL(snapshot.ref);
		}

		// Upload audio file
		if (qty.ma_audioQty > 0 && files.ma_audioURL) {
			const audioRef = ref(storage, `material/${li_id.id}/audio_${Date.now()}`);
			const snapshot = await uploadBytes(audioRef, files.ma_audioURL);
			urls.ma_audioURL = await getDownloadURL(snapshot.ref);
		}

		// Generate QR
		const ma_qr = await generateQrID("material", "MTL");

		// Save to Firestore
		await addDoc(collection(db, "material"), {
			ma_qr: ma_qr,
			ma_liID: li_id,
			ma_mtID: doc(db, "materialType", formData.ma_materialType),
			ma_caID: doc(db, "category", formData.ma_materialCategory),
			ma_shID: doc(db, "shelves", formData.ma_shelf),
			ma_shID: doc(db, "shelves", formData.ma_shelf),
			ma_acquisitionType: formData.ma_acquisitionType || "Purchased",
			ma_donor: doc(db, "donors", formData.ma_donor),
			ma_pricePerItem: parseFloat(formData.ma_pricePerItem) || 0,
			ma_status: "Active",

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

			ma_fields: extractFieldsFromSections(selectedMaterialType.mt_section),
			ma_holdings: holdings,
			ma_subjects: subjects,

			ma_coverURL: urls.ma_coverURL,
			ma_coverQty: qty.ma_coverQty,
			ma_softURL: urls.ma_softURL,
			ma_softQty: qty.ma_softQty,
			ma_audioURL: urls.ma_audioURL,
			ma_audioQty: qty.ma_audioQty,
			ma_createdAt: serverTimestamp(),
		});

		// Insert into audit trail
		await insertAudit(
			li_id,
			us_id,
			"Create",
			`A new material '${getFieldValue(
				general,
				"Title"
			)}' was registered with QR '${ma_qr}'.`,
			Alert
		);

		Alert.showSuccess("Material inserted successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
		console.log(error.message);
	} finally {
		setBtnloading(false);
	}
}
