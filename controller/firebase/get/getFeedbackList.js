import {
	doc,
	collection,
	query,
	orderBy,
	limit,
	startAfter,
	onSnapshot,
	where,
	getCountFromServer,
	getDoc,
} from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import { getRelativeTime } from "../../custom/customFunction";

export function getFeedbackList(
	li_id,
	setData,
	searchQuery,
	selectedStatus,
	setLoading,
	Alert,
	pageLimit,
	pagination,
	setPagination
) {
	setLoading(true);

	try {
		const feRef = collection(db, "feedback");
		const isSearchEmpty = !searchQuery || searchQuery.trim() === "";

		const typeKey = "feedback";
		const { currentPage, pageCursors } = pagination[typeKey];

		let conditions = [
			where(
				"fe_liID",
				"==",
				typeof li_id === "object" && li_id.id
					? li_id
					: doc(db, "library", li_id)
			),
			where("fe_status", "==", "Active"),
			orderBy("fe_createdAt", "desc"),
		];

		if (selectedStatus !== "All") {
			conditions.push(
				where("fe_isRead", "==", selectedStatus === "unread" ? false : true)
			);
		}

		const hasCursor = currentPage > 1 && pageCursors[currentPage - 2];
		const finalQuery = isSearchEmpty
			? hasCursor
				? query(
						feRef,
						...conditions,
						startAfter(pageCursors[currentPage - 2]),
						limit(pageLimit)
				  )
				: query(feRef, ...conditions, limit(pageLimit))
			: query(feRef, ...conditions);

		const unsubscribe = onSnapshot(
			finalQuery,
			async (snapshot) => {
				const lastVisible = snapshot.docs.at(-1);

				if (isSearchEmpty && lastVisible) {
					const updatedCursors = [...pageCursors];
					updatedCursors[currentPage - 1] = lastVisible;

					setPagination((prev) => ({
						...prev,
						[typeKey]: {
							...prev[typeKey],
							pageCursors: updatedCursors,
						},
					}));
				}

				const data = await Promise.all(
					snapshot.docs.map(async (doc) => {
						const raw = doc.data();

						if (
							!isSearchEmpty &&
							!raw.fe_content?.toLowerCase().includes(searchQuery.toLowerCase())
						) {
							return null;
						}

						let userData = {};
						if (raw.fe_sender) {
							const usSnap = await getDoc(raw.fe_sender);
							if (usSnap.exists()) userData = usSnap.data();
						}

						return {
							id: doc.id,
							...raw,
							fe_sender: `${userData.us_fname ?? ""} ${
								userData.us_mname ?? ""
							} ${userData.us_lname ?? ""} ${userData.us_suffix ?? ""}`.trim(),
							fe_ustype: userData.us_type,
							fe_schoolID: userData.us_schoolID,
							fe_avatar: userData.us_photoURL,
							fe_createdAtFormatted: raw.fe_createdAt
								? getRelativeTime(raw.fe_createdAt)
								: "",
						};
					})
				);

				setData(data.filter(Boolean));

				if (isSearchEmpty) {
					const countSnap = await getCountFromServer(
						query(feRef, ...conditions)
					);
					const totalPages = Math.ceil(countSnap.data().count / pageLimit);

					setPagination((prev) => ({
						...prev,
						[typeKey]: {
							...prev[typeKey],
							ctrPages: totalPages,
						},
					}));
				} else {
					setPagination((prev) => ({
						...prev,
						[typeKey]: {
							...prev[typeKey],
							ctrPages: 1,
						},
					}));
				}

				setLoading(false);
			},
			(error) => {
				Alert.showDanger(error.message);
				console.error("Error in onSnapshot for feedback:", error.message);
				setLoading(false);
			}
		);

		return unsubscribe;
	} catch (error) {
		Alert.showDanger(error.message);
		console.error("Error setting up feedback listener:", error.message);
		setLoading(false);
	}
}
