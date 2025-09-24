import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../../../server/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { insertAudit } from "../insert/insertAudit";

export async function updateNewsAnnouncement(
	naID,
	li_id,
	formData,
	modifiedBy,
	setBtnLoading,
	Alert
) {
	try {
		setBtnLoading(true);
		let na_photoURL = null;

		if (formData.na_photoURL instanceof File) {
			const coverRef = ref(
				storage,
				`news_announcements/${formData.na_liID.id}/cover_${Date.now()}`
			);
			const snapshot = await uploadBytes(coverRef, formData.na_photoURL);
			na_photoURL = await getDownloadURL(snapshot.ref);
		} else {
			na_photoURL = formData.na_photoURL;
		}

		await updateDoc(doc(db, "news_announcements", naID), {
			na_author: doc(db, "users", modifiedBy),
			na_title: formData.na_title || "",
			na_content: formData.na_content || "",
			na_category: formData.na_category || "",
			na_visibility: formData.na_visibility || "",
			na_urgent: formData.na_urgent || false,
			na_photoURL: na_photoURL,
			na_updatedAt: serverTimestamp(),
		});

		await insertAudit(
			li_id,
			modifiedBy,
			"Update",
			`News/Announcement was updated with title '${formData.na_title}'.`,
			Alert
		);

		Alert.showSuccess("News/Announcement updated successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
	} finally {
		setBtnLoading(false);
	}
}

export async function updateNewsAnnouncementStatus(
	naID,
	li_id,
	modifiedBy,
	setBtnLoading,
	Alert
) {
	try {
		setBtnLoading(true);

		await updateDoc(doc(db, "news_announcements", naID), {
			na_status: "Inactive",
			na_author: doc(db, "users", modifiedBy),
			na_updatedAt: serverTimestamp(),
		});

		await insertAudit(
			li_id,
			modifiedBy,
			"Deactivate",
			`News/Announcement ID: '${naID} status changed to 'Inactive'.`,
			Alert
		);

		Alert.showSuccess("News/Announcement status updated successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
	} finally {
		setBtnLoading(false);
	}
}
