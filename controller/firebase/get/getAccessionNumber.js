import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";

export async function getAccession(setCount, Alert) {
	try {
		const materialRef = collection(db, "material");
		const snapshot = await getDocs(materialRef);

		let totalHoldings = 0;

		snapshot.forEach((doc) => {
			const data = doc.data();
			const holdings = data.ma_holdings || [];
			totalHoldings += holdings.length;
		});

		if (setCount) setCount(totalHoldings);

		return totalHoldings;
	} catch (error) {
		console.error("getAccession Error:", error);
		Alert?.showDanger(error.message || "Failed to count holdings.");
		return 0;
	}
}
