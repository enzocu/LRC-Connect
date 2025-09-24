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

export async function getDiscussionList(
	li_id,
	setDiscussionData,
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
		const discussionRef = collection(db, "discussionrooms");

		const isQRSearch = searchQuery?.startsWith("DRM-");
		const isSearchEmpty = !searchQuery || searchQuery.trim() === "";

		let conditions = [
			where("dr_liID", "==", li_id),
			where("dr_status", "==", status),
		];

		if (b_dateRangeStart !== "") {
			conditions.push(
				where("dr_createdAt", ">=", convertDateToTimestamp(b_dateRangeStart))
			);
		}

		if (b_dateRangeEnd !== "") {
			conditions.push(
				where("dr_createdAt", "<=", convertDateToTimestamp(b_dateRangeEnd))
			);
		}

		if (isQRSearch) {
			conditions.push(where("dr_qr", "==", searchQuery));
		} else if (isSearchEmpty) {
			conditions.push(orderBy("dr_createdAt"));
		}

		const hasSearchFilters = isQRSearch || isSearchEmpty;

		let finalQuery;

		if (hasSearchFilters) {
			const hasCursor = currentPage > 1 && pageCursors[currentPage - 2];
			finalQuery = hasCursor
				? query(
						discussionRef,
						...conditions,
						startAfter(pageCursors[currentPage - 2]),
						limit(pageLimit)
				  )
				: query(discussionRef, ...conditions, limit(pageLimit));
		} else {
			finalQuery = query(discussionRef, ...conditions);
		}

		const snapshot = await getDocs(finalQuery);

		const lastVisible = snapshot.docs[snapshot.docs.length - 1];
		if (hasSearchFilters && lastVisible) {
			const updatedCursors = [...pageCursors];
			updatedCursors[currentPage - 1] = lastVisible;
			setPageCursors(updatedCursors);
		}

		const data = snapshot.docs.map((doc) => {
			const raw = doc.data();
			if (
				searchQuery &&
				!isSearchEmpty &&
				!isQRSearch &&
				!raw.dr_name.toLowerCase().includes(searchQuery.toLowerCase())
			) {
				return null;
			}

			return {
				id: doc.id,
				...raw,
				dr_createdAtFormatted: formatDate(raw.dr_createdAt),
				dr_minDurationFormatted: formatDuration(raw.dr_minDuration),
				dr_maxDurationFormatted: formatDuration(raw.dr_maxDuration),
			};
		});

		console.log(data.filter(Boolean));
		setDiscussionData(
			mock
				? (prev) => ({ ...prev, totalRooms: data.filter(Boolean) })
				: data.filter(Boolean)
		);

		if (hasSearchFilters) {
			const countQuery = query(discussionRef, ...conditions);
			const countSnap = await getCountFromServer(countQuery);
			const totalPages = Math.ceil(countSnap.data().count / pageLimit);
			setCtrPage(totalPages);
		} else {
			setCtrPage(1);
		}
	} catch (error) {
		console.error("getDiscussionList Error:", error.message);
		Alert.showDanger("Failed to load discussions: " + error.message);
	} finally {
		setLoading(false);
	}
}
