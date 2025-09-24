import { collection, addDoc, serverTimestamp, doc } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";

import { insertAudit } from "../insert/insertAudit";

export async function insertCategory(
	li_id,
	us_id,
	ca_name,
	setBtnloading,
	Alert
) {
	try {
		setBtnloading(true);
		await addDoc(collection(db, "category"), {
			ca_liID: li_id,
			ca_name: ca_name,
			ca_status: "Active",
			ca_createdAt: serverTimestamp(),
		});

		await insertAudit(
			li_id,
			us_id,
			"Create",
			`A new category '${ca_name}' was created in the library.`,
			Alert
		);

		Alert.showSuccess("Category inserted successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
	} finally {
		setBtnloading(false);
	}
}
