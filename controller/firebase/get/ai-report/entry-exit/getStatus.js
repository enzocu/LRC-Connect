import {
	collection,
	query,
	where,
	orderBy,
	getCountFromServer,
	doc,
} from "firebase/firestore";
import { db } from "../../../../../server/firebaseConfig";

export async function getStatusCount(
	us_id,
	li_id,
	status,
	type,
	setIsFetch,
	Alert
) {
	try {
		setIsFetch(`Fetching ${status} users (${type})...`);
		const logsRef = collection(db, "logs");
		const conditions = [
			where("lo_status", "==", status),
			where("lo_type", "==", type),
		];

		if (us_id) conditions.push(where("lo_usID", "==", doc(db, "users", us_id)));
		if (li_id) conditions.push(where("lo_liID", "==", li_id));

		const q = query(logsRef, ...conditions, orderBy("lo_createdAt", "desc"));

		const snapshot = await getCountFromServer(q);
		const count = snapshot.data().count;

		let output =
			`📊 Status Count Report\n\n` +
			`Status: ${status}\n` +
			`Type: ${type}\n` +
			`Count: ${count}\n`;

		return output;
	} catch (error) {
		console.error("getStatusCount Error:", error);
		Alert?.showDanger(error.message || "Failed to fetch status count.");
		return (
			"📊 Status Count Report\n\nError fetching status count: " +
			(error.message || "Unknown error")
		);
	} finally {
		setIsFetch(null);
	}
}
