import { updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import { markCancelled } from "../update/updateMarkCancelled";

import { insertAudit } from "../insert/insertAudit";

export async function deactiveResource(
	type,
	id,
	status,
	li_id,
	modifiedId,
	title,
	qr,
	reason = [],
	setBtnLoading,
	Alert
) {
	setBtnLoading(true);

	try {
		const ref = doc(db, type, id);

		const prefix =
			type === "material"
				? "ma"
				: type === "computers"
				? "co"
				: type === "discussionrooms"
				? "dr"
				: type === "library"
				? "li"
				: null;

		if (!prefix) throw new Error("Invalid resource type.");

		const updateData = {
			[`${prefix}_status`]: status,
			[`${prefix}_updatedAt`]: serverTimestamp(),
			[`${prefix}_remarks`]: reason,
		};

		await updateDoc(ref, updateData);

		await insertAudit(
			li_id,
			modifiedId,
			"Update",
			`${title} (QR: ${qr}) status updated to '${status}'.`,
			Alert
		);

		if (status === "Inactive") {
			const refField =
				type === "users"
					? "tr_usID"
					: type === "material"
					? "tr_maID"
					: type === "discussionrooms"
					? "tr_drID"
					: type === "library"
					? "tr_liID"
					: "tr_coID";

			await markCancelled(id, title, refField, type, modifiedId, reason, Alert);
		}

		Alert.showSuccess(`Status changed to "${status}" successfully.`);
	} catch (error) {
		console.error("deactiveResource Error:", error);
		Alert.showDanger(error.message);
	} finally {
		setBtnLoading(false);
	}
}
