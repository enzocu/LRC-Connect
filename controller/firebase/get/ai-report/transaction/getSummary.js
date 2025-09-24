import { collection, query, where, getDocs, doc } from "firebase/firestore";
import { db } from "../../../../../server/firebaseConfig";
import { isLate } from "../../../../custom/customFunction";

export async function getTransactionSummary(us_id, li_id, setIsFetch, Alert) {
	try {
		setIsFetch("Fetching transaction summary…");

		let constraints = [];
		if (us_id)
			constraints.push(where("tr_usID", "==", doc(db, "users", us_id)));
		if (li_id) constraints.push(where("tr_liID", "==", li_id));

		const transQuery = query(collection(db, "transaction"), ...constraints);
		const transSnap = await getDocs(transQuery);

		const now = new Date();
		const counts = {
			Reserved: 0,
			Utilized: 0,
			Cancelled: 0,
			Completed: 0,
			LateReturn: 0,
			Overdue: 0,
		};

		transSnap.forEach((snap) => {
			const t = snap.data();
			const { tr_status } = t;

			if (tr_status === "Reserved") counts.Reserved++;
			if (tr_status === "Utilized") counts.Utilized++;
			if (tr_status === "Cancelled") counts.Cancelled++;
			if (tr_status === "Completed") counts.Completed++;

			if (isLate(t, now)) {
				counts.LateReturn++;
			}
		});

		const totalTransactions =
			counts.Reserved + counts.Utilized + counts.Cancelled + counts.Completed;

		let output =
			"📊 Transaction Summary (Visit \\transaction for more info about the transaction list)\n\n";
		if (totalTransactions > 0) {
			output +=
				`Reserved: ${counts.Reserved}\n` +
				`Utilized: ${counts.Utilized}\n` +
				`Cancelled: ${counts.Cancelled}\n` +
				`Completed: ${counts.Completed}\n` +
				`Late Return: ${counts.LateReturn}\n` +
				`Overdue: ${counts.Overdue}\n` +
				`--------------------------\n` +
				`Total Transactions: ${totalTransactions}\n`;
		} else {
			output += "No transaction data found.";
		}

		return output;
	} catch (error) {
		console.error("getTransactionSummary Error:", error);
		Alert?.showDanger(error.message || "Failed to fetch transaction summary.");
		return "📊 Transaction Summary\n\nError fetching data.";
	} finally {
		setIsFetch(null);
	}
}
