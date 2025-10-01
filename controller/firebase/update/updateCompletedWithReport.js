import {
	doc,
	updateDoc,
	serverTimestamp,
	getDoc,
	collection,
	addDoc,
} from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import { sendEmail } from "../../custom/sendEmail";

import { insertAudit } from "../insert/insertAudit";

export async function markCompletedWithReport(
	transaction,
	us_id,
	reports = [],
	setBtnLoading,
	Alert
) {
	try {
		setBtnLoading(true);

		if (!transaction.id) {
			Alert.showDanger("Transaction not found.");
			return;
		}

		if (!reports || reports.length === 0) {
			Alert.showDanger("No reports provided.");
			return;
		}

		const patronRef = transaction.tr_usID;
		const patronSnap = await getDoc(patronRef);

		if (!patronSnap.exists()) {
			Alert.showDanger("User not found.");
			return;
		}

		const patronData = patronSnap.data();
		const patronName = `${patronData.us_fname} ${patronData.us_mname || ""} ${
			patronData.us_lname
		}`
			.replace(/\s+/g, " ")
			.trim();
		const patronEmail = patronData.us_email;

		await updateDoc(transaction.tr_ref, {
			tr_status: "Completed",
			tr_updatedAt: serverTimestamp(),
			tr_actualEnd: serverTimestamp(),
			tr_modifiedBy: doc(db, "users", us_id),
		});

		await addDoc(collection(db, "report"), {
			re_liID: transaction.tr_liID,
			re_usID: patronRef,
			re_trID: transaction.tr_ref,
			re_status: "Active",
			re_remarks: reports,
			re_modifiedBy: doc(db, "users", us_id),
			re_createdAt: serverTimestamp(),
		});

		await insertAudit(
			transaction.tr_liID,
			us_id,
			"Completed",
			`Reservation (ID: ${
				transaction.tr_qr
			}) marked as completed. Report(s) filed: ${reports.join(", ")}.`,
			Alert
		);

		await sendEmail(
			"Reservation Completed (Report Filed)",
			patronName,
			`Hi ${patronName},

			Reservation (ID: ${
				transaction.tr_qr
			}) has been successfully marked as 'Completed'.

			Please note: The library staff has filed a report related to this transaction. This may include damages, missing components, or other relevant issues.

			Summary of report:
			${reports.map((r) => `- ${r}`).join("\n")}

			If you believe this was a mistake or have questions, please contact the library staff.

			Thank you.`,
			patronEmail,
			Alert
		);

		Alert.showSuccess("Marked as completed with report. Patron notified.");
	} catch (error) {
		console.error("Error in markCompletedWithReport:", error);
		Alert.showDanger(error.message);
	} finally {
		setBtnLoading(false);
	}
}
