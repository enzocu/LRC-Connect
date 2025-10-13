import {
	collection,
	query,
	where,
	getCountFromServer,
	doc,
} from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";

export async function getActiveTransactionCount(
	userID,
	libraryID,
	usType,
	liBorrowing,
	setCount,
	Alert
) {
	try {
		const trRef = collection(db, "transaction");

		const q = query(
			trRef,
			where("tr_usID", "==", doc(db, "users", userID)),
			where("tr_liID", "==", libraryID),
			where("tr_status", "in", ["Reserved", "Utilized"])
		);

		const snapshot = await getCountFromServer(q);
		const totalCount = snapshot.data().count || 0;

		let maxItems = 0;
		if (usType === "Student" || usType === "Student Assistant") {
			maxItems = liBorrowing?.br_student?.maxItems ?? 0;
		} else if (usType === "Faculty") {
			maxItems = liBorrowing?.br_faculty?.maxItems ?? 0;
		} else if (usType === "Administrator") {
			maxItems = liBorrowing?.br_administrator?.maxItems ?? 0;
		}

		const remaining = Math.max(0, maxItems - totalCount);

		if (remaining <= 0) {
			Alert.showDanger("No remaining reservations available for this patron.");
		}

		setCount({
			total: totalCount,
			max: maxItems,
			remaining,
		});
	} catch (error) {
		console.error("getActiveTransactionCount Error:", error);
		Alert?.showDanger(error.message || "Failed to count transactions.");
	}
}
