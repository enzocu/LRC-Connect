import { updateDoc, serverTimestamp } from "firebase/firestore";
import { insertAudit } from "../insert/insertAudit";

export async function updateBorrowingLimit(
	li_id,
	us_id,
	limits,
	setBtnLoading,
	Alert
) {
	try {
		setBtnLoading(true);

		await updateDoc(li_id, {
			li_borrowing: limits,
			li_updatedAt: serverTimestamp(),
		});

		await insertAudit(
			li_id,
			us_id,
			"Update",
			`Borrowing limits updated for Library: \n\n 
			Student → ${limits.br_student.maxItems} items / ${limits.br_student.borrowDays} days, \n 
			Faculty → ${limits.br_faculty.maxItems} items / ${limits.br_faculty.borrowDays} days, \n 
			Administrator → ${limits.br_administrator.maxItems} items / ${limits.br_administrator.borrowDays} days.`,
			Alert
		);

		Alert.showSuccess("Borrowing Limit updated successfully!");
	} catch (error) {
		console.error("Error updating library limits:", error);
		Alert.showDanger(error.message || "Something went wrong!");
	} finally {
		setBtnLoading(false);
	}
}
