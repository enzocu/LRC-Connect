import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";

import { insertAudit } from "../insert/insertAudit";

export async function insertDonor(li_id, us_id, do_name, setBtnloading, Alert) {
	try {
		setBtnloading(true);

		await addDoc(collection(db, "donors"), {
			do_liID: li_id,
			do_name: do_name.trim(),
			do_status: "Active",
			do_createdAt: serverTimestamp(),
		});

		await insertAudit(
			li_id,
			us_id,
			"Create",
			`A new donor '${do_name}' was created'.`,
			Alert
		);

		Alert.showSuccess("Donor added successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
	} finally {
		setBtnloading(false);
	}
}
