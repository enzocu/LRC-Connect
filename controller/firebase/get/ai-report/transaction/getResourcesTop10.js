import {
	collection,
	query,
	where,
	getDocs,
	getDoc,
	doc,
} from "firebase/firestore";
import { db } from "../../../../../server/firebaseConfig";
import { isLate, formatDate } from "../../../../custom/customFunction";

export async function getResourceTop10(
	us_id,
	li_id,
	resourceType,
	setIsFetch,
	Alert
) {
	try {
		setIsFetch(`Starting fetch for Top 10 ${resourceType} resources…`);

		let constraints = [];
		if (us_id)
			constraints.push(where("tr_usID", "==", doc(db, "users", us_id)));
		if (li_id) constraints.push(where("tr_liID", "==", li_id));
		if (resourceType) constraints.push(where("tr_type", "==", resourceType));

		const transQuery = query(collection(db, "transaction"), ...constraints);
		const transSnap = await getDocs(transQuery);

		const now = new Date();
		const grouped = {};

		// Group transactions by resource ID
		transSnap.forEach((snap) => {
			const t = snap.data();
			const { tr_status, tr_type, tr_maID, tr_drID, tr_coID } = t;

			let resourceId = null;
			let resourceRef = null;

			if (tr_type === "Material" && tr_maID) {
				resourceRef = tr_maID;
				resourceId = tr_maID.id;
			} else if (tr_type === "Discussion Room" && tr_drID) {
				resourceRef = tr_drID;
				resourceId = tr_drID.id;
			} else if (tr_type === "Computer" && tr_coID) {
				resourceRef = tr_coID;
				resourceId = tr_coID.id;
			}

			if (!resourceId) return;

			if (!grouped[resourceId]) {
				grouped[resourceId] = {
					resourceRef,
					counts: {
						Reserved: 0,
						Utilized: 0,
						Cancelled: 0,
						Completed: 0,
						LateReturn: 0,
						Overdue: 0,
					},
				};
			}

			const g = grouped[resourceId];
			if (tr_status === "Reserved") g.counts.Reserved++;
			if (tr_status === "Utilized") g.counts.Utilized++;
			if (tr_status === "Cancelled") g.counts.Cancelled++;
			if (tr_status === "Completed") g.counts.Completed++;
			if (isLate(t, now)) g.counts.LateReturn++;
		});

		// Convert grouped object to array for sorting
		let summaryList = Object.keys(grouped).map((resourceId) => {
			const g = grouped[resourceId];
			const total =
				g.counts.Reserved +
				g.counts.Utilized +
				g.counts.Cancelled +
				g.counts.Completed;

			return {
				resourceId,
				resourceRef: g.resourceRef, // keep the reference for fetching later
				summary: {
					us_reserved: g.counts.Reserved,
					us_utilized: g.counts.Utilized,
					us_cancelled: g.counts.Cancelled,
					us_completed: g.counts.Completed,
					us_lateReturn: g.counts.LateReturn,
					us_currentOverdue: g.counts.Overdue,
					us_totalTransactions: total,
				},
			};
		});

		// Top 10 by transaction count
		summaryList.sort(
			(a, b) => b.summary.us_totalTransactions - a.summary.us_totalTransactions
		);
		summaryList = summaryList.slice(0, 10);

		// Fetch details and format output
		const details = await Promise.all(
			summaryList.map(async (item, index) => {
				let tr_resource = "No resource details";
				const resSnap = await getDoc(item.resourceRef);

				if (resSnap.exists()) {
					const d = resSnap.data();
					if (resourceType === "Material") {
						tr_resource =
							`[Material]\n` +
							`ID: ${resSnap.id}\n` +
							`QR: ${d.ma_qr}\n` +
							`Call Number: ${d.ma_libraryCall || d.ma_qr}\n` +
							`Title: ${d.ma_title}\n` +
							`Author: ${d.ma_author}\n`;
					} else if (resourceType === "Discussion Room") {
						tr_resource =
							`[Discussion Room]\n` +
							`ID: ${resSnap.id}\n` +
							`Name: ${d.dr_name}\n` +
							`QR: ${d.dr_qr}\n` +
							`Photo URL: ${d.dr_photoURL}\n` +
							`Created At: ${formatDate(d.dr_createdAt)}\n` +
							`Qty: 1\n`;
					} else if (resourceType === "Computer") {
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

				const s = item.summary;
				return (
					`----------------------------------\n` +
					`#${index + 1} Resource ID: ${item.resourceId}\n\n` +
					`Resource Details:\n${tr_resource}\n` +
					`📊 Summary:\n` +
					`Reserved: ${s.us_reserved}\n` +
					`Utilized: ${s.us_utilized}\n` +
					`Cancelled: ${s.us_cancelled}\n` +
					`Completed: ${s.us_completed}\n` +
					`Late Return: ${s.us_lateReturn}\n` +
					`Overdue: ${s.us_currentOverdue}\n` +
					`Total Transactions: ${s.us_totalTransactions}\n`
				);
			})
		);

		let output = `📌 Top 10 ${resourceType} Resources\n\n`;

		if (details.length > 0) {
			output += details.join("\n");
		} else {
			output += "No data available.";
		}

		console.log(output);
		return output;
	} catch (error) {
		console.error("getResourceTop10 Error:", error);
		Alert?.showDanger(error.message || "Failed to fetch resource summary.");
		return `📌 Top 10 ${resourceType} Resources\n\nError fetching data.`;
	} finally {
		setIsFetch(null);
	}
}
