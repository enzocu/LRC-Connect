import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../../../server/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { convertTimeToTimestamp } from "../../custom/customFunction";

import { insertAudit } from "../insert/insertAudit";

export async function updateDiscussionroom(
	discussionroomID,
	li_id,
	us_id,
	formData,
	setBtnloading,
	Alert
) {
	try {
		setBtnloading(true);

		let dr_photoURL = null;

		if (formData.dr_photoURL instanceof File) {
			const photoRef = ref(
				storage,
				`discussionrooms/${li_id.id}/photo_${Date.now()}`
			);
			const snapshot = await uploadBytes(photoRef, formData.dr_photoURL);
			dr_photoURL = await getDownloadURL(snapshot.ref);
		} else if (typeof formData.dr_photoURL === "string") {
			dr_photoURL = formData.dr_photoURL;
		}

		const dr_minDuration = convertTimeToTimestamp(formData.dr_minDuration);
		const dr_maxDuration = convertTimeToTimestamp(formData.dr_maxDuration);

		const discussionroomRef = doc(db, "discussionrooms", discussionroomID);

		await updateDoc(discussionroomRef, {
			dr_status: formData.dr_status || "Active",
			dr_name: formData.dr_name || "",
			dr_capacity: formData.dr_capacity || "",
			dr_description: formData.dr_description || "",
			dr_minDuration,
			dr_maxDuration,
			dr_equipment: formData.dr_equipment || "",
			dr_photoURL: dr_photoURL || "",
			dr_updatedAt: serverTimestamp(),
		});

		await insertAudit(
			li_id,
			us_id,
			"Update",
			`Discussion room '${formData.dr_name}' was updated successfully.`,
			Alert
		);

		Alert.showSuccess("Discussion room updated successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
	} finally {
		setBtnloading(false);
	}
}
