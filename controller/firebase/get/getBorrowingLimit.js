import { getDoc } from "firebase/firestore";

export async function getBorrowingLimit(li_id, setLimit, setLoading, Alert) {
	setLoading(true);

	try {
		const docSnap = await getDoc(li_id);

		if (docSnap.exists()) {
			const data = docSnap.data();
			if (data.li_borrowing) {
				setLimit(data.li_borrowing);
			} else {
				Alert.showDanger("Borrowing limits not found in the document.");
			}
		} else {
			Alert.showDanger("Library document not found.");
		}
	} catch (error) {
		console.error("Error fetching borrowing limit:", error);
		Alert.showDanger(error.message || "Failed to fetch borrowing limits.");
	} finally {
		setLoading(false);
	}
}
