import {
	doc,
	updateDoc,
	addDoc,
	collection,
	getDoc,
	arrayUnion,
	serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import { sendEmail } from "../../custom/sendEmail";
import {
	convertDateToTimestamp,
	formatDateTime,
} from "../../custom/customFunction";
import { insertAudit } from "../insert/insertAudit";

export async function renewTransaction(
	us_id,
	transaction,
	newDateDue,
	setBtnLoading,
	Alert,
	router,
	setSuccess
) {
	try {
		setBtnLoading(true);

		const targetTrRef = doc(db, "transaction", transaction.id);
		const targetTrSnap = await getDoc(targetTrRef);

		if (!targetTrSnap.exists()) {
			throw new Error("Transaction not found.");
		}

		const targetData = targetTrSnap.data();
		const patronRef = targetData.tr_usID;
		const patronSnap = await getDoc(patronRef);

		if (!patronSnap.exists()) {
			throw new Error("Patron not found.");
		}

		const patronData = patronSnap.data();
		const patronName = `${patronData.us_fname} ${patronData.us_mname}. ${patronData.us_lname}`;
		const patronEmail = patronData.us_email;

		const newDueTimestamp = convertDateToTimestamp(newDateDue);

		// Check if new due date is later than current due date to create report
		if (targetData.tr_dateDue && newDueTimestamp > targetData.tr_dateDue) {
			await addDoc(collection(db, "report"), {
				re_liID: targetData.tr_liID,
				re_usID: patronRef,
				re_trID: targetTrRef,
				re_status: "Active",
				re_remarks: [
					`Late return — Expected End: ${formatDateTime(
						targetData.tr_dateDue
					)}, Actual Return: ${formatDateTime(newDueTimestamp)}`,
				],
				re_modifiedBy: doc(db, "users", us_id),
				re_createdAt: serverTimestamp(),
			});

			await insertAudit(
				targetData.tr_liID,
				us_id,
				"Report",
				`Late return report created for reservation (ID: '${
					targetData.tr_qr
				}') — Expected: ${formatDateTime(
					targetData.tr_dateDue
				)}, Actual: ${formatDateTime(newDueTimestamp)}.`,
				Alert
			);
		}

		// Update transaction with new due date
		await updateDoc(targetTrRef, {
			tr_dateDue: newDueTimestamp,
			tr_pastDueDate: arrayUnion(transaction.tr_dateDue),
			tr_updatedAt: serverTimestamp(),
			tr_modifiedBy: doc(db, "users", us_id),
		});

		await insertAudit(
			transaction.tr_liID,
			us_id,
			"Update",
			`Transaction '${transaction.tr_qr}' due date was renewed to '${newDateDue}'.`,
			Alert
		);

		// Send renewal email
		await sendEmail(
			"Reservation Renewed",
			patronName,
			`Reservation (ID: ${targetData.tr_qr}) has been renewed.\n\nNew Due Date: ${newDateDue}\n\nThank you for using our library services!`,
			patronEmail,
			Alert
		);

		Alert.showSuccess("Transaction renewed successfully and patron notified.");
		setSuccess(true);

		setTimeout(() => {
			setSuccess(false);
			setBtnLoading(false);
			router.push(`/transaction/details?id=${transaction.id}`);
		}, 3500);
	} catch (error) {
		console.error("Error in renewTransaction:", error);
		Alert.showDanger(error.message);
		setBtnLoading(false);
	}
}
