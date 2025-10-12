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

export async function getMaterialSummary(
	li_id,
	setMockData,
	searchQuery,
	a_type,
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
		let transactionList = [];
		const now = new Date();

		if (a_type === "Material") {
			const materialRef = collection(db, "material");
			const conditions = [where("ma_liID", "==", li_id)];
			const isQRSearch = searchQuery?.startsWith("MTL-");
			const isSearchEmpty = !searchQuery || searchQuery.trim() === "";

			if (isQRSearch) {
				conditions.push(where("ma_qr", "==", searchQuery));
			} else {
				conditions.push(orderBy("ma_copyright", "desc"));
			}

			const hasSearchFilters =
				(isQRSearch || isSearchEmpty) && a_userType == "All";

			let finalQuery;
			if (hasSearchFilters) {
				const hasCursor = currentPage > 1 && pageCursors[currentPage - 2];
				finalQuery = hasCursor
					? query(
							materialRef,
							...conditions,
							startAfter(pageCursors[currentPage - 2]),
							limit(pageLimit)
					  )
					: query(materialRef, ...conditions, limit(pageLimit));
			} else {
				finalQuery = query(materialRef, ...conditions);
			}

			const snapshot = await getDocs(finalQuery);
			const lastVisible = snapshot.docs[snapshot.docs.length - 1];
			if (hasSearchFilters && lastVisible) {
				const newCursors = [...pageCursors];
				newCursors[currentPage - 1] = lastVisible;
				setPageCursors(newCursors);
			}

			transactionList = await Promise.all(
				snapshot.docs.map(async (materialDoc) => {
					const maData = materialDoc.data();
					const maRef = materialDoc.ref;

					if (
						!isSearchEmpty &&
						!isQRSearch &&
						!maData.ma_title?.toLowerCase().includes(searchQuery.toLowerCase())
					) {
						return null;
					}

					const transactionConditions = [
						where("tr_maID", "==", maRef),
						where("tr_liID", "==", li_id),
						where("tr_type", "==", "Material"),
					];

					if (a_dateRangeStart) {
						transactionConditions.push(
							where(
								"tr_createdAt",
								">=",
								convertDateToTimestamp(a_dateRangeStart)
							)
						);
					}
					if (a_dateRangeEnd) {
						transactionConditions.push(
							where(
								"tr_createdAt",
								"<=",
								convertDateToTimestamp(a_dateRangeEnd)
							)
						);
					}

					const transSnap = await getDocs(
						query(collection(db, "transaction"), ...transactionConditions)
					);

					const result = await computeTransactionStats(
						transSnap,
						now,
						a_userType
					);

					if (!result) return null;

					return {
						id: materialDoc.id,
						es_type: maData.ma_title,
						...result,
					};
				})
			);

			if (hasSearchFilters) {
				const countQuery = query(materialRef, ...conditions);
				const countSnap = await getCountFromServer(countQuery);
				const totalPages = Math.ceil(countSnap.data().count / pageLimit);
				setCtrPage(totalPages);
			} else {
				setCtrPage(1);
			}
		} else {
			const formats = ["Hard Copy", "Soft Copy", "Audio Copy"];

			transactionList = await Promise.all(
				formats.map(async (format) => {
					const transactionConditions = [
						where("tr_liID", "==", li_id),
						where("tr_type", "==", "Material"),
						where("tr_format", "==", format),
					];

					if (a_dateRangeStart) {
						transactionConditions.push(
							where(
								"tr_createdAt",
								">=",
								convertDateToTimestamp(a_dateRangeStart)
							)
						);
					}
					if (a_dateRangeEnd) {
						transactionConditions.push(
							where(
								"tr_createdAt",
								"<=",
								convertDateToTimestamp(a_dateRangeEnd)
							)
						);
					}

					const transSnap = await getDocs(
						query(collection(db, "transaction"), ...transactionConditions)
					);

					const result = await computeTransactionStats(
						transSnap,
						now,
						a_userType
					);

					if (!result) return null;

					return {
						es_type: format,
						...result,
					};
				})
			);
		}

		const filteredList = transactionList.filter(Boolean);

		filteredList.sort((a, b) =>
			a_orderBy === "Descending"
				? b.es_totalTransactions - a.es_totalTransactions
				: a.es_totalTransactions - b.es_totalTransactions
		);

		setMockData((prev) => ({
			...prev,
			summary: filteredList,
		}));
	} catch (error) {
		console.error("getMaterialSummary Error:", error);
		Alert.showDanger(error.message || "Failed to fetch material summary.");
	} finally {
		setLoading(false);
	}
}

async function computeTransactionStats(transSnap, now, a_userType) {
	const counts = {
		es_reserved: 0,
		es_utilized: 0,
		es_cancelled: 0,
		es_completed: 0,
		es_lateReturn: 0,
	};

	for (const snap of transSnap.docs) {
		const t = snap.data();
		const { tr_usID, tr_status } = t;

		if (a_userType !== "All") {
			const usSnap = await getDoc(tr_usID);
			const usData = usSnap.exists() ? usSnap.data() : null;
			if (!usData || usData.us_type !== a_userType) continue;
		}

		if (tr_status === "Reserved") counts.es_reserved++;
		if (tr_status === "Utilized") counts.es_utilized++;
		if (tr_status === "Cancelled") counts.es_cancelled++;
		if (tr_status === "Completed") counts.es_completed++;

		if (isLate(t, now)) {
			counts.es_lateReturn++;
		}
	}

	const totalTransactions =
		counts.es_reserved +
		counts.es_utilized +
		counts.es_cancelled +
		counts.es_completed;

	if (totalTransactions === 0) return null;
	const usageNumerator =
		counts.es_reserved + counts.es_utilized + counts.es_completed;
	const usageRate = ((usageNumerator / totalTransactions) * 100).toFixed(2);
	const cancelRate = ((counts.es_cancelled / totalTransactions) * 100).toFixed(
		2
	);

	return {
		...counts,
		es_usageRate: usageRate,
		es_cancelRate: cancelRate,
		es_totalTransactions: totalTransactions,
	};
}
