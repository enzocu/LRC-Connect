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

export async function getLibraryList(
	setLibraryData,
	status,
	searchQuery,
	setLoading,
	Alert,
	setCtrPage,
	pageLimit,
	pageCursors,
	setPageCursors,
	currentPage
) {
	setLoading(true);

	try {
		const libraryRef = collection(db, "library");
		let conditions = [where("li_status", "==", status)];

		const isQRSearch = searchQuery?.startsWith("LIB-");
		const isSearchEmpty = !searchQuery || searchQuery.trim() === "";

		if (!isSearchEmpty && isQRSearch) {
			conditions.push(where("li_qr", "==", searchQuery));
		} else if (isSearchEmpty) {
			conditions.push(orderBy("li_createdAt"));
		}

		const hasSearchFilters = isQRSearch || isSearchEmpty;

		let finalQuery;
		if (hasSearchFilters) {
			const hasCursor = currentPage > 1 && pageCursors[currentPage - 2];
			finalQuery = hasCursor
				? query(
						libraryRef,
						...conditions,
						startAfter(pageCursors[currentPage - 2]),
						limit(pageLimit)
				  )
				: query(libraryRef, ...conditions, limit(pageLimit));
		} else {
			finalQuery = query(libraryRef, ...conditions);
		}

		const snapshot = await getDocs(finalQuery);

		const lastVisible = snapshot.docs[snapshot.docs.length - 1];
		if (hasSearchFilters && lastVisible) {
			const updatedCursors = [...pageCursors];
			updatedCursors[currentPage - 1] = lastVisible;
			setPageCursors(updatedCursors);
		}

		const data = snapshot.docs.map((doc) => {
			const d = doc.data();

			if (
				searchQuery &&
				!isSearchEmpty &&
				!isQRSearch &&
				!d.li_name.toLowerCase().includes(searchQuery.toLowerCase())
			) {
				return null;
			}

			return {
				id: doc.id,
				li_name: d.li_name || "",
				li_address: d.li_address || "",
				li_photoURL: d.li_photoURL,
			};
		});

		setLibraryData(data.filter(Boolean));

		if (hasSearchFilters) {
			const countQuery = query(libraryRef, ...conditions);
			const countSnap = await getCountFromServer(countQuery);
			const totalPages = Math.ceil(countSnap.data().count / pageLimit);
			setCtrPage(totalPages);
		} else {
			setCtrPage(1);
		}
	} catch (error) {
		Alert.showDanger(error.message);
		console.error(error.message);
	} finally {
		setLoading(false);
	}
}
