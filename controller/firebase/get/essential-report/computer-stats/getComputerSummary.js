import {
	collection,
	query,
	where,
	orderBy,
	limit,
	startAfter,
	getDocs,
	getDoc,
	getCountFromServer,
} from "firebase/firestore";
import { db } from "../../../../../server/firebaseConfig";
import {
	convertDateToTimestamp,
	isLate,
} from "../../../../custom/customFunction";

export async function getComputerSummary(
	li_id,
	setMockData,
	searchQuery,
	a_userType,
	a_dateRangeStart,
	a_dateRangeEnd,
	a_orderBy,
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
		const coRef = collection(db, "computers");
		const conditions = [where("co_liID", "==", li_id)];

		const isQRSearch = searchQuery?.startsWith("CMP-");
		const isSearchEmpty = !searchQuery || searchQuery.trim() === "";

		if (isQRSearch) {
			conditions.push(where("co_qr", "==", searchQuery));
		} else {
			conditions.push(orderBy("co_createdAt", "desc"));
		}

		const hasSearchFilters =
			(isQRSearch || isSearchEmpty) && a_userType == "All";

		let finalQuery;
		if (hasSearchFilters) {
			const hasCursor = currentPage > 1 && pageCursors[currentPage - 2];
			finalQuery = hasCursor
				? query(
						coRef,
						...conditions,
						startAfter(pageCursors[currentPage - 2]),
						limit(pageLimit)
				  )
				: query(coRef, ...conditions, limit(pageLimit));
		} else {
			finalQuery = query(coRef, ...conditions);
		}

		const snapshot = await getDocs(finalQuery);

		const lastVisible = snapshot.docs[snapshot.docs.length - 1];
		if (hasSearchFilters && lastVisible) {
			const newCursors = [...pageCursors];
			newCursors[currentPage - 1] = lastVisible;
			setPageCursors(newCursors);
		}

		const now = new Date();

		const transactionList = await Promise.all(
			snapshot.docs.map(async (computerDoc) => {
				const coData = computerDoc.data();
				const coRef = computerDoc.ref;

				if (
					!isSearchEmpty &&
					!isQRSearch &&
					!coData.co_name?.toLowerCase().includes(searchQuery.toLowerCase())
				) {
					return null;
				}

				const transactionConditions = [
					where("tr_coID", "==", coRef),
					where("tr_liID", "==", li_id),
					where("tr_type", "==", "Computer"),
				];

				if (a_dateRangeStart !== "") {
					transactionConditions.push(
						where(
							"tr_createdAt",
							">=",
							convertDateToTimestamp(a_dateRangeStart)
						)
					);
				}
				if (a_dateRangeEnd !== "") {
					transactionConditions.push(
						where("tr_createdAt", "<=", convertDateToTimestamp(a_dateRangeEnd))
					);
				}

				const transSnap = await getDocs(
					query(collection(db, "transaction"), ...transactionConditions)
				);

				const counts = {
					Reserved: 0,
					Utilized: 0,
					Cancelled: 0,
					Completed: 0,
					LateReturn: 0,
				};

				for (const snap of transSnap.docs) {
					const t = snap.data();
					const { tr_usID, tr_status } = t;

					if (a_userType !== "All") {
						const usSnap = await getDoc(tr_usID);
						const usData = usSnap.exists() ? usSnap.data() : null;
						if (!usData || usData.us_type !== a_userType) {
							continue;
						}
					}

					if (tr_status === "Reserved") counts.Reserved++;
					if (tr_status === "Utilized") counts.Utilized++;
					if (tr_status === "Cancelled") counts.Cancelled++;
					if (tr_status === "Completed") counts.Completed++;

					if (isLate(t, now)) {
						counts.LateReturn++;
					}
				}

				const totalTransactions =
					counts.Reserved +
					counts.Utilized +
					counts.Cancelled +
					counts.Completed;

				if (totalTransactions === 0) return null;

				const usageNumerator =
					counts.Reserved + counts.Utilized + counts.Completed;
				const usageRate = ((usageNumerator / totalTransactions) * 100).toFixed(
					2
				);
				const cancelRate = (
					(counts.Cancelled / totalTransactions) *
					100
				).toFixed(2);

				return {
					id: computerDoc.id,
					es_qr: coData.co_qr,
					es_name: coData.co_name,
					es_reserved: counts.Reserved,
					es_utilized: counts.Utilized,
					es_cancelled: counts.Cancelled,
					es_completed: counts.Completed,
					es_lateReturn: counts.LateReturn,
					es_usageRate: usageRate,
					es_cancelRate: cancelRate,
					es_totalTransactions: totalTransactions,
				};
			})
		);

		const filteredList = transactionList.filter(Boolean);

		filteredList.sort((a, b) =>
			a_orderBy === "Descending"
				? b.es_totalTransactions - a.es_totalTransactions
				: a.es_totalTransactions - b.es_totalTransactions
		);

		if (hasSearchFilters) {
			const countQuery = query(coRef, ...conditions);
			const countSnap = await getCountFromServer(countQuery);
			const totalPages = Math.ceil(countSnap.data().count / pageLimit);
			setCtrPage(totalPages);
		} else {
			setCtrPage(1);
		}

		console.log(filteredList);
		setMockData((prev) => ({
			...prev,
			summary: filteredList,
		}));
	} catch (error) {
		console.error("getCOSummary Error:", error);
		Alert.showDanger(error.message || "Failed to fetch co summary.");
	} finally {
		setLoading(false);
	}
}
