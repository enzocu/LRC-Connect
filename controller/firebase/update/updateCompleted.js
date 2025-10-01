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
import { formatDateTime } from "../../custom/customFunction";
import { insertAudit } from "../insert/insertAudit";

export async function markCompleted(us_id, transaction, setBtnLoading, Alert) {
	try {
		setBtnLoading(true);

		// Validate transaction
		if (!transaction?.id) {
			Alert.showDanger("Transaction not found.");
			return;
		}

		const patronRef = transaction.tr_usID;
		const patronSnap = await getDoc(patronRef);

		if (!patronSnap.exists()) {
			Alert.showDanger("User not found.");
			return;
		}

		const patronData = patronSnap.data();
		const patronName = `${patronData.us_fname} ${
			patronData.us_mname ? patronData.us_mname + "." : ""
		} ${patronData.us_lname}`
			.replace(/\s+/g, " ")
			.trim();
		const patronEmail = patronData.us_email;

		await updateDoc(transaction.tr_ref, {
			tr_status: "Completed",
			tr_actualEnd: serverTimestamp(),
			tr_updatedAt: serverTimestamp(),
			tr_modifiedBy: doc(db, "users", us_id),
		});

		const now = new Date();
		const expectedEnd =
			transaction.tr_type === "Material"
				? transaction.tr_dateDue?.toDate()
				: transaction.tr_sessionEnd?.toDate();

		if (expectedEnd && now > expectedEnd) {
			await addDoc(collection(db, "report"), {
				re_liID: transaction.tr_liID,
				re_usID: patronRef,
				re_trID: transaction.tr_ref,
				re_status: "Active",
				re_remarks: [
					`Late return — Expected End: ${formatDateTime(
						expectedEnd
					)}, Actual Return: ${formatDateTime(now)}`,
				],
				re_modifiedBy: doc(db, "users", us_id),
				re_createdAt: serverTimestamp(),
			});

			await insertAudit(
				transaction.tr_liID,
				us_id,
				"Report",
				`Late return report created for reservation (ID: '${
					transaction.tr_qr
				}') — Expected: ${formatDateTime(
					expectedEnd
				)}, Actual: ${formatDateTime(now)}.`,
				Alert
			);
		}

		await insertAudit(
			transaction.tr_liID,
			us_id,
			"Completed",
			`Reservation (ID: '${transaction.tr_qr}') was marked as completed.`,
			Alert
		);

		await sendEmail(
			"Reservation Completed",
			patronName,
			`Reservation (ID: ${transaction.tr_qr}) has been marked as *Completed*.\n\nThank you for using our library services! If you have any questions or concerns, feel free to contact us.`,
			patronEmail,
			Alert
		);

		Alert.showSuccess("Reservation marked as completed and patron notified.");
	} catch (error) {
		console.error("Error in markCompleted:", error);
		Alert.showDanger(error.message);
	} finally {
		setBtnLoading(false);
	}
}
