import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";

import { insertAudit } from "../insert/insertAudit";

export async function updateFeedbackRead(
	feID,
	li_id,
	type,
	status = false,
	modifiedBy,
	Alert
) {
	try {
		await updateDoc(doc(db, "feedback", feID), {
			fe_isRead: status ? false : true,
			fe_modifiedBy: doc(db, "users", modifiedBy),
			fe_updatedAt: serverTimestamp(),
		});

		await insertAudit(
			li_id,
			modifiedBy,
			"Update",
			`Feedback '${type}' (ID: '${feID}') was marked as ${
				status ? "unread" : "read"
			}.`,
			Alert
		);

		Alert.showSuccess(`Successfully marked as ${status ? "unread" : "read"}!`);
	} catch (error) {
		Alert.showDanger(error.message);
	}
}
