import { collection, addDoc, serverTimestamp, doc } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";

import { insertAudit } from "../insert/insertAudit";

export async function insertMaterialtype(
	li_id,
	us_id,
	materialTypeName,
	fields,
	setBtnloading,
	Alert
) {
	try {
		setBtnloading(true);
		await addDoc(collection(db, "materialType"), {
			mt_liID: li_id,
			mt_name: materialTypeName,
			mt_status: "Active",
			mt_section: fields,
			mt_createdAt: serverTimestamp(),
		});

		await insertAudit(
			li_id,
			us_id,
			"Create",
			`A new material type '${materialTypeName}' was registered in the library.`,
			Alert
		);

		Alert.showSuccess("Material Type inserted successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
	} finally {
		setBtnloading(false);
	}
}
