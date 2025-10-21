import { db } from "../../../server/firebaseConfig";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { insertAudit } from "../insert/insertAudit";

export const updateDonorName = async (
	do_id,
	li_id,
	us_id,
	newName,
	setBtnloading,
	Alert
) => {
	try {
		setBtnloading(true);
		const donorRef = doc(db, "donors", do_id);
		await updateDoc(donorRef, {
			do_name: newName.trim(),
		});

		await insertAudit(
			li_id,
			us_id,
			"Update",
			`Donor name updated to '${newName.trim()}'.`,
			Alert
		);

		Alert.showSuccess("Donor name updated successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
	} finally {
		setBtnloading(false);
	}
};

export async function updateDonorStatus(
	do_id,
	li_id,
	us_id,
	do_name,
	newStatus,
	setBtnLoading,
	Alert
) {
	try {
		setBtnLoading(true);
		const donorRef = doc(db, "donors", do_id);

		await updateDoc(donorRef, {
			do_status: newStatus,
			do_updatedAt: serverTimestamp(),
		});

		await insertAudit(
			li_id,
			us_id,
			"Delete",
			`Donor '${do_name}' status changed to '${newStatus}'.`,
			Alert
		);

		Alert.showSuccess("Donor removed successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
	} finally {
		setBtnLoading(false);
	}
}
