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

export async function markUtilized(
	transaction,
	us_id,
	accession,
	affected = [],
	setBtnLoading,
	Alert
) {
	if (!us_id || !transaction?.id) {
		Alert.showDanger("Missing required user or transaction ID.");
		return;
	}

	try {
		setBtnLoading(true);

		for (const affectedItem of affected) {
			const affectedTrRef = doc(db, "transaction", affectedItem.id);
			const affectedTrSnap = await getDoc(affectedTrRef);

			if (affectedTrSnap.exists()) {
				const affectedTrData = affectedTrSnap.data();
				const userRef = affectedTrData.tr_usID;
				const userSnap = await getDoc(userRef);

				if (userSnap.exists()) {
					const userData = userSnap.data();
					const userName = `${userData.us_fname} ${
						userData.us_mname ? userData.us_mname + " " : ""
					}${userData.us_lname}`
						.replace(/\s+/g, " ")
						.trim();
					const userEmail = userData.us_email;

					// Cancel their transaction
					await updateDoc(affectedTrRef, {
						tr_status: "Cancelled",
						tr_remarks: arrayUnion(
							"Your reservation was cancelled due to scheduling conflict. First come, first served policy applies."
						),
						tr_updatedAt: serverTimestamp(),
						tr_modifiedBy: doc(db, "users", us_id),
					});

					await insertAudit(
						affectedTrData.tr_liID,
						us_id,
						"Cancelled",
						`Reservation (ID: '${affectedTrData.tr_qr}') was cancelled due to scheduling conflict.`,
						Alert
					);

					try {
						await sendEmail(
							"Reservation Cancelled",
							userName,
							`Hi ${userName},\n\nReservation (ID: ${affectedTrData.tr_qr}) was cancelled due to conflict with a higher-priority booking. We follow a first-come, first-served policy.\n\nThank you for understanding.`,
							userEmail,
							Alert
						);
					} catch (e) {
						console.warn("Email to affected user failed:", e.message);
					}
				}
			}
		}

		const userRef = transaction.tr_usID;
		const userSnap = await getDoc(userRef);

		if (userSnap.exists()) {
			const userData = userSnap.data();
			const userName = `${userData.us_fname} ${
				userData.us_mname ? userData.us_mname + " " : ""
			}${userData.us_lname}`
				.replace(/\s+/g, " ")
				.trim();
			const userEmail = userData.us_email;

			const updatePayload = {
				tr_status: "Utilized",
				tr_updatedAt: serverTimestamp(),
				tr_modifiedBy: doc(db, "users", us_id),
			};

			if (
				transaction.tr_type === "Material" &&
				transaction.tr_format === "Hard Copy" &&
				accession
			) {
				updatePayload.tr_accession = accession;
			}

			await updateDoc(transaction.tr_ref, updatePayload);

			let auditMessage = `Reservation (ID: '${transaction.tr_qr}') was marked as utilized.`;
			if (
				transaction.tr_type === "Material" &&
				transaction.tr_format === "Hard Copy" &&
				accession
			) {
				auditMessage += ` Assigned Accession: ${accession}`;
			}

			await insertAudit(
				transaction.tr_liID,
				us_id,
				"Utilized",
				auditMessage,
				Alert
			);

			let emailMessage = `Your reservation (ID: ${transaction.tr_qr}) has been marked as utilized. Thank you for using our library system.`;
			if (
				transaction.tr_type === "Material" &&
				transaction.tr_format === "Hard Copy" &&
				accession
			) {
				emailMessage += `\n\nAssigned Accession: ${accession}`;
			}

			try {
				await sendEmail(
					"Reservation Utilized",
					userName,
					emailMessage,
					userEmail,
					Alert
				);
			} catch (e) {
				console.warn("Email to main user failed:", e.message);
			}
		}

		Alert.showSuccess("Reservation status updated successfully.");
	} catch (error) {
		console.error("Error in markUtilized:", error);
		Alert.showDanger(error.message);
	} finally {
		setBtnLoading(false);
	}
}
