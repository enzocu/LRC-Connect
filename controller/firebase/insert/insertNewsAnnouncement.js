import { collection, addDoc, serverTimestamp, doc } from "firebase/firestore";
import { db, storage } from "../../../server/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { insertAudit } from "../insert/insertAudit";

export async function insertNewsAnnouncement(
	li_id,
	modifiedBy,
	type,
	formData,
	setBtnLoading,
	Alert
) {
	try {
		setBtnLoading(true);
		let na_photoURL = null;

		if (formData.na_photoURL) {
			const coverRef = ref(
				storage,
				`news_announcements/${li_id.id}/cover_${Date.now()}`
			);
			const snapshot = await uploadBytes(coverRef, formData.na_photoURL);
			na_photoURL = await getDownloadURL(snapshot.ref);
		}

		await addDoc(collection(db, "news_announcements"), {
			na_liID: li_id,
			na_author: doc(db, "users", modifiedBy),
			na_status: "Active",
			na_type: type,
			na_title: formData.na_title || null,
			na_content: formData.na_content || null,
			na_category: formData.na_category || null,
			na_visibility: formData.na_visibility || null,
			na_urgent: formData.na_urgent || false,
			na_photoURL: na_photoURL,
			na_readTime: "2 min",
			na_views: 245,
			na_createdAt: serverTimestamp(),
		});

		await insertAudit(
			li_id,
			modifiedBy,
			"Create",
			`News/Announcement titled '${formData.na_title}' was created.`,
			Alert
		);

		Alert.showSuccess("News/Announcement added successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
	} finally {
		setBtnLoading(false);
	}
}
