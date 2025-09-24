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
	doc,
} from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import { getDateOnly } from "../../custom/customFunction";

export async function getTransactionSummary(
	li_id,
	setTransactionData,

	searchQuery,
	selectedLibrary,
	selectedStudentType,

	showOverdueOnly,
	showActivePenaltiesOnly,

	sortByTransactions,
	sortByPenalties,

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
		const usersRef = collection(db, "users");
		const conditions = [where("us_status", "in", ["Active", "Inactive"])];

		if (selectedLibrary && selectedLibrary !== "All") {
			conditions.push(
				where("us_liID", "==", doc(db, "library", selectedLibrary))
			);
		} else {
			conditions.push(where("us_liID", "==", li_id));
		}

		if (selectedStudentType !== "All") {
			conditions.push(where("us_type", "==", selectedStudentType));
		} else {
			conditions.push(where("us_level", "in", ["USR-5", "USR-6"]));
		}

		const isQRSearch = searchQuery?.startsWith("USR-");
		const isSearchEmpty = !searchQuery || searchQuery.trim() === "";

		if (isQRSearch) {
			conditions.push(where("us_qr", "==", searchQuery));
		} else {
			conditions.push(orderBy("us_createdAt", "desc"));
		}

		const hasSearchFilters =
			(isQRSearch || isSearchEmpty) &&
			!showOverdueOnly &&
			!showActivePenaltiesOnly;

		let finalQuery;

		if (hasSearchFilters) {
			console.log("pagination");
			const hasCursor = currentPage > 1 && pageCursors[currentPage - 2];
			finalQuery = hasCursor
				? query(
						usersRef,
						...conditions,
						startAfter(pageCursors[currentPage - 2]),
						limit(pageLimit)
				  )
				: query(usersRef, ...conditions, limit(pageLimit));
		} else {
			console.log("no pagination");
			finalQuery = query(usersRef, ...conditions);
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
			snapshot.docs.map(async (userDoc) => {
				const usData = userDoc.data();
				const userRef = userDoc.ref;

				const fullName =
					`${usData.us_fname}${usData.us_mname}${usData.us_lname}`.toLowerCase();
				if (
					!isSearchEmpty &&
					!isQRSearch &&
					!fullName.includes(searchQuery.toLowerCase())
				) {
					return null;
				}

				const [libSnap, transSnap, penaltiesSnap] = await Promise.all([
					getDoc(usData.us_liID),
					getDocs(
						query(
							collection(db, "transaction"),
							where("tr_usID", "==", userRef),
							where("tr_liID", "==", li_id)
						)
					),
					getDocs(
						query(
							collection(db, "report"),
							where("re_usID", "==", userRef),
							where("re_status", "==", "Active")
						)
					),
				]);

				const libData = libSnap.exists() ? libSnap.data() : {};
				const counts = {
					Reserved: 0,
					Utilized: 0,
					Cancelled: 0,
					Completed: 0,
					LateReturn: 0,
					Overdue: 0,
				};

				transSnap.forEach((snap) => {
					const t = snap.data();
					const {
						tr_status,
						tr_type,
						tr_dateDue,
						tr_sessionEnd,
						tr_actualEnd,
					} = t;

					if (tr_status === "Reserved") counts.Reserved++;
					if (tr_status === "Utilized") counts.Utilized++;
					if (tr_status === "Cancelled") counts.Cancelled++;
					if (tr_status === "Completed") counts.Completed++;

					if (
						tr_status === "Utilized" &&
						((tr_type === "Material" &&
							tr_dateDue?.toDate() < getDateOnly(now)) ||
							(tr_type !== "Material" && tr_sessionEnd?.toDate() < now))
					) {
						counts.Overdue++;
					}

					if (
						tr_status === "Completed" &&
						tr_actualEnd &&
						((tr_type === "Material" &&
							tr_dateDue?.toDate() < getDateOnly(tr_actualEnd.toDate())) ||
							(tr_type !== "Material" &&
								tr_sessionEnd?.toDate() < tr_actualEnd.toDate()))
					) {
						counts.LateReturn++;
					}
				});

				const activePenalties = penaltiesSnap.size;

				if (showOverdueOnly && counts.Overdue === 0) return null;
				if (showActivePenaltiesOnly && activePenalties === 0) return null;

				const totalTransactions =
					counts.Reserved +
					counts.Utilized +
					counts.Cancelled +
					counts.Completed;
				if (totalTransactions === 0) return null;

				return {
					id: userDoc.id,
					us_qr: usData.us_qr,
					us_name: `${usData.us_fname} ${usData.us_mname} ${usData.us_lname}`,
					us_type: usData.us_type,
					us_schoolID: usData.us_schoolID,
					us_email: usData.us_email,
					us_photoURL: usData.us_photoURL,
					us_library: libData.li_name || "",
					us_reserved: counts.Reserved,
					us_utilized: counts.Utilized,
					us_cancelled: counts.Cancelled,
					us_completed: counts.Completed,
					us_lateReturn: counts.LateReturn,
					us_currentOverdue: counts.Overdue,
					us_activePenalties: activePenalties,
					us_totalTransactions: totalTransactions,
				};
			})
		);

		const filteredList = transactionList.filter(Boolean);

		if (sortByTransactions != "none") {
			filteredList.sort((a, b) =>
				sortByTransactions === "asc"
					? a.us_totalTransactions - b.us_totalTransactions
					: b.us_totalTransactions - a.us_totalTransactions
			);
		}

		if (sortByPenalties != "none") {
			filteredList.sort((a, b) =>
				sortByPenalties === "asc"
					? a.us_activePenalties - b.us_activePenalties
					: b.us_activePenalties - a.us_activePenalties
			);
		}

		setTransactionData(filteredList);

		if (hasSearchFilters) {
			const countQuery = query(usersRef, ...conditions);
			const countSnap = await getCountFromServer(countQuery);
			const totalPages = Math.ceil(countSnap.data().count / pageLimit);
			setCtrPage(totalPages);
		} else {
			setCtrPage(1);
		}
	} catch (error) {
		console.error("getTransactionSummary Error:", error);
		Alert.showDanger(error.message || "Failed to fetch transaction summary.");
	} finally {
		setLoading(false);
	}
}

export async function getEssentialFilter(setLibrary, Alert) {
	try {
		const librariesSnap = await getDocs(collection(db, "library"));
		const libraries = librariesSnap.docs.map((d) => ({
			id: d.id,
			li_name: d.data().li_name,
		}));
		setLibrary(libraries);
	} catch (error) {
		console.error("getEssentialFilter Error:", error);
		Alert.showDanger(error.message || "Failed to fetch essential filters.");
	}
}
