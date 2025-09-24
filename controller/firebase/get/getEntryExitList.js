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
	selectedSection,
	selectedYear,
	selectedProgram,
	selectedSchool,
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

		// Base conditions
		const conditions = [
			where("lo_type", "==", showLoggedIn ? "onSite" : "onApp"),
			where("lo_status", "==", selectedStatus ? "Active" : "Inactive"),
			orderBy("lo_createdAt", "desc"),
		];

		// Library filtering
		if (isPersonnel || selectedLibrary === "All") {
			conditions.push(where("lo_liID", "==", li_id));
		} else if (!isPersonnel && selectedLibrary !== "All") {
			conditions.push(
				where("lo_liID", "==", doc(db, "library", selectedLibrary))
			);
		}

		// Personnel filtering
		if (!isPersonnel && paID) {
			conditions.push(where("lo_usID", "==", doc(db, "users", paID)));
		}

		// Search & filters
		const isQRSearch = searchQuery?.startsWith(isPersonnel ? "USR-" : "LIB-");
		const isSearchEmpty = !searchQuery || searchQuery.trim() === "";

		const hasSearchFilters =
			isSearchEmpty &&
			selectedSection == "All" &&
			selectedYear == "All" &&
			selectedProgram == "All" &&
			selectedSchool == "All" &&
			selectedUsType == "All" &&
			((isPersonnel && selectedLibrary == "All") || !isPersonnel);

		// Pagination
		let finalQuery;

		if (hasSearchFilters) {
			console.log("pagination");
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
			console.log("no pagination");
			finalQuery = query(logsRef, ...conditions);
		}

		// Real-time listener
		onSnapshot(
			finalQuery,
			async (snapshot) => {
				try {
					// Pagination cursor update
					const lastVisible = snapshot.docs[snapshot.docs.length - 1];
					if (hasSearchFilters && lastVisible) {
						const newCursors = [...pageCursors];
						newCursors[currentPage - 1] = lastVisible;
						setPageCursors(newCursors);
					}

					// Process all docs
					const users = await Promise.all(
						snapshot.docs.map(async (docSnap) => {
							const data = docSnap.data();
							const id = docSnap.id;

							// User/Personnel data
							const userSnap = isPersonnel ? await getDoc(data.lo_usID) : {};
							const userData = userSnap.exists ? userSnap.data() : {};

							const fullName = `${userData.us_fname || ""} ${
								userData.us_mname || ""
							} ${userData.us_lname || ""} ${userData.us_suffix || ""}`.trim();

							// Search filtering (Personnel side)
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

							// Personnel filters
							if (
								(isPersonnel &&
									selectedSection !== "All" &&
									selectedSection !== userData.us_section) ||
								(selectedYear !== "All" && selectedYear !== userData.us_year) ||
								(selectedProgram !== "All" &&
									selectedProgram !== userData.us_program) ||
								(selectedSchool !== "All" &&
									selectedSchool !== userData.us_school)
							) {
								return null;
							}

							let us_type = userData.us_type;

							// Handle multi-library personnel
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

							// Library Data
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

							// Search filtering (Library side)
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

							// Return formatted object
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
	setSectionData,
	setYearData,
	setProgramData,
	setSchoolData,
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

		const userQuery = query(
			collection(db, "users"),
			where("us_status", "==", "Active"),
			where("us_liID", "==", li_id?.id ? li_id : doc(db, "library", li_id))
		);

		const snap = await getDocs(userQuery);
		const userDatas = await Promise.all(snap.docs.map((doc) => doc.data()));

		const sectionSet = new Set();
		const yearSet = new Set();
		const programSet = new Set();
		const schoolSet = new Set();

		userDatas.forEach((userData) => {
			if (userData.us_section?.trim())
				sectionSet.add(userData.us_section.trim());
			if (userData.us_year?.trim()) yearSet.add(userData.us_year.trim());
			if (userData.us_program?.trim())
				programSet.add(userData.us_program.trim());
			if (userData.us_school?.trim()) schoolSet.add(userData.us_school.trim());
		});
		3;

		setSectionData([...sectionSet]);
		setYearData([...yearSet]);
		setProgramData([...programSet]);
		setSchoolData([...schoolSet]);
	} catch (error) {
		console.error("[getUserFilterData] Error:", error);
		Alert.showDanger("Failed to fetch filter data: " + error.message);
	}
}
