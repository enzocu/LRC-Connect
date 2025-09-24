import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";

import { insertAudit } from "../insert/insertAudit";

export async function updateMaterialtype(
	mt_id,
	li_id,
	us_id,
	materialTypeName,
	fields,
	setBtnloading,
	Alert
) {
	try {
		setBtnloading(true);

		const docRef = doc(db, "materialType", mt_id);

		await updateDoc(docRef, {
			mt_name: materialTypeName,
			mt_status: "Active",
			mt_section: fields,
			mt_updatedAt: serverTimestamp(),
		});

		await insertAudit(
			li_id,
			us_id,
			"Update",
			`The material type '${materialTypeName}' was updated in the library.`,
			Alert
		);

		Alert.showSuccess("Material Type updated successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
	} finally {
		setBtnloading(false);
	}
}

export async function updateMaterialtypeStatus(
	mt_id,
	li_id,
	us_id,
	materialTypeName,
	newStatus,
	Alert
) {
	try {
		const docRef = doc(db, "materialType", mt_id);

		await updateDoc(docRef, {
			mt_status: newStatus,
		});

		await insertAudit(
			li_id,
			us_id,
			"Deactivate",
			`The material type '${materialTypeName}' status was changed to '${newStatus}'.`,
			Alert
		);

		Alert.showSuccess("Status updated successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
	}
}
