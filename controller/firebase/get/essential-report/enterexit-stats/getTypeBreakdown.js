import { collection, query, where, getDocs, doc } from "firebase/firestore";
import { db } from "../../../../../server/firebaseConfig";
import {
	convertDateToTimestamp,
	formatDurationFromMs,
} from "../../../../custom/customFunction";

export async function getTypeBreakdown(
	li_id,
	setMockData,
	accessMode,
	a_status,
	a_type,
	a_libraryList,
	a_dateRangeStart,
	a_dateRangeEnd,
	a_orderBy,
	setLoading,
	Alert
) {
	setLoading(true);

	try {
		const usRef = collection(db, "users");
		const conditions = [];

		if (a_type !== "User Type") {
			conditions.push(
				where(
					"us_liID",
					"==",
					a_libraryList === "All" ? li_id : doc(db, "library", a_libraryList)
				)
			);
		}

		const snapshot = await getDocs(query(usRef, ...conditions));
		if (snapshot.empty) {
			setMockData((prev) => ({
				...prev,
				visitorBreakdownByType: [],
			}));
			return;
		}

		const totalStats = { totalVisit: 0, totalDuration: 0 };
		const groupStats = {};
		const now = new Date();

		for (const userDoc of snapshot.docs) {
			const usData = userDoc.data();
			let key = "Unknown";

			switch (a_type) {
				case "User Type": {
					const libRef =
						a_libraryList === "All" ? li_id : doc(db, "library", a_libraryList);
					if (usData.us_type === "Personnel") {
						const matchedLib = usData.us_library?.find(
							(lib) => lib.us_liID?.id === libRef.id
						);
						if (!matchedLib) continue;
						key = matchedLib.us_type || "Unknown";
					} else if (
						["USR-5", "USR-6"].includes(usData?.us_level) &&
						usData?.us_liID?.id === libRef.id
					) {
						key = usData.us_type || "Unknown";
					}
					break;
				}
				case "Section":
					key = usData.us_section || "Unknown";
					break;
				case "Year":
					key = usData.us_year || "Unknown";
					break;
				case "Program":
					key = usData.us_program || "Unknown";
					break;
				case "School":
					key = usData.us_school || "Unknown";
					break;
			}

			if (a_type === "User Type" && key === "Unknown") continue;

			if (!groupStats[key]) {
				groupStats[key] = { visit: 0, duration: 0 };
			}

			// 🔹 Build logs query
			const logsConditions = [
				where("lo_usID", "==", doc(db, "users", userDoc.id)),
				where("lo_liID", "==", li_id),
				where("lo_type", "==", accessMode),
			];

			if (a_status !== "All") {
				logsConditions.push(where("lo_status", "==", a_status));
			}
			if (a_dateRangeStart) {
				logsConditions.push(
					where("lo_createdAt", ">=", convertDateToTimestamp(a_dateRangeStart))
				);
			}
			if (a_dateRangeEnd) {
				logsConditions.push(
					where("lo_createdAt", "<=", convertDateToTimestamp(a_dateRangeEnd))
				);
			}

			const logsSnap = await getDocs(
				query(collection(db, "logs"), ...logsConditions)
			);

			logsSnap.forEach((logDoc) => {
				const log = logDoc.data();
				const inTime = log.lo_timeIn?.toDate();
				const outTime =
					log.lo_status === "Active" ? now : log.lo_timeOut?.toDate();

				if (inTime && outTime) {
					const durationMs = outTime.getTime() - inTime.getTime();
					groupStats[key].visit += 1;
					groupStats[key].duration += durationMs;
					totalStats.totalVisit += 1;
					totalStats.totalDuration += durationMs;
				}
			});
		}

		let result = Object.entries(groupStats)
			.filter(([_, data]) => data.visit > 0)
			.map(([key, data]) => {
				const avgDurationMs = data.duration / data.visit;
				return {
					es_type: key,
					es_totalVisit: data.visit,
					es_totalDuration: formatDurationFromMs(data.duration),
					es_averageDuration: formatDurationFromMs(avgDurationMs),
					es_percentageDuration: (
						(data.duration / totalStats.totalDuration) *
						100
					).toFixed(2),
				};
			});

		result.sort((a, b) =>
			a_orderBy === "Descending"
				? b.es_totalVisit - a.es_totalVisit
				: a.es_totalVisit - b.es_totalVisit
		);

		setMockData((prev) => ({
			...prev,
			visitorBreakdownByType: result,
		}));
	} catch (error) {
		console.error("getTypeBreakdown Error:", error);
		Alert.showDanger(error.message || "Failed to fetch visitor breakdown.");
		return [];
	} finally {
		setLoading(false);
	}
}
