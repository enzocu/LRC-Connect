import { db } from "../../../server/firebaseConfig";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

import { insertAudit } from "../insert/insertAudit";
export const updateShelfName = async (
	sh_id,
	li_id,
	us_id,
	newName,
	setBtnloading,
	Alert
) => {
	try {
		setBtnloading(true);
		const shelfRef = doc(db, "shelves", sh_id);
		await updateDoc(shelfRef, {
			sh_name: newName.trim(),
		});
		await insertAudit(
			li_id,
			us_id,
			"Update",
			`Shelf name was updated to '${newName.trim()}'.`,
			Alert
		);

		Alert.showSuccess("Shelf name updated successfully!");
	} catch (error) {
		console.error("Error updating shelf name:", error);
		Alert.showError("Failed to update shelf name.");
	} finally {
		setBtnloading(false);
	}
};

export async function updateShelfStatus(
	sh_id,
	li_id,
	us_id,
	sh_name,
	newStatus,
	setBtnLoading,
	Alert
) {
	try {
		setBtnLoading(true);
		const shelfRef = doc(db, "shelves", sh_id);

		await updateDoc(shelfRef, {
			sh_status: newStatus,
			sh_updatedAt: serverTimestamp(),
		});

		await insertAudit(
			li_id,
			us_id,
			"Delete",
			`Shelf '${sh_name}' status was changed to '${newStatus}'.`,
			Alert
		);

		Alert.showSuccess("Shelf status updated successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
	} finally {
		setBtnLoading(false);
	}
}
