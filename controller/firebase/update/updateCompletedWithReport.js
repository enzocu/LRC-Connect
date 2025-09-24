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
	trID,
	us_id,
	reports = [],
	setBtnLoading,
	Alert
) {
	try {
		setBtnLoading(true);

		const targetTrRef = doc(db, "transaction", trID);
		const targetTrSnap = await getDoc(targetTrRef);

		if (!targetTrSnap.exists()) {
			Alert.showDanger("Transaction not found.");
			return;
		}

		const targetData = targetTrSnap.data();
		const patronRef = targetData.tr_usID;
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

		await updateDoc(targetTrRef, {
			tr_status: "Completed",
			tr_updatedAt: serverTimestamp(),
			tr_actualEnd: serverTimestamp(),
			tr_modifiedBy: doc(db, "users", us_id),
		});

		await addDoc(collection(db, "report"), {
			re_liID: targetData.tr_liID,
			re_usID: patronRef,
			re_trID: targetTrRef,
			re_status: "Active",
			re_remarks: reports,
			re_modifiedBy: doc(db, "users", us_id),
			re_createdAt: serverTimestamp(),
		});

		await insertAudit(
			targetData.tr_liID,
			us_id,
			"Completed",
			`Reservation (ID: '${
				targetData.tr_qr
			}') was marked as completed with report: ${reports.join(", ")}.`,
			Alert
		);

		await sendEmail(
			"Reservation Completed (Report Filed)",
			patronName,
			`Hi ${patronName},
  
			Your reservation (ID: ${
				targetData.tr_qr
			}) has been successfully marked as 'completed'.
			
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
