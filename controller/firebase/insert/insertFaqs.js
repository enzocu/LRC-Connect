import { collection, addDoc, serverTimestamp, doc } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";

import { insertAudit } from "../insert/insertAudit";

export async function insertFaqs(
	li_id,
	modifiedBy,
	formData,
	setBtnLoading,
	Alert
) {
	try {
		setBtnLoading(true);

		await addDoc(collection(db, "faqs"), {
			fa_liID: li_id,
			fa_modifiedBy: doc(db, "users", modifiedBy),
			fa_status: "Active",
			fa_question: formData.fa_question || "",
			fa_answer: formData.fa_answer || "",
			fa_createdAt: serverTimestamp(),
		});

		await insertAudit(
			li_id,
			modifiedBy,
			"Create",
			`A new FAQ was added: '${formData.fa_question}'.`,
			Alert
		);

		Alert.showSuccess("FAQ added successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
	} finally {
		setBtnLoading(false);
	}
}
