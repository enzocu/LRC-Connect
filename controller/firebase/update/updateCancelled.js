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
	transaction,
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

		if (transaction?.id) {
			const patronRef = transaction.tr_usID;
			const patronSnap = await getDoc(patronRef);

			if (patronSnap.exists()) {
				const patronData = patronSnap.data();

				const patronName = [
					patronData.us_fname,
					patronData.us_mname ? patronData.us_mname.charAt(0) + "." : "",
					patronData.us_lname,
				]
					.filter(Boolean)
					.join(" ")
					.trim();

				const patronEmail = patronData.us_email;

				await updateDoc(transaction.tr_ref, {
					tr_status: "Cancelled",
					tr_remarks: arrayUnion(...sanitizedReasons),
					tr_updatedAt: serverTimestamp(),
					tr_modifiedBy: doc(db, "users", us_id),
				});

				await insertAudit(
					transaction.tr_liID,
					us_id,
					"Cancelled",
					`Reservation (ID: '${
						transaction.tr_qr
					}') was cancelled for reason(s): ${sanitizedReasons.join(", ")}.`,
					Alert
				);

				await sendEmail(
					"Reservation Cancelled",
					patronName,
					`Reservation (ID: ${
						transaction.tr_qr
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
		Alert.showDanger(error.message || "An error occurred while cancelling.");
	} finally {
		setBtnLoading(false);
	}
}
