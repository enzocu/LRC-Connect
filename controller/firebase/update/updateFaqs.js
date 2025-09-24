import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";

import { insertAudit } from "../insert/insertAudit";

export async function updateFaqs(
	faID,
	li_id,
	formData,
	modifiedBy,
	setBtnLoading,
	Alert
) {
	try {
		setBtnLoading(true);
		await updateDoc(doc(db, "faqs", faID), {
			fa_modifiedBy: doc(db, "users", modifiedBy),
			fa_question: formData.fa_question || "",
			fa_answer: formData.fa_answer || "",
			fa_updatedAt: serverTimestamp(),
		});

		await insertAudit(
			li_id,
			modifiedBy,
			"Update",
			`FAQ '${formData.fa_question}' was updated.`,
			Alert
		);

		Alert.showSuccess("FAQs updated successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
	} finally {
		setBtnLoading(false);
	}
}

export async function updateFaqsStatus(
	faID,
	li_id,
	modifiedBy,
	setBtnLoading,
	Alert
) {
	try {
		setBtnLoading(true);

		await updateDoc(doc(db, "faqs", faID), {
			fa_status: "Inactive",
			fa_modifiedBy: doc(db, "users", modifiedBy),
			fa_updatedAt: serverTimestamp(),
		});

		await insertAudit(
			li_id,
			modifiedBy,
			"Deactivate",
			`FAQ (ID: '${faID}') status was changed to Inactive.`,
			Alert
		);
		Alert.showSuccess("FAQs status updated successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
	} finally {
		setBtnLoading(false);
	}
}
