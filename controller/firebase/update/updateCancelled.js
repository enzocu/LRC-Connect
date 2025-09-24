import {
	doc,
	updateDoc,
	serverTimestamp,
	getDoc,
	arrayUnion,
} from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import { sendEmail } from "../../custom/sendEmail";

import { insertAudit } from "../insert/insertAudit";

export async function markCancelled(
	trID,
	us_id,
	reason = [],
	setBtnLoading,
	Alert
) {
	try {
		setBtnLoading(true);

		const sanitizedReasons = Array.isArray(reason)
			? reason.filter(Boolean)
			: [];

		if (sanitizedReasons.length === 0) {
			Alert.showDanger("No reason provided for cancellation.");
			return;
		}

		const targetTrRef = doc(db, "transaction", trID);
		const targetTrSnap = await getDoc(targetTrRef);

		if (targetTrSnap.exists()) {
			const targetData = targetTrSnap.data();
			const patronRef = targetData.tr_usID;
			const patronSnap = await getDoc(patronRef);

			if (patronSnap.exists()) {
				const patronData = patronSnap.data();
				const patronName =
					`${patronData.us_fname} ${patronData.us_mname}. ${patronData.us_lname}`
						.replace(/\s+/g, " ")
						.trim();
				const patronEmail = patronData.us_email;

				await updateDoc(targetTrRef, {
					tr_status: "Cancelled",
					tr_remarks: arrayUnion(...sanitizedReasons),
					tr_updatedAt: serverTimestamp(),
					tr_modifiedBy: doc(db, "users", us_id),
				});

				await insertAudit(
					targetData.tr_liID,
					us_id,
					"Cancelled",
					`Reservation (ID: '${
						targetData.tr_qr
					}') was cancelled for reason(s): ${sanitizedReasons.join(", ")}.`,
					Alert
				);

				await sendEmail(
					"Reservation Cancelled",
					patronName,
					`Your reservation (ID: ${
						targetData.tr_qr
					}) has been cancelled for the following reason(s):\n\n- ${sanitizedReasons.join(
						"\n- "
					)}\n\nIf you have questions, feel free to reach out to the library staff.`,
					patronEmail,
					Alert
				);
			}
		}

		Alert.showSuccess("Reservation cancelled and patron notified.");
	} catch (error) {
		console.error("Error in markCancelled:", error);
		Alert.showDanger(error.message);
	} finally {
		setBtnLoading(false);
	}
}
