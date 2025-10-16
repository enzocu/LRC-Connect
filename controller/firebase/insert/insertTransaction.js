import { collection, addDoc, serverTimestamp, doc } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import { generateQrID } from "../../firebase/get/getGeneratedQR";
import { sendEmail } from "../../custom/sendEmail";
import {
	convertDateToTimestamp,
	combineDateAndTimeToTimestamp,
} from "../../custom/customFunction";
import { insertAudit } from "../insert/insertAudit";
import { handleAffectedCancellations } from "../../firebase/update/updateMarkUtilized";

export async function insertTransaction(
	us_id,
	resourceType,
	transactionType,
	accession,
	transactionDetails,
	resourceData,
	patronData,
	affected = [],
	setBtnloading,
	Alert,
	router,
	setSuccess
) {
	try {
		setBtnloading(true);

		const tr_id = await generateQrID("transaction", "TRN");

		const useDate = convertDateToTimestamp(transactionDetails.date);
		const dateDue = convertDateToTimestamp(transactionDetails.dateDue);
		const sessionStart = combineDateAndTimeToTimestamp(
			useDate,
			transactionDetails.sessionStart
		);
		const sessionEnd = combineDateAndTimeToTimestamp(
			useDate,
			transactionDetails.sessionEnd
		);

		const payload = {
			tr_format: transactionDetails?.format || null,
			tr_useDate: useDate,
			tr_dateDue: dateDue,
			tr_sessionStart: sessionStart,
			tr_sessionEnd: sessionEnd,
			tr_type: resourceType,
			tr_qr: tr_id,
			tr_createdAt: serverTimestamp(),
			tr_usID: doc(db, "users", patronData?.id),
			tr_modifiedBy: doc(db, "users", us_id),
		};

		if (resourceType === "Material") {
			payload.tr_liID = resourceData.ma_liID;
			payload.tr_maID = doc(db, "material", resourceData.id);
		} else if (resourceType === "Discussion Room") {
			payload.tr_liID = resourceData.dr_liID;
			payload.tr_drID = doc(db, "discussionrooms", resourceData.id);
		} else if (resourceType === "Computer") {
			payload.tr_liID = resourceData.co_liID;
			payload.tr_coID = doc(db, "computers", resourceData.id);
		}

		const isUtilized = transactionType === "Utilize";
		payload.tr_status = isUtilized ? "Utilized" : "Reserved";

		if (isUtilized) {
			payload.tr_updatedAt = serverTimestamp();

			if (
				resourceType === "Material" &&
				transactionDetails?.format === "Hard Copy" &&
				accession
			) {
				payload.tr_accession = accession;
			}
		}

		const docRef = await addDoc(collection(db, "transaction"), payload);

		if (isUtilized) {
			await handleAffectedCancellations(affected, us_id, Alert);
		}

		const userName = `${patronData?.us_fname} ${
			patronData?.us_mname ? patronData.us_mname + " " : ""
		}${patronData?.us_lname}`.trim();
		const userEmail = patronData?.us_email;

		const action = isUtilized ? "Utilized" : "Reserved";
		const auditMessage = isUtilized
			? `Reservation (ID: '${tr_id}') was marked as utilized${
					accession ? ` with Accession: ${accession}` : ""
			  }.`
			: `A new ${resourceType} reservation was created with ID '${tr_id}'.`;

		const emailSubject = isUtilized
			? "Reservation Utilized"
			: "Reservation Confirmed";
		const emailMessage = isUtilized
			? `Your reservation (ID: ${tr_id}) has been marked as utilized. Thank you for using our library system.${
					accession ? `\n\nAssigned Accession: ${accession}` : ""
			  }`
			: `Your ${resourceType} reservation (ID: ${tr_id}) has been reserved successfully. Please make sure to use or claim it on time.`;

		await insertAudit(payload.tr_liID, us_id, action, auditMessage, Alert);
		await sendEmail(emailSubject, userName, emailMessage, userEmail, Alert);

		Alert.showSuccess(
			`Transaction ${isUtilized ? "utilized" : "reserved"} and email sent!`
		);
		setSuccess(true);

		setTimeout(() => {
			setSuccess(false);
			setBtnloading(false);
			router.push(`/transaction/details?id=${docRef.id}`);
		}, 3000);
	} catch (error) {
		console.error("Insert Error:", error);
		Alert.showDanger(error.message || "Failed to insert transaction.");
	} finally {
		setBtnloading(false);
	}
}
