import {
	collection,
	query,
	where,
	limit,
	startAfter,
	getDoc,
	getCountFromServer,
	doc,
	onSnapshot,
	getDocs,
	orderBy,
} from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import {
	formatDate,
	formatTime,
	calculateDuration,
} from "../../custom/customFunction";

export async function getEntryExitList(
	isPersonnel,
	li_id,
	paID,
	setUserData,
	searchQuery,
	showLoggedIn,
	selectedStatus,
	selectedLibrary,
	selectedUsType,
	selectedCourses,
	selectedYear,
	selectedTracks,
	selectedStrand,
	selectedInstitute,
	selectedProgram,
	selectedSection,
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
		const logsRef = collection(db, "logs");

		const conditions = [
			where("lo_type", "==", showLoggedIn ? "onSite" : "onApp"),
			where("lo_status", "==", selectedStatus ? "Active" : "Inactive"),
			orderBy("lo_createdAt", "desc"),
		];

		if (isPersonnel || selectedLibrary === "All") {
			conditions.push(where("lo_liID", "==", li_id));
		} else if (!isPersonnel && selectedLibrary !== "All") {
			conditions.push(
				where("lo_liID", "==", doc(db, "library", selectedLibrary))
			);
		}

		if (!isPersonnel && paID) {
			conditions.push(where("lo_usID", "==", doc(db, "users", paID)));
		}

		const isQRSearch = searchQuery?.startsWith(isPersonnel ? "USR-" : "LIB-");
		const isSearchEmpty = !searchQuery || searchQuery.trim() === "";

		const hasSearchFilters =
			isSearchEmpty &&
			selectedCourses == "All" &&
			selectedYear == "All" &&
			selectedTracks == "All" &&
			selectedStrand == "All" &&
			selectedInstitute == "All" &&
			selectedProgram == "All" &&
			selectedSection == "" &&
			selectedUsType == "All" &&
			((isPersonnel && selectedLibrary == "All") || !isPersonnel);

		let finalQuery;

		if (hasSearchFilters) {
			const hasCursor = currentPage > 1 && pageCursors[currentPage - 2];
			finalQuery = hasCursor
				? query(
						logsRef,
						...conditions,
						startAfter(pageCursors[currentPage - 2]),
						limit(pageLimit)
				  )
				: query(logsRef, ...conditions, limit(pageLimit));
		} else {
			finalQuery = query(logsRef, ...conditions);
		}

		onSnapshot(
			finalQuery,
			async (snapshot) => {
				try {
					const lastVisible = snapshot.docs[snapshot.docs.length - 1];
					if (hasSearchFilters && lastVisible) {
						const newCursors = [...pageCursors];
						newCursors[currentPage - 1] = lastVisible;
						setPageCursors(newCursors);
					}

					const users = await Promise.all(
						snapshot.docs.map(async (docSnap) => {
							const data = docSnap.data();
							const id = docSnap.id;

							const userSnap = isPersonnel ? await getDoc(data.lo_usID) : {};
							const userData = userSnap.exists ? userSnap.data() : {};

							const fullName = `${userData.us_fname || ""} ${
								userData.us_mname || ""
							} ${userData.us_lname || ""} ${userData.us_suffix || ""}`.trim();

							if (
								isPersonnel &&
								((isQRSearch && userData.us_qr !== searchQuery) ||
									(searchQuery &&
										!isQRSearch &&
										!fullName
											.toLowerCase()
											.includes(searchQuery.toLowerCase())))
							) {
								return null;
							}

							if (
								isPersonnel &&
								((selectedCourses !== "All" &&
									selectedCourses !== userData.us_courses) ||
									(selectedYear !== "All" &&
										selectedYear !== userData.us_year) ||
									(selectedTracks !== "All" &&
										selectedTracks !== userData.us_tracks) ||
									(selectedStrand !== "All" &&
										selectedStrand !== userData.us_strand) ||
									(selectedInstitute !== "All" &&
										selectedInstitute !== userData.us_institute) ||
									(selectedProgram !== "All" &&
										selectedProgram !== userData.us_program) ||
									(selectedSection !== "" &&
										selectedSection !== userData.us_section))
							) {
								return null;
							}

							let us_type = userData.us_type;

							if (
								isPersonnel &&
								["USR-5", "USR-6"].includes(userData.us_level) &&
								((selectedLibrary !== "All" &&
									userData.us_liID.id !== selectedLibrary) ||
									(selectedUsType !== "All" &&
										userData.us_type !== selectedUsType))
							) {
								return null;
							}

							if (isPersonnel && userData.us_type === "Personnel") {
								const matchedLib = userData.us_library?.find(
									(lib) =>
										lib.us_liID?.id ===
										(selectedLibrary === "All" ? li_id.id : selectedLibrary)
								);

								if (
									!matchedLib ||
									(selectedUsType !== "All" &&
										matchedLib.us_type !== selectedUsType)
								) {
									return null;
								}

								us_type = matchedLib.us_type;
							}

							let libraryData = {};
							let libSnap = null;
							libSnap = await getDoc(
								isPersonnel
									? userData.us_type != "Personnel"
										? userData.us_liID
										: selectedLibrary == "All"
										? li_id
										: doc(db, "library", selectedLibrary)
									: data.lo_liID
							);
							libraryData = libSnap.exists() ? libSnap.data() : {};

							if (
								!isPersonnel &&
								((isQRSearch && libraryData.li_qr !== searchQuery) ||
									(searchQuery &&
										!isQRSearch &&
										!libraryData.li_name
											.toLowerCase()
											.includes(searchQuery.toLowerCase())))
							) {
								return null;
							}

							return {
								id,
								lo_status: data.lo_status,
								lo_type: data.lo_type,
								lo_createdAt: formatDate(data.lo_createdAt),
								lo_timeIn: formatTime(data.lo_timeIn),
								lo_timeOut: formatTime(data.lo_timeOut),
								lo_duration: calculateDuration(
									data.lo_timeIn,
									data.lo_timeOut,
									data.lo_status
								),
								...(isPersonnel
									? {
											lo_user: {
												id: userSnap.id,
												us_name: fullName,
												us_schoolID: userData.us_schoolID || "",
												us_type: us_type || "",
												us_email: userData.us_email || "",
												us_photoURL: userData.us_photoURL || "",
												us_library: libraryData.li_name || "",
											},
									  }
									: {
											lo_library: {
												id: libSnap?.id || "",
												li_name: libraryData.li_name || "",
												li_qr: libraryData.li_qr || "",
												li_schoolID: libraryData.li_schoolID || "",
												li_schoolName: libraryData.li_schoolname || "",
												li_address: libraryData.li_address,
												li_photoURL: libraryData.li_photoURL || "",
											},
									  }),
							};
						})
					);

					setUserData(users.filter(Boolean));

					if (hasSearchFilters) {
						const countSnap = await getCountFromServer(
							query(logsRef, ...conditions)
						);
						setCtrPage(Math.ceil(countSnap.data().count / pageLimit));
					} else {
						setCtrPage(1);
					}
				} catch (err) {
					console.error("onSnapshot getAttendanceList error:", err);
					Alert.showDanger(err.message);
				} finally {
					setLoading(false);
				}
			},
			(error) => {
				console.error("Snapshot error:", error);
				setLoading(false);
				Alert.showDanger("Failed to load attendance logs in real-time.");
			}
		);
	} catch (error) {
		console.error("getAttendanceList Error:", error);
		Alert.showDanger(error.message);
		setLoading(false);
	}
}

export async function getUserFilterData(
	isPersonnel,
	li_id,
	setLibraryQR = null,
	setLibraryData,
	Alert
) {
	try {
		const libQuery = query(
			collection(db, "library"),
			where("li_status", "==", "Active")
		);
		const libSnap = await getDocs(libQuery);

		const libraries = [];

		for (const docSnap of libSnap.docs) {
			const data = docSnap.data();
			const libId = docSnap.id;

			if (!libraries.some((lib) => lib.id === libId)) {
				libraries.push({
					id: libId,
					li_name: data.li_name,
				});
			}

			if (isPersonnel && setLibraryQR != null && libId === li_id?.id) {
				setLibraryQR(data.li_qr);
			}
		}

		setLibraryData(libraries);

		if (!isPersonnel) return;
	} catch (error) {
		console.error("[getUserFilterData] Error:", error);
		Alert.showDanger("Failed to fetch filter data: " + error.message);
	}
}
