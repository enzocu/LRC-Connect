import { collection, addDoc, serverTimestamp, doc } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import { generateQrID } from "../../firebase/get/getGeneratedQR";
import { sendEmail } from "../../custom/sendEmail";
import {
	convertDateToTimestamp,
	combineDateAndTimeToTimestamp,
} from "../../custom/customFunction";

import { insertAudit } from "../insert/insertAudit";

export async function insertTransaction(
	us_id,
	resourceType,
	transactionDetails,
	resourceData,
	patronData,
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
			tr_status: "Reserved",
			tr_qr: tr_id,
			tr_createdAt: serverTimestamp(),
			tr_usID: doc(db, "users", patronData?.id),
			tr_modifiedBy: doc(db, "users", us_id),
		};

		if (resourceType === "Material") {
			payload.tr_liID = resourceData.ma_liID;
			payload.tr_maID = doc(db, "material", resourceData.ma_id);
		} else if (resourceType === "Discussion Room") {
			payload.tr_liID = resourceData.dr_liID;
			payload.tr_drID = doc(db, "discussionrooms", resourceData.id);
		} else if (resourceType === "Computer") {
			payload.tr_liID = resourceData.co_liID;
			payload.tr_coID = doc(db, "computers", resourceData.id);
		}

		const docRef = await addDoc(collection(db, "transaction"), payload);

		const userName = `${patronData?.us_fname} ${patronData?.us_mname}. ${patronData?.us_lname}`;
		const userEmail = patronData?.us_email;

		await insertAudit(
			payload.tr_liID,
			us_id,
			"Reserved",
			`A new ${resourceType} reservation was reserved with ID '${tr_id}'.`,
			Alert
		);

		await sendEmail(
			"Reservation Confirmed",
			userName || "User",
			`Your ${resourceType} reservation with ID ${tr_id} has been reserved successfully. Please make sure to pick up or use your reservation on time.`,
			userEmail,
			Alert
		);

		Alert.showSuccess("Transaction reserved and email sent!");
		setSuccess(true);

		setTimeout(() => {
			setSuccess(false);
			setBtnloading(false);
			router.push(`/transaction/details?id=${docRef.id}`);
		}, 3000);
	} catch (error) {
		console.error("Insert Error:", error);
		Alert.showDanger(error.message || "Failed to insert transaction.");
	}
}
