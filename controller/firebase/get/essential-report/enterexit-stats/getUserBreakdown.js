import {
	collection,
	query,
	where,
	orderBy,
	limit,
	startAfter,
	getDocs,
	getCountFromServer,
	doc,
} from "firebase/firestore";
import { db } from "../../../../../server/firebaseConfig";
import {
	convertDateToTimestamp,
	formatDurationFromMs,
} from "../../../../custom/customFunction";

export async function getUserBreakdown(
	li_id,
	setMockData,
	searchQuery,
	accessMode,
	b_status,
	b_role,
	b_userType,
	b_school,
	b_program,
	b_year,
	b_section,
	b_libraryList,
	b_dateRangeStart,
	b_dateRangeEnd,
	b_orderBy,
	setLoading,
	Alert,
	pageLimit,
	setCtrPage,
	pageCursors,
	setPageCursors,
	currentPage
) {
	setLoading(true);

	try {
		const usRef = collection(db, "users");
		const conditions = [];

		if (b_role === "Patron") {
			if (b_libraryList && b_libraryList !== "All") {
				conditions.push(
					where("us_liID", "==", doc(db, "library", b_libraryList))
				);
			} else {
				conditions.push(where("us_liID", "==", li_id));
			}

			if (b_userType !== "All") {
				conditions.push(where("us_type", "==", b_userType));
			} else {
				conditions.push(where("us_level", "in", ["USR-6", "USR-5"]));
			}

			if (b_school !== "All") {
				conditions.push(where("us_school", "==", b_school));
			}

			if (b_program !== "All") {
				conditions.push(where("us_program", "==", b_program));
			}

			if (b_year !== "All") {
				conditions.push(where("us_year", "==", b_year));
			}

			if (b_section !== "All") {
				conditions.push(where("us_section", "==", b_section));
			}
		} else {
			conditions.push(where("us_type", "==", "Personnel"));
		}

		const isQRSearch = searchQuery?.startsWith("USR-");
		const isSearchEmpty = !searchQuery || searchQuery.trim() === "";

		if (isQRSearch) {
			conditions.push(where("us_qr", "==", searchQuery));
		} else {
			conditions.push(orderBy("us_createdAt", "desc"));
		}

		const hasSearchFilters =
			(isQRSearch || isSearchEmpty) && b_userType == "All";

		let finalQuery;
		if (hasSearchFilters) {
			const hasCursor = currentPage > 1 && pageCursors[currentPage - 2];
			finalQuery = hasCursor
				? query(
						usRef,
						...conditions,
						startAfter(pageCursors[currentPage - 2]),
						limit(pageLimit)
				  )
				: query(usRef, ...conditions, limit(pageLimit));
		} else {
			finalQuery = query(usRef, ...conditions);
		}

		const snapshot = await getDocs(finalQuery);
		const lastVisible = snapshot.docs[snapshot.docs.length - 1];

		if (hasSearchFilters && lastVisible) {
			const newCursors = [...pageCursors];
			newCursors[currentPage - 1] = lastVisible;
			setPageCursors(newCursors);
		}

		const now = new Date();

		const tempLogList = [];
		await Promise.all(
			snapshot.docs.map(async (userDoc) => {
				const usData = userDoc.data();
				const userRef = userDoc.ref;

				let userType = usData.us_type;

				if (b_role !== "Patron") {
					const matchedLib = usData.us_library?.find(
						(lib) => lib.us_liID?.id === b_libraryList
					);
					if (!matchedLib) return null;
					if (
						b_userType &&
						b_userType !== "All" &&
						matchedLib.us_type !== b_userType
					)
						return null;

					userType = matchedLib.us_type;
				}

				const fullName = [usData.us_fname, usData.us_mname, usData.us_lname]
					.join(" ")
					.toLowerCase();

				if (
					!isSearchEmpty &&
					!isQRSearch &&
					!fullName.includes(searchQuery.toLowerCase())
				) {
					return null;
				}

				const logsConditions = [
					where("lo_usID", "==", userRef),
					where("lo_liID", "==", li_id),
					where("lo_type", "==", accessMode),
				];

				if (b_status != "All") {
					logsConditions.push(where("lo_status", "==", b_status));
				}

				if (b_dateRangeStart) {
					logsConditions.push(
						where(
							"lo_createdAt",
							">=",
							convertDateToTimestamp(b_dateRangeStart)
						)
					);
				}
				if (b_dateRangeEnd) {
					logsConditions.push(
						where("lo_createdAt", "<=", convertDateToTimestamp(b_dateRangeEnd))
					);
				}

				const logsSnap = await getDocs(
					query(collection(db, "logs"), ...logsConditions)
				);

				let totalDuration = 0;
				let count = 0;

				logsSnap.forEach((logDoc) => {
					const log = logDoc.data();
					count++;
					const inTime = log.lo_timeIn?.toDate();
					const outTime =
						log.lo_status === "Active" ? now : log.lo_timeOut?.toDate();
					if (inTime && outTime) totalDuration += outTime - inTime;
				});

				const avgDurationMs = count > 0 ? totalDuration / count : 0;

				tempLogList.push({
					id: userDoc.id,
					es_qr: usData.us_qr,
					es_name: `${usData.us_fname} ${usData.us_mname} ${usData.us_lname}`,
					es_type: userType,
					es_schoolID: usData.us_schoolID,
					es_photoURL: usData.us_photoURL,
					es_visits: count,
					raw_totalDuration: totalDuration,
					raw_averageDuration: avgDurationMs,
				});
			})
		);

		const grandTotalDuration = tempLogList
			.filter((user) => user.es_visits > 0)
			.reduce((sum, user) => sum + user.raw_totalDuration, 0);

		const filteredList = tempLogList
			.filter((user) => user.es_visits > 0)
			.map((user) => ({
				...user,
				es_totalDuration: formatDurationFromMs(user.raw_totalDuration),
				es_averageDuration: formatDurationFromMs(user.raw_averageDuration),
				es_percentageDuration:
					grandTotalDuration > 0
						? ((user.raw_totalDuration / grandTotalDuration) * 100).toFixed(2)
						: "0.00",
			}));

		if (b_orderBy === "Descending") {
			filteredList.sort((a, b) => b.es_visits - a.es_visits);
		} else {
			filteredList.sort((a, b) => a.es_visits - b.es_visits);
		}

		if (hasSearchFilters) {
			const countQuery = query(usRef, ...conditions);
			const countSnap = await getCountFromServer(countQuery);
			const totalPages = Math.ceil(countSnap.data().count / pageLimit);
			setCtrPage(totalPages);
		} else {
			setCtrPage(1);
		}

		setMockData((prev) => ({
			...prev,
			visitorBreakdownByUser: filteredList,
		}));
	} catch (error) {
		console.error("getUsersReport Error:", error);
		Alert.showDanger(error.message || "Failed to fetch users report.");
		return [];
	} finally {
		setLoading(false);
	}
}

export async function getUserBreakdownFilter(setLibraries, Alert) {
	try {
		const promises = [];

		const libQuery = query(
			collection(db, "library"),
			where("li_status", "==", "Active")
		);
		const libPromise = getDocs(libQuery).then((libSnap) =>
			libSnap.docs.map((doc) => ({
				id: doc.id,
				li_name: doc.data().li_name,
			}))
		);
		promises.push(libPromise);

		const results = await Promise.all(promises);

		setLibraries(results[0]);
	} catch (error) {
		console.error("Error fetching transaction filters:", error);
		Alert.showDanger(error.message || "Failed to fetch filters.");
	}
}
