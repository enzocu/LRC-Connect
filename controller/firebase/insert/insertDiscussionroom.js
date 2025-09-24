import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../../../server/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { generateQrID } from "../../firebase/get/getGeneratedQR";
import { convertTimeToTimestamp } from "../../custom/customFunction";

import { insertAudit } from "../insert/insertAudit";

export async function insertDiscussionroom(
	li_id,
	us_id,
	formData,
	setBtnloading,
	Alert
) {
	try {
		setBtnloading(true);

		let dr_photoURL = null;

		if (formData.dr_photoURL) {
			const photoRef = ref(
				storage,
				`discussionrooms/${li_id.id}/photo_${Date.now()}`
			);
			const snapshot = await uploadBytes(photoRef, formData.dr_photoURL);
			dr_photoURL = await getDownloadURL(snapshot.ref);
		}

		const dr_qr = await generateQrID("discussionrooms", "DRM");

		const dr_minDuration = convertTimeToTimestamp(formData.dr_minDuration);
		const dr_maxDuration = convertTimeToTimestamp(formData.dr_maxDuration);

		await addDoc(collection(db, "discussionrooms"), {
			dr_qr,
			dr_liID: li_id,
			dr_status: formData.dr_status || "Active",
			dr_name: formData.dr_name || "",
			dr_capacity: formData.dr_capacity || "",
			dr_description: formData.dr_description || "",
			dr_minDuration,
			dr_maxDuration,
			dr_equipment: formData.dr_equipment || "",
			dr_photoURL: dr_photoURL || "",
			dr_createdAt: serverTimestamp(),
		});

		await insertAudit(
			li_id,
			us_id,
			"Create",
			`A new Discussion Room '${
				formData.dr_name || "Untitled"
			}' was created with QR '${dr_qr}'.`,
			Alert
		);

		Alert.showSuccess("Discussion room inserted successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
	} finally {
		setBtnloading(false);
	}
}
