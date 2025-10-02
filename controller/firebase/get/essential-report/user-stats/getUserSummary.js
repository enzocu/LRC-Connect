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
	isLate,
} from "../../../../custom/customFunction";

export async function getUserSummary(
	li_id,
	setMockData,
	searchQuery,
	c_role,
	c_status,
	c_userType,
	c_courses,
	c_year,
	c_tracks,
	c_strand,
	c_institute,
	c_program,
	c_section,
	c_libraryList,
	c_resourceType,
	c_materialFormat,
	c_materialList,
	c_drList,
	c_computerList,
	c_dateRangeStart,
	c_dateRangeEnd,
	c_orderBy,
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
		const conditions = [where("us_status", "==", c_status)];

		if (c_role === "Patron") {
			if (c_libraryList && c_libraryList !== "All") {
				conditions.push(
					where("us_liID", "==", doc(db, "library", c_libraryList))
				);
			} else {
				conditions.push(where("us_liID", "==", li_id));
			}

			if (c_userType !== "All") {
				conditions.push(where("us_type", "==", c_userType));
			} else {
				conditions.push(where("us_level", "in", ["USR-6", "USR-5"]));
			}

			if (c_courses !== "All") {
				conditions.push(where("us_courses", "==", c_courses));
			}

			if (c_year !== "All") {
				conditions.push(where("us_year", "==", c_year));
			}

			if (c_tracks !== "All") {
				conditions.push(where("us_tracks", "==", c_tracks));
			}

			if (c_strand !== "All") {
				conditions.push(where("us_strand", "==", c_strand));
			}

			if (c_institute !== "All") {
				conditions.push(where("us_institute", "==", c_institute));
			}

			if (c_program !== "All") {
				conditions.push(where("us_program", "==", c_program));
			}

			if (c_section !== "") {
				conditions.push(where("us_section", "==", c_section));
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
			(isQRSearch || isSearchEmpty) && c_userType == "All";

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

		const transactionList = await Promise.all(
			snapshot.docs.map(async (userDoc) => {
				const usData = userDoc.data();
				const userRef = userDoc.ref;

				let userType = usData.us_type;

				if (c_role !== "Patron") {
					const matchedLib = usData.us_library?.find(
						(lib) => lib.us_liID?.id === c_libraryList
					);
					if (!matchedLib) return null;
					if (
						c_userType &&
						c_userType !== "All" &&
						matchedLib.us_type !== c_userType
					)
						return null;

					userType = matchedLib.us_type;
				}

				const fullName =
					`${usData.us_fname}${usData.us_mname}${usData.us_lname}`.toLowerCase();
				if (
					!isSearchEmpty &&
					!isQRSearch &&
					!fullName.includes(searchQuery.toLowerCase())
				) {
					return null;
				}

				const transactionConditions = [where("tr_liID", "==", li_id)];
				if (c_role !== "Patron") {
					transactionConditions.push(where("tr_modifiedBy", "==", userRef));
				} else {
					transactionConditions.push(where("tr_usID", "==", userRef));
				}

				if (c_resourceType && c_resourceType !== "All") {
					transactionConditions.push(where("tr_type", "==", c_resourceType));
				}
				if (c_materialFormat && c_materialFormat !== "All") {
					transactionConditions.push(
						where("tr_format", "==", c_materialFormat)
					);
				}
				if (c_materialList && c_materialList !== "All") {
					transactionConditions.push(
						where("tr_maID", "==", doc(db, "material", c_materialList))
					);
				}
				if (c_drList && c_drList !== "All") {
					transactionConditions.push(
						where("tr_drID", "==", doc(db, "discussionrooms", c_drList))
					);
				}
				if (c_computerList && c_computerList !== "All") {
					transactionConditions.push(
						where("tr_coID", "==", doc(db, "computers", c_computerList))
					);
				}

				if (c_dateRangeStart !== "") {
					transactionConditions.push(
						where(
							"tr_createdAt",
							">=",
							convertDateToTimestamp(c_dateRangeStart)
						)
					);
				}
				if (c_dateRangeEnd !== "") {
					transactionConditions.push(
						where("tr_createdAt", "<=", convertDateToTimestamp(c_dateRangeEnd))
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

				transSnap.forEach((snap) => {
					const t = snap.data();
					const { tr_status } = t;

					if (tr_status === "Reserved") counts.Reserved++;
					if (tr_status === "Utilized") counts.Utilized++;
					if (tr_status === "Cancelled") counts.Cancelled++;
					if (tr_status === "Completed") counts.Completed++;

					// ✅ Use helper for Late Return
					if (isLate(t, now)) {
						counts.LateReturn++;
					}
				});

				const totalTransactions =
					counts.Reserved +
					counts.Utilized +
					counts.Cancelled +
					counts.Completed;

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
					id: userDoc.id,
					es_qr: usData.us_qr,
					es_name: `${usData.us_fname} ${usData.us_mname} ${usData.us_lname}`,
					es_type: userType,
					es_schoolID: usData.us_schoolID,
					es_photoURL: usData.us_photoURL,
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
			c_orderBy === "Descending"
				? b.es_totalTransactions - a.es_totalTransactions
				: a.es_totalTransactions - b.es_totalTransactions
		);

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
			usersWithMostTransaction: filteredList,
		}));
	} catch (error) {
		console.error("getUserSummary Error:", error);
		Alert.showDanger(error.message || "Failed to fetch users summary.");
		return [];
	} finally {
		setLoading(false);
	}
}
