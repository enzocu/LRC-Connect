import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../../../server/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { generateQrID } from "../../firebase/get/getGeneratedQR";
import {
	convertTimeToTimestamp,
	convertDateToTimestamp,
} from "../../custom/customFunction";

import { insertAudit } from "../insert/insertAudit";

export async function insertComputer(
	li_id,
	us_id,
	formData,
	setBtnloading,
	Alert
) {
	try {
		setBtnloading(true);
		let co_photoURL = null;

		if (formData.co_photoURL) {
			const coverRef = ref(
				storage,
				`computers/${li_id.id}/cover_${Date.now()}`
			);
			const snapshot = await uploadBytes(coverRef, formData.co_photoURL);
			co_photoURL = await getDownloadURL(snapshot.ref);
		}

		const co_qr = await generateQrID("computers", "CMP");

		const co_minDuration = convertTimeToTimestamp(formData.co_minDuration);
		const co_maxDuration = convertTimeToTimestamp(formData.co_maxDuration);

		await addDoc(collection(db, "computers"), {
			co_qr,
			co_liID: li_id,
			co_status: formData.co_status || "",
			co_name: formData.co_name || "",
			co_date: convertDateToTimestamp(formData.co_date),
			co_assetTag: formData.co_assetTag || "",
			co_description: formData.co_description || "",
			co_minDuration,
			co_maxDuration,
			co_specifications: formData.co_specifications || "",
			co_photoURL: co_photoURL || "",
			co_createdAt: serverTimestamp(),
		});

		await insertAudit(
			li_id,
			us_id,
			"Create",
			`A new computer '${formData.co_name}' was added with QR '${co_qr}'.`,
			Alert
		);

		Alert.showSuccess("Computer inserted successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
	} finally {
		setBtnloading(false);
	}
}
