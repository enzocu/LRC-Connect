import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../../../server/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
	convertTimeToTimestamp,
	convertDateToTimestamp,
} from "../../custom/customFunction";

import { insertAudit } from "../insert/insertAudit";

export async function updateComputer(
	coID,
	li_id,
	us_id,
	formData,
	setBtnloading,
	Alert
) {
	try {
		setBtnloading(true);
		let co_photoURL = null;

		if (formData.co_photoURL instanceof File) {
			const coverRef = ref(
				storage,
				`computers/${li_id.id}/cover_${Date.now()}`
			);
			const snapshot = await uploadBytes(coverRef, formData.co_photoURL);
			co_photoURL = await getDownloadURL(snapshot.ref);
		} else if (typeof formData.co_photoURL === "string") {
			co_photoURL = formData.co_photoURL;
		}

		const co_date = convertDateToTimestamp(formData.co_date);
		const co_minDuration = convertTimeToTimestamp(formData.co_minDuration);
		const co_maxDuration = convertTimeToTimestamp(formData.co_maxDuration);

		const computerRef = doc(db, "computers", coID);

		await updateDoc(computerRef, {
			co_name: formData.co_name || null,
			co_date,
			co_assetTag: formData.co_assetTag || null,
			co_description: formData.co_description || null,
			co_minDuration,
			co_maxDuration,
			co_specifications: formData.co_specifications || null,
			co_photoURL: co_photoURL || null,
			co_updatedAt: serverTimestamp(),
		});

		await insertAudit(
			li_id,
			us_id,
			"Update",
			`Computer '${formData.co_name}' was updated successfully.`,
			Alert
		);

		Alert.showSuccess("Computer updated successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
	} finally {
		setBtnloading(false);
	}
}
