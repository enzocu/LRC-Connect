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
	trID,
	us_id,
	type,
	format,
	accession,
	affected,
	setBtnLoading,
	Alert
) {
	if (!us_id || !trID) {
		Alert.showDanger("Missing required user or transaction ID.");
		return;
	}

	try {
		setBtnLoading(true);

		// ✅ Cancel affected reservations
		for (const affectedItem of affected) {
			const affectedTrRef = doc(db, "transaction", affectedItem.id);
			const affectedTrSnap = await getDoc(affectedTrRef);

			if (affectedTrSnap.exists()) {
				const affectedTrData = affectedTrSnap.data();
				const userRef = affectedTrData.tr_usID;
				const userSnap = await getDoc(userRef);

				if (userSnap.exists()) {
					const userData = userSnap.data();
					const userName = `${userData.us_fname} ${userData.us_mname || ""} ${
						userData.us_lname
					}`
						.replace(/\s+/g, " ")
						.trim();
					const userEmail = userData.us_email;

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
							`Hi ${userName}, Reservation (ID: ${affectedTrData.tr_qr}) was cancelled due to conflict with a higher-priority booking. We follow a first-come, first-served policy.`,
							userEmail,
							Alert
						);
					} catch (e) {
						console.warn("Email to affected user failed:", e.message);
					}
				}
			}
		}

		// ✅ Mark main transaction as Utilized
		const targetTrRef = doc(db, "transaction", trID);
		const targetTrSnap = await getDoc(targetTrRef);

		if (targetTrSnap.exists()) {
			const targetData = targetTrSnap.data();
			const userRef = targetData.tr_usID;
			const userSnap = await getDoc(userRef);

			if (userSnap.exists()) {
				const userData = userSnap.data();
				const userName = `${userData.us_fname} ${userData.us_mname || ""} ${
					userData.us_lname
				}`
					.replace(/\s+/g, " ")
					.trim();
				const userEmail = userData.us_email;

				// Build update payload
				const updatePayload = {
					tr_status: "Utilized",
					tr_updatedAt: serverTimestamp(),
					tr_modifiedBy: doc(db, "users", us_id),
				};

				// Add accession only for Material + Hard Copy
				if (type === "Material" && format === "Hard Copy" && accession) {
					updatePayload.tr_accession = accession;
				}

				await updateDoc(targetTrRef, updatePayload);

				// Audit message
				let auditMessage = `Reservation (ID: '${targetData.tr_qr}') was marked as utilized.`;
				if (type === "Material" && format === "Hard Copy" && accession) {
					auditMessage += ` Accession: ${accession}`;
				}

				await insertAudit(
					targetData.tr_liID,
					us_id,
					"Utilized",
					auditMessage,
					Alert
				);

				// Email message
				let emailMessage = `Your reservation (ID: ${targetData.tr_qr}) has been marked as utilized. Thank you for using our library system.`;
				if (type === "Material" && format === "Hard Copy" && accession) {
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
		}

		Alert.showSuccess("Reservation status updated successfully.");
	} catch (error) {
		console.error("Error in markUtilized:", error);
		Alert.showDanger(error.message);
	} finally {
		setBtnLoading(false);
	}
}
