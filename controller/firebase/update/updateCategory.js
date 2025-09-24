import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";

import { insertAudit } from "../insert/insertAudit";

export async function updateCategory(
	docId,
	li_id,
	us_id,
	newCaName,
	setBtnloading,
	Alert
) {
	try {
		setBtnloading(true);

		await updateDoc(doc(db, "category", docId), {
			ca_name: newCaName,
			ca_status: "Active",
			ca_updatedAt: serverTimestamp(),
		});

		await insertAudit(
			li_id,
			us_id,
			"Update",
			`Updated category name to '${newCaName}'`,
			Alert
		);

		Alert.showSuccess("Category updated successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
	} finally {
		setBtnloading(false);
	}
}

export async function updateCategoryStatus(
	ca_id,
	li_id,
	us_id,
	ca_name,
	newStatus,
	setBtnLoading,
	Alert
) {
	try {
		setBtnLoading(true);
		const categoryRef = doc(db, "category", ca_id);

		await updateDoc(categoryRef, {
			ca_status: newStatus,
			ca_updatedAt: serverTimestamp(),
		});

		await insertAudit(
			li_id,
			us_id,
			"Deactivate",
			`The category '${ca_name}' status was changed to '${newStatus}'.`,
			Alert
		);

		Alert.showSuccess("Category status updated successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
	} finally {
		setBtnLoading(false);
	}
}
