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

		if (!transaction.id) {
			throw new Error("Transaction not found.");
		}

		const patronRef = transaction.tr_usID;
		const patronSnap = await getDoc(patronRef);

		if (!patronSnap.exists()) {
			throw new Error("Patron not found.");
		}

		const patronData = patronSnap.data();
		const patronName = `${patronData.us_fname} ${patronData.us_mname}. ${patronData.us_lname}`;
		const patronEmail = patronData.us_email;

		const newDueTimestamp = convertDateToTimestamp(newDateDue);
		const now = new Date();

		let isOverdue = false;

		if (transaction.tr_dateDue && now > transaction.tr_dateDue?.toDate()) {
			isOverdue = true;

			await addDoc(collection(db, "report"), {
				re_liID: transaction.tr_liID,
				re_usID: patronRef,
				re_trID: transaction.tr_ref,
				re_status: "Active",
				re_remarks: [
					`Overdue renewal — Previous Due: ${formatDateTime(
						transaction.tr_dateDue
					)}, Renewed To: ${formatDateTime(
						newDueTimestamp
					)}. Renewal was late, with penalty since it is late to renew.`,
				],
				re_modifiedBy: doc(db, "users", us_id),
				re_createdAt: serverTimestamp(),
			});

			await insertAudit(
				transaction.tr_liID,
				us_id,
				"Report",
				`Overdue renewal recorded for reservation (ID: '${transaction.tr_qr}'). 
				 Previous Due: ${formatDateTime(transaction.tr_dateDue)}, 
				 Renewed To: ${formatDateTime(
						newDueTimestamp
					)}. Renewal was late, with penalty since it is late to renew.`,
				Alert
			);
		}

		await updateDoc(transaction.tr_ref, {
			tr_dateDue: newDueTimestamp,
			tr_pastDueDate: arrayUnion({
				previousDue: transaction.tr_dateDue,
				renewedAt: new Date(),
			}),
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

		// Build email message
		let emailMessage = `Your reservation (ID: ${transaction.tr_qr}) has been renewed.\n\nNew Due Date: ${newDateDue}\n\n`;
		if (isOverdue) {
			emailMessage +=
				"Note: The renewal was processed after the due date, with penalty since it is late to renew.\n\n";
		}
		emailMessage += "Thank you for using our library services!";

		// Send renewal email
		await sendEmail(
			"Reservation Renewed",
			patronName,
			emailMessage,
			patronEmail,
			Alert
		);

		Alert.showSuccess(
			`Transaction renewed successfully. Patron notified ${
				isOverdue ? " (penalty still applies)." : "."
			}.`
		);

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
