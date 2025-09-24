import {
	collection,
	query,
	orderBy,
	limit,
	startAfter,
	onSnapshot,
	getCountFromServer,
	where,
	getDoc,
} from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import { getRelativeTime } from "../../custom/customFunction";

export function getNewsAnnouncementList(
	isPersonnel,
	li_id,
	setData,
	type,
	searchQuery,
	setLoading,
	Alert,
	pageLimit,
	pagination,
	setPagination
) {
	setLoading(true);

	const isSearchEmpty = !searchQuery || searchQuery.trim() === "";
	const { currentPage, pageCursors } = pagination[type];

	try {
		const naRef = collection(db, "news_announcements");

		const conditions = [
			where("na_liID", "==", li_id),
			where(
				"na_visibility",
				"in",
				isPersonnel ? ["General", "Personnel", "Patron"] : ["General", "Patron"]
			),
			where("na_status", "==", "Active"),
			where("na_type", "==", type),
			orderBy("na_createdAt", "desc"),
		];

		const hasCursor = currentPage > 1 && pageCursors[currentPage - 2];
		const finalQuery = isSearchEmpty
			? hasCursor
				? query(
						naRef,
						...conditions,
						startAfter(pageCursors[currentPage - 2]),
						limit(pageLimit)
				  )
				: query(naRef, ...conditions, limit(pageLimit))
			: query(naRef, ...conditions);

		const unsubscribe = onSnapshot(
			finalQuery,
			async (snapshot) => {
				const lastVisible = snapshot.docs.at(-1);

				if (isSearchEmpty && lastVisible) {
					const updatedCursors = [...pageCursors];
					updatedCursors[currentPage - 1] = lastVisible;

					setPagination((prev) => ({
						...prev,
						[type]: {
							...prev[type],
							pageCursors: updatedCursors,
						},
					}));
				}

				const data = await Promise.all(
					snapshot.docs.map(async (doc) => {
						const raw = doc.data();

						if (
							searchQuery &&
							!raw.na_title?.toLowerCase().includes(searchQuery.toLowerCase())
						) {
							return null;
						}

						let userData = {};
						if (raw.na_author) {
							const usSnap = await getDoc(raw.na_author);
							if (usSnap.exists()) userData = usSnap.data();
						}

						return {
							id: doc.id,
							...raw,
							na_author: `${userData.us_fname ?? ""} ${
								userData.us_mname ?? ""
							} ${userData.us_lname ?? ""} ${userData.us_suffix ?? ""}`.trim(),
							na_createdAtFormatted: getRelativeTime(raw.na_createdAt),
						};
					})
				);

				setData(data.filter(Boolean));
				setLoading(false);
			},
			(error) => {
				setLoading(false);
				Alert.showDanger(error.message);
			}
		);

		// Count only once
		if (isSearchEmpty) {
			const countQuery = query(naRef, ...conditions);
			getCountFromServer(countQuery).then((countSnap) => {
				const totalPages = Math.ceil(countSnap.data().count / pageLimit);
				setPagination((prev) => ({
					...prev,
					[type]: {
						...prev[type],
						ctrPages: totalPages,
					},
				}));
			});
		} else {
			setPagination((prev) => ({
				...prev,
				[type]: {
					...prev[type],
					ctrPages: 1,
				},
			}));
		}

		return unsubscribe;
	} catch (error) {
		setLoading(false);
		Alert.showDanger(error.message);
		console.error("Error fetching News/Announcement list:", error.message);
	}
}
