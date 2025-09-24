import {
	collection,
	query,
	where,
	getDocs,
	orderBy,
	doc,
	getDoc,
} from "firebase/firestore";
import { db } from "../../../../../server/firebaseConfig";
import { formatDurationFromMs } from "../../../../custom/customFunction";

export async function getUserTop10(
	us_id,
	li_id,
	accessMode,
	setIsFetch,
	Alert
) {
	try {
		setIsFetch(`Checking most frequent entries (${accessMode})...`);

		const now = new Date();
		const logsRef = collection(db, "logs");
		const logConditions = [where("lo_type", "==", accessMode)];

		if (us_id)
			logConditions.push(where("lo_usID", "==", doc(db, "users", us_id)));
		if (li_id) logConditions.push(where("lo_liID", "==", li_id));

		const logsSnap = await getDocs(
			query(logsRef, ...logConditions, orderBy("lo_createdAt", "desc"))
		);

		const grouped = {};

		logsSnap.forEach((logDoc) => {
			const log = logDoc.data();
			const key = us_id ? log.lo_liID.id : log.lo_usID.id;

			if (!grouped[key]) {
				grouped[key] = {
					id: key,
					logs: [],
					totalDuration: 0,
					count: 0,
				};
			}

			const inTime = log.lo_timeIn?.toDate();
			const outTime =
				log.lo_status === "Active" ? now : log.lo_timeOut?.toDate();
			let duration = 0;
			if (inTime && outTime) duration = outTime - inTime;

			grouped[key].logs.push(log);
			grouped[key].count++;
			grouped[key].totalDuration += duration;
		});

		let aggregated = Object.values(grouped).map((g) => ({
			...g,
			avgDuration: g.count > 0 ? g.totalDuration / g.count : 0,
		}));

		aggregated.sort((a, b) => b.count - a.count);
		aggregated = aggregated.slice(0, 10);

		const grandTotalDuration = aggregated.reduce(
			(sum, g) => sum + g.totalDuration,
			0
		);

		const finalList = await Promise.all(
			aggregated.map(async (g) => {
				let details = {};
				if (us_id) {
					const liSnap = await getDoc(doc(db, "library", g.id));
					if (liSnap.exists()) details = liSnap.data();
				} else {
					const usSnap = await getDoc(doc(db, "users", g.id));
					if (usSnap.exists()) details = usSnap.data();
				}

				return {
					id: g.id,
					es_visits: g.count,
					raw_totalDuration: g.totalDuration,
					raw_averageDuration: g.avgDuration,
					es_totalDuration: formatDurationFromMs(g.totalDuration),
					es_averageDuration: formatDurationFromMs(g.avgDuration),
					es_percentageDuration:
						grandTotalDuration > 0
							? ((g.totalDuration / grandTotalDuration) * 100).toFixed(2)
							: "0.00",
					details,
				};
			})
		);

		// convert to string output gaya ng sample mo
		let output = `📊 Most Frequent Entries (${accessMode})\n\n`;
		if (finalList.length > 0) {
			output += finalList
				.map(
					(f, idx) =>
						`#${idx + 1}\n` +
						`Visits: ${f.es_visits}\n` +
						`Total Duration: ${f.es_totalDuration}\n` +
						`Average Duration: ${f.es_averageDuration}\n` +
						`Percentage of Total: ${f.es_percentageDuration}%\n` +
						`Details: ${JSON.stringify(f.details, null, 2)}\n` +
						`----------------------------------\n`
				)
				.join("\n");
		} else {
			output += "No data available.";
		}

		return output;
	} catch (error) {
		console.error("getUserTop10 Error:", error);
		Alert.showDanger(error.message || "Failed to fetch breakdown.");
		return `📊 Most Frequent Entries (${accessMode})\n\nError fetching data.`;
	} finally {
		setIsFetch(null);
	}
}
