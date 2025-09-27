import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../../../server/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { insertAudit } from "../insert/insertAudit";

export async function updateLibrary(
	li_id,
	us_id,
	formData,
	setBtnloading,
	Alert
) {
	try {
		setBtnloading(true);
		let li_photoURL = null;

		if (formData.li_photoURL instanceof File) {
			const photoRef = ref(storage, `library/photo_${Date.now()}`);
			const snapshot = await uploadBytes(photoRef, formData.li_photoURL);
			li_photoURL = await getDownloadURL(snapshot.ref);
		} else if (typeof formData.li_photoURL === "string") {
			li_photoURL = formData.li_photoURL;
		}

		const libraryRef = doc(db, "library", li_id);

		await updateDoc(libraryRef, {
			li_schoolID: formData.li_schoolID || null,
			li_name: formData.li_name || null,
			li_schoolname: formData.li_schoolname || null,
			li_email: formData.li_email || null,
			li_phone: formData.li_phone || null,
			li_description: formData.li_description || null,
			li_address: formData.li_address || null,
			li_latlng: formData.li_latlng || null,
			li_photoURL: li_photoURL || null,
			li_updatedAt: serverTimestamp(),
		});

		await insertAudit(
			li_id,
			us_id,
			"Update",
			`Library '${formData.li_name}' information was updated successfully.`,
			Alert
		);

		Alert.showSuccess("Library updated successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
	} finally {
		setBtnloading(false);
	}
}
