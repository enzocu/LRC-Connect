import {
	collection,
	query,
	orderBy,
	limit,
	startAfter,
	onSnapshot,
	getCountFromServer,
	where,
} from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import { formatDate } from "../../custom/customFunction";

export function getFaqsList(
	li_id,
	setFaqData,
	setLoading,
	Alert,
	pageLimit,
	pagination,
	setPagination
) {
	setLoading(true);

	const typeKey = "faqs";
	const { currentPage, pageCursors } = pagination[typeKey];

	try {
		const faRef = collection(db, "faqs");
		const conditions = [
			where("fa_liID", "==", li_id),
			where("fa_status", "==", "Active"),
			orderBy("fa_createdAt", "desc"),
		];

		const hasCursor = currentPage > 1 && pageCursors[currentPage - 2];
		const finalQuery = hasCursor
			? query(
					faRef,
					...conditions,
					startAfter(pageCursors[currentPage - 2]),
					limit(pageLimit)
			  )
			: query(faRef, ...conditions, limit(pageLimit));

		// Synchronous return of unsubscribe
		const unsubscribe = onSnapshot(
			finalQuery,
			async (snapshot) => {
				const lastVisible = snapshot.docs.at(-1);

				if (lastVisible) {
					const updatedCursors = [...pageCursors];
					updatedCursors[currentPage - 1] = lastVisible;
					setPagination((prev) => ({
						...prev,
						[typeKey]: { ...prev[typeKey], pageCursors: updatedCursors },
					}));
				}

				const data = await Promise.all(
					snapshot.docs.map(async (doc) => {
						const raw = doc.data();
						return {
							id: doc.id,
							...raw,
							fa_createdAtFormatted: formatDate(raw.fa_createdAt),
						};
					})
				);

				setFaqData(data);
				setLoading(false);
			},
			(error) => {
				Alert.showDanger(error.message);
				setLoading(false);
			}
		);

		getCountFromServer(query(faRef, ...conditions))
			.then((countSnap) => {
				const totalPages = Math.ceil(countSnap.data().count / pageLimit);
				setPagination((prev) => ({
					...prev,
					[typeKey]: { ...prev[typeKey], ctrPages: totalPages },
				}));
			})
			.catch((err) => console.error(err));

		return unsubscribe;
	} catch (error) {
		Alert.showDanger(error.message);
		setLoading(false);
		return () => {};
	}
}
