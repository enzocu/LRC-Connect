import {
	collection,
	query,
	where,
	getDocs,
	getDoc,
	doc,
} from "firebase/firestore";
import { db } from "../../../../../server/firebaseConfig";
import { formatDate, formatTime } from "../../../../custom/customFunction";
export async function getReservedUtilized(us_id, li_id, setIsFetch, Alert) {
	try {
		setIsFetch("Checking current reserved and utilized transactions…");
		const trRef = collection(db, "transaction");
		const conditions = [where("tr_status", "in", ["Reserved", "Utilized"])];

		if (us_id) conditions.push(where("tr_usID", "==", doc(db, "users", us_id)));
		if (li_id) conditions.push(where("tr_liID", "==", li_id));

		const finalQuery = query(trRef, ...conditions);
		const snapshot = await getDocs(finalQuery);

		const transactions = await Promise.all(
			snapshot.docs.map(async (docSnap) => {
				const data = docSnap.data();
				const id = docSnap.id;

				let tr_resource = "No resource details";
				let resSnap;

				if (data.tr_type === "Material" && data.tr_maID) {
					resSnap = await getDoc(data.tr_maID);
					if (resSnap.exists()) {
						const d = resSnap.data();
						tr_resource =
							`[Material]\n` +
							`ID: ${resSnap.id}\n` +
							`QR: ${d.ma_qr}\n` +
							`Call Number: ${d.ma_libraryCall || d.ma_qr}\n` +
							`Title: ${d.ma_title}\n` +
							`Author: ${d.ma_author}\n` +
							`Cover URL: ${d.ma_coverURL}\n`;
					}
				} else if (data.tr_type === "Discussion Room" && data.tr_drID) {
					resSnap = await getDoc(data.tr_drID);
					if (resSnap.exists()) {
						const d = resSnap.data();
						tr_resource =
							`[Discussion Room]\n` +
							`ID: ${resSnap.id}\n` +
							`Name: ${d.dr_name}\n` +
							`QR: ${d.dr_qr}\n` +
							`Photo URL: ${d.dr_photoURL}\n` +
							`Created At: ${formatDate(d.dr_createdAt)}\n` +
							`Qty: 1\n`;
					}
				} else if (data.tr_type === "Computer" && data.tr_coID) {
					resSnap = await getDoc(data.tr_coID);
					if (resSnap.exists()) {
						const d = resSnap.data();
						tr_resource =
							`[Computer]\n` +
							`ID: ${resSnap.id}\n` +
							`Name: ${d.co_name}\n` +
							`QR: ${d.co_qr}\n` +
							`Photo URL: ${d.co_photoURL}\n` +
							`Created At: ${formatDate(d.co_createdAt)}\n` +
							`Qty: 1\n`;
					}
				}

				return (
					`----------------------------------\n` +
					`Transaction ID: ${id}\n` +
					`Library ID: ${data.tr_liID.id}\n` +
					`Patron/User ID: ${data.tr_usID.id}\n` +
					`QR: ${data.tr_qr}\n` +
					`Type: ${data.tr_type}\n` +
					`Status: ${data.tr_status}\n` +
					`Format: ${data.tr_format}\n` +
					`Past Due Date: ${data.tr_pastDueDate}\n` +
					`Accession: ${data.tr_accession}\n || n` +
					`Created At: ${formatDate(data.tr_createdAt)}\n` +
					`Remarks: ${data.tr_remarks || "None"}\n` +
					`Date of Use: ${formatDate(data.tr_useDate) || "None"}\n` +
					`Due Date: ${formatDate(data.tr_dateDue) || "None"}\n` +
					`Session Start: ${formatTime(data.tr_sessionStart) || "None"}\n` +
					`Session End: ${formatTime(data.tr_sessionEnd) || "None"}\n` +
					`Actual End: ${data.tr_actualEnd || "None"}\n` +
					`Updated At: ${data.tr_updatedAt || "None"}\n\n` +
					`Resource Details:\n${tr_resource}\n`
				);
			})
		);

		let output = "📌 Current Reserved and Utilized Transactions\n\n";
		if (transactions.length > 0) {
			output += transactions.join("\n");
		} else {
			output += "No data available.";
		}

		return output;
	} catch (error) {
		console.error("getTransactionList Error:", error);
		Alert?.showDanger(error.message || "Failed to fetch transactions.");
		return "📌 Current Reserved and Utilized Transactions\n\nError fetching data.";
	} finally {
		setIsFetch(null);
	}
}
