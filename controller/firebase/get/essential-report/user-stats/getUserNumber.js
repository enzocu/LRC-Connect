import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../../../../server/firebaseConfig";
import { convertDateToTimestamp } from "../../../../custom/customFunction";

export async function getUserNumber(
	li_id,
	setMockData,
	searchQuery,
	a_type,
	a_status,
	a_dateRangeStart,
	a_dateRangeEnd,
	a_orderBy,
	setLoading,
	Alert
) {
	setLoading(true);

	try {
		const usRef = collection(db, "users");
		const conditions = [where("us_status", "==", a_status)];

		if (a_type !== "User Type") {
			conditions.push(where("us_liID", "==", li_id));
		}

		if (a_dateRangeStart) {
			conditions.push(
				where("us_createdAt", ">=", convertDateToTimestamp(a_dateRangeStart))
			);
		}

		if (a_dateRangeEnd) {
			conditions.push(
				where("us_createdAt", "<=", convertDateToTimestamp(a_dateRangeEnd))
			);
		}

		const isQRSearch = searchQuery?.startsWith("USR-");
		if (isQRSearch) {
			conditions.push(where("us_qr", "==", searchQuery));
		} else {
			conditions.push(orderBy("us_createdAt", "desc"));
		}

		// Final Firestore query
		const finalQuery = query(usRef, ...conditions);
		const snapshot = await getDocs(finalQuery);

		const counts = {};

		snapshot.docs.forEach((userDoc) => {
			const usData = userDoc.data();
			let key = "Unknown";

			switch (a_type) {
				case "User Type":
					if (usData.us_type === "Personnel") {
						const matchedLib = usData.us_library?.find(
							(lib) => lib.us_liID?.id === li_id.id
						);
						if (!matchedLib) return;
						key = matchedLib.us_type || "Unknown";
					} else if (
						["USR-5", "USR-6"].includes(usData?.us_level) &&
						usData?.us_liID?.id === li_id?.id
					) {
						key = usData.us_type || "Unknown";
					}
					break;
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
				default:
					key = "Unknown";
			}

			if (!(a_type === "User Type" && key === "Unknown")) {
				counts[key] = (counts[key] || 0) + 1;
			}
		});

		const totalCount = Object.values(counts).reduce((sum, val) => sum + val, 0);

		let result = Object.entries(counts).map(([key, value]) => ({
			es_type: key,
			es_total: value,
			es_percentage: ((value / totalCount) * 100).toFixed(2),
		}));

		// Sort result
		result.sort((a, b) =>
			a_orderBy === "Descending"
				? b.es_total - a.es_total
				: a.es_total - b.es_total
		);

		setMockData((prev) => ({
			...prev,
			totalUsersByType: result,
		}));
	} catch (error) {
		console.error("getUserNumber Error:", error);
		Alert.showDanger(error.message || "Failed to fetch users number.");
		return [];
	} finally {
		setLoading(false);
	}
}
