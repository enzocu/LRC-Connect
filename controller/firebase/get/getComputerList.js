import {
	collection,
	query,
	orderBy,
	limit,
	startAfter,
	getDocs,
	getCountFromServer,
	where,
} from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import {
	formatDate,
	formatDuration,
	convertDateToTimestamp,
} from "../../custom/customFunction";

export async function getComputerList(
	li_id,
	setComputerData,
	status,
	b_dateRangeStart,
	b_dateRangeEnd,
	searchQuery,
	setLoading,
	Alert,
	setCtrPage,
	pageLimit,
	pageCursors,
	setPageCursors,
	currentPage,
	mock = false
) {
	setLoading(true);

	try {
		const computersRef = collection(db, "computers");

		const isQRSearch = searchQuery?.startsWith("CMP-");
		const isSearchEmpty = !searchQuery || searchQuery.trim() === "";

		// Base conditions
		let conditions = [
			where("co_liID", "==", li_id),
			where("co_status", "==", status),
		];

		if (b_dateRangeStart !== "") {
			conditions.push(
				where("co_createdAt", ">=", convertDateToTimestamp(b_dateRangeStart))
			);
		}

		if (b_dateRangeEnd !== "") {
			conditions.push(
				where("co_createdAt", "<=", convertDateToTimestamp(b_dateRangeEnd))
			);
		}

		if (!isSearchEmpty && isQRSearch) {
			conditions.push(where("co_qr", "==", searchQuery));
		} else if (isSearchEmpty) {
			conditions.push(orderBy("co_createdAt"));
		}

		const hasSearchFilters = isQRSearch || isSearchEmpty;

		let finalQuery;

		if (hasSearchFilters) {
			const hasCursor = currentPage > 1 && pageCursors[currentPage - 2];
			finalQuery = hasCursor
				? query(
						computersRef,
						...conditions,
						startAfter(pageCursors[currentPage - 2]),
						limit(pageLimit)
				  )
				: query(computersRef, ...conditions, limit(pageLimit));
		} else {
			finalQuery = query(computersRef, ...conditions);
		}

		const snapshot = await getDocs(finalQuery);

		// Save pagination cursor
		const lastVisible = snapshot.docs[snapshot.docs.length - 1];
		if (hasSearchFilters && lastVisible) {
			const updatedCursors = [...pageCursors];
			updatedCursors[currentPage - 1] = lastVisible;
			setPageCursors(updatedCursors);
		}

		// Map and format data
		const data = snapshot.docs.map((doc) => {
			const raw = doc.data();
			if (
				searchQuery &&
				!isSearchEmpty &&
				!isQRSearch &&
				!raw.co_name.toLowerCase().includes(searchQuery.toLowerCase())
			) {
				return null;
			}

			return {
				id: doc.id,
				...raw,
				co_dateFormatted: formatDate(raw.co_date),
				co_createdAtFormatted: formatDate(raw.co_createdAt),
				co_minDurationFormatted: formatDuration(raw.co_minDuration),
				co_maxDurationFormatted: formatDuration(raw.co_maxDuration),
			};
		});

		setComputerData(
			mock
				? (prev) => ({ ...prev, totalComputers: data.filter(Boolean) })
				: data.filter(Boolean)
		);

		// Handle page count
		if (hasSearchFilters) {
			const countQuery = query(computersRef, ...conditions);
			const countSnap = await getCountFromServer(countQuery);
			const totalPages = Math.ceil(countSnap.data().count / pageLimit);
			setCtrPage(totalPages);
		} else {
			setCtrPage(1);
		}
	} catch (error) {
		Alert.showDanger(error.message);
		console.error("Error fetching computer list:", error.message);
	} finally {
		setLoading(false);
	}
}
