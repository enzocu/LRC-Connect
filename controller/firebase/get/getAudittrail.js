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
	getDocs,
	doc,
} from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import {
	formatDateTime,
	convertDateToTimestamp,
} from "../../custom/customFunction";

export function getAudittrail(
	li_id,
	setAuditData,
	searchQuery,
	selectedStudLibrary,
	selectedusType,
	selectedAction,
	selectedStatus,
	selectedStartDate,
	selectedEndDate,
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
		const auditRef = collection(db, "audittrail");

		const isSearchEmpty = searchQuery.trim() === "";
		const isQRSearch = searchQuery?.startsWith("USR-");

		if (li_id == "All") {
			setLoading(false);
			return;
		}

		const libraryID =
			typeof li_id === "string" ? doc(db, "library", li_id) : li_id;

		let conditions = [where("au_liID", "==", libraryID)];

		if (selectedAction !== "All") {
			conditions.push(where("au_actionType", "==", selectedAction));
		}

		if (selectedStatus !== "All") {
			conditions.push(where("au_status", "==", selectedStatus));
		}

		if (selectedStartDate !== "All") {
			conditions.push(
				where("au_createdAt", ">=", convertDateToTimestamp(selectedStartDate))
			);
		}

		if (selectedEndDate !== "All") {
			conditions.push(
				where("au_createdAt", "<=", convertDateToTimestamp(selectedEndDate))
			);
		}

		if (isSearchEmpty) {
			conditions.push(orderBy("au_createdAt", "desc"));
		}

		const hasSearchFilters =
			isSearchEmpty && selectedusType == "All" && selectedStudLibrary == "All";

		let finalQuery;
		if (hasSearchFilters) {
			const hasCursor = currentPage > 1 && pageCursors[currentPage - 2];
			finalQuery = hasCursor
				? query(
						auditRef,
						...conditions,
						startAfter(pageCursors[currentPage - 2]),
						limit(pageLimit)
				  )
				: query(auditRef, ...conditions, limit(pageLimit));
		} else {
			finalQuery = query(auditRef, ...conditions);
		}

		const unsubscribe = onSnapshot(
			finalQuery,
			async (snapshot) => {
				try {
					const lastVisible = snapshot.docs[snapshot.docs.length - 1];
					if (hasSearchFilters && lastVisible) {
						const updatedCursors = [...pageCursors];
						updatedCursors[currentPage - 1] = lastVisible;
						setPageCursors(updatedCursors);
					}

					const promises = snapshot.docs.map(async (doc) => {
						const raw = doc.data();

						const userSnap = await getDoc(raw.au_usID);
						if (!userSnap.exists()) return null;

						const userData = userSnap.data();
						const fullName = `${userData.us_fname || ""} ${
							userData.us_mname || ""
						} ${userData.us_lname || ""} ${userData.us_suffix || ""}`.trim();

						let us_type = userData.us_type;
						let us_libraryID = userData.us_liID;

						let studLibrary =
							selectedStudLibrary != "All" ? selectedStudLibrary : libraryID.id;

						if (userData.us_level == "USR-1") {
							us_libraryID = libraryID;
						}

						if (
							["USR-5", "USR-6"].includes(userData.us_level) &&
							(userData.us_liID.id !== studLibrary ||
								(selectedusType != "All" &&
									userData.us_type !== selectedusType))
						) {
							return null;
						}

						if (userData.us_type === "Personnel") {
							const matchedLib = userData.us_library?.find(
								(lib) => lib.us_liID?.id === studLibrary
							);
							if (
								!matchedLib ||
								(selectedusType != "All" &&
									matchedLib.us_type !== selectedusType)
							)
								return null;
							us_type = matchedLib.us_type;
							us_libraryID = matchedLib.us_liID;
						}

						const [libSnap] = await Promise.all([getDoc(us_libraryID)]);
						const us_library = libSnap.exists() ? libSnap.data() : {};

						if (
							(isQRSearch && userData.us_qr !== searchQuery) ||
							(searchQuery &&
								!isQRSearch &&
								!fullName.toLowerCase().includes(searchQuery.toLowerCase()))
						) {
							return null;
						}

						return {
							id: doc.id,
							au_schoolId: userData.us_schoolID,
							au_userType: us_type,
							au_fullname: fullName,
							au_library: us_library.li_name,
							...raw,
							au_createdAtFormatted: formatDateTime(raw.au_createdAt),
						};
					});

					const data = await Promise.all(promises);

					setAuditData(data.filter(Boolean));

					// Page count
					if (hasSearchFilters) {
						const countQuery = query(auditRef, ...conditions);
						const countSnap = await getCountFromServer(countQuery);
						const totalPages = Math.ceil(countSnap.data().count / pageLimit);
						setCtrPage(totalPages);
					} else {
						setCtrPage(1);
					}
				} catch (innerError) {
					Alert.showDanger(innerError.message);
					console.error("Error processing snapshot:", innerError.message);
				} finally {
					setLoading(false);
				}
			},
			(error) => {
				Alert.showDanger(error.message);
				console.error("Error listening to audit list:", error.message);
				setLoading(false);
			}
		);

		return unsubscribe;
	} catch (error) {
		Alert.showDanger(error.message);
		console.error("Error setting up audit listener:", error.message);
		setLoading(false);
	}
}

export async function getAuditFilterData(setLibraryData, Alert) {
	try {
		const libQuery = query(
			collection(db, "library"),
			where("li_status", "==", "Active")
		);
		const libSnap = await getDocs(libQuery);

		const libraries = libSnap.docs.map((docSnap) => {
			const data = docSnap.data();
			return {
				id: docSnap.id,
				li_name: data.li_name || "Unnamed Library",
			};
		});

		setLibraryData(libraries);
	} catch (error) {
		console.error("[getAuditFilterData] Error:", error);
		Alert.showDanger("Failed to fetch filter data: " + error.message);
	}
}
