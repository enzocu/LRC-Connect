import {
	collection,
	query,
	where,
	orderBy,
	limit,
	startAfter,
	onSnapshot,
	getCountFromServer,
	doc,
	getDocs,
} from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import {
	formatDate,
	convertDateToTimestamp,
} from "../../custom/customFunction";
export function getUserList(
	li_id,
	setUserData,
	searchQuery,
	userType,
	selectedStatus,
	selectedType,
	selectedSection,
	selectedYear,
	selectedProgram,
	selectedSchool,
	dateRangeStart,
	dateRangeEnd,
	setLoading,
	Alert,
	pageLimit,
	setCtrPage,
	pageCursors,
	setPageCursors,
	currentPage,
	mock = false
) {
	setLoading(true);

	try {
		const usersRef = collection(db, "users");

		// Base conditions (status always required)
		const conditions = [where("us_status", "==", selectedStatus)];

		// Patron vs Personnel filters
		if (userType.toLowerCase() === "patron") {
			conditions.push(
				where(
					"us_liID",
					"==",
					typeof li_id === "object" && li_id.id
						? li_id
						: doc(db, "library", li_id)
				),
				where("us_level", "==", "USR-6")
			);
		} else {
			conditions.push(
				where("us_type", "in", ["Personnel", "Student Assistant"])
			);
		}

		// Additional filters
		if (
			selectedType &&
			selectedType !== "All" &&
			userType.toLowerCase() === "patron"
		) {
			conditions.push(where("us_type", "==", selectedType));
		}
		if (selectedSection && selectedSection !== "All") {
			conditions.push(where("us_section", "==", selectedSection));
		}
		if (selectedYear && selectedYear !== "All") {
			conditions.push(where("us_year", "==", selectedYear));
		}
		if (selectedProgram && selectedProgram !== "All") {
			conditions.push(where("us_program", "==", selectedProgram));
		}
		if (selectedSchool && selectedSchool !== "All") {
			conditions.push(where("us_school", "==", selectedSchool));
		}

		if (dateRangeStart !== "") {
			conditions.push(
				where("us_createdAt", ">=", convertDateToTimestamp(dateRangeStart))
			);
		}

		if (dateRangeEnd !== "") {
			conditions.push(
				where("us_createdAt", "<=", convertDateToTimestamp(dateRangeEnd))
			);
		}

		// Search handling
		const isQRSearch = searchQuery?.startsWith("USR-");
		const isSearchEmpty = !searchQuery || searchQuery.trim() === "";

		if (isQRSearch) {
			conditions.push(where("us_qr", "==", searchQuery));
		} else {
			conditions.push(orderBy("us_createdAt", "desc"));
		}

		// Pagination handling
		const finalQuery =
			currentPage > 1 && pageCursors[currentPage - 2]
				? query(
						usersRef,
						...conditions,
						startAfter(pageCursors[currentPage - 2]),
						limit(pageLimit)
				  )
				: query(usersRef, ...conditions, limit(pageLimit));

		// Real-time snapshot
		const unsubscribe = onSnapshot(
			finalQuery,
			async (snapshot) => {
				const lastVisible = snapshot.docs[snapshot.docs.length - 1];

				// Store pagination cursor
				if ((isQRSearch || isSearchEmpty) && lastVisible) {
					const newCursors = [...pageCursors];
					newCursors[currentPage - 1] = lastVisible;
					setPageCursors(newCursors);
				}

				// Build user data list
				const userDataList = await Promise.all(
					snapshot.docs.map(async (docSnap) => {
						const data = docSnap.data();
						let us_type = data.us_type;
						let us_level = data.us_level;

						const matchId =
							typeof li_id === "object" && li_id.id ? li_id.id : li_id;

						if (
							userType.toLowerCase() !== "patron" &&
							data.us_level !== "USR-5"
						) {
							const matchedLib = data.us_library?.find(
								(lib) => lib.us_liID?.id === matchId
							);

							if (!matchedLib) return null;
							if (selectedType !== "All" && matchedLib.us_type !== selectedType)
								return null;

							us_type = matchedLib.us_type;
							us_level = matchedLib.us_level;
						}
						// Handle single-library personnel
						else if (
							userType.toLowerCase() !== "patron" &&
							data.us_level === "USR-5"
						) {
							if (data.us_liID?.id !== matchId) return null;
							if (selectedType !== "All" && data.us_type !== selectedType)
								return null;

							us_type = data.us_type;
							us_level = data.us_level;
						}

						// Text search filter
						if (
							searchQuery &&
							!isSearchEmpty &&
							!isQRSearch &&
							!`${data.us_fname} ${data.us_mname} ${data.us_lname} ${
								data.us_suffix || ""
							}`
								.toLowerCase()
								.includes(searchQuery.toLowerCase())
						) {
							return null;
						}

						// Final user object
						return {
							us_id: docSnap.id,
							us_schoolID: data.us_schoolID || "NA",
							us_qr: data.us_qr || "NA",
							us_status: data.us_status || "NA",
							us_type: us_type || "NA",
							us_level: us_level || "NA",
							us_name: `${data.us_fname} ${data.us_mname} ${data.us_lname} ${
								data.us_suffix || ""
							}`.trim(),
							us_library: data.us_library || [],
							us_email: data.us_email || "NA",
							us_section: data.us_section || "NA",
							us_year: data.us_year || "NA",
							us_program: data.us_program || "NA",
							us_school: data.us_school || "NA",
							us_photoURL: data.us_photoURL || null,
							us_createdAt: formatDate(data.us_createdAt) || "NA",
						};
					})
				);

				setUserData(
					mock
						? (prev) => ({
								...prev,
								libraryUsers: userDataList.filter(Boolean),
						  })
						: userDataList.filter(Boolean)
				);

				// Count total pages if needed
				if (isQRSearch || isSearchEmpty) {
					const countQuery = query(usersRef, ...conditions);
					const countSnap = await getCountFromServer(countQuery);
					const totalPages = Math.ceil(countSnap.data().count / pageLimit);
					setCtrPage(totalPages);
				} else {
					setCtrPage(1);
				}

				setLoading(false);
			},
			(error) => {
				console.error("onSnapshot error:", error);
				Alert.showDanger(error.message || "Failed to listen to users.");
				setLoading(false);
			}
		);

		return unsubscribe;
	} catch (error) {
		console.error("getUserList error:", error);
		Alert.showDanger(error.message || "Failed to fetch users.");
		setLoading(false);
	}
}

export async function getUserAttributeFilters(
	li_id,
	userType,
	setTypeData = null,
	setSectionData,
	setYearData,
	setProgramData,
	setSchoolData,
	Alert
) {
	try {
		if (userType === "patron" && setTypeData) {
			setTypeData([
				{
					label: "Patrons",
					options: ["Student", "Faculty", "Administrator"],
				},
			]);
		} else if (setTypeData) {
			setTypeData([
				{
					label: "Assistants",
					options: ["Administrative Assistant", "Student Assistant"],
				},
				{
					label: "Librarians",
					options: ["Chief Librarian", "Head Librarian"],
				},
			]);
		}

		const userQuery = query(
			collection(db, "users"),
			where("us_status", "==", "Active"),
			where(
				"us_liID",
				"==",
				typeof li_id === "object" && li_id.id
					? li_id
					: doc(db, "library", li_id)
			)
		);

		const userSnap = await getDocs(userQuery);
		const userDatas = userSnap.docs.map((doc) => doc.data());

		// 3. Create sets for unique filter values
		const sectionSet = new Set();
		const yearSet = new Set();
		const programSet = new Set();
		const schoolSet = new Set();

		userDatas.forEach((userData) => {
			if (userData.us_section) sectionSet.add(userData.us_section.trim());
			if (userData.us_year) yearSet.add(userData.us_year.trim());
			if (userData.us_program) programSet.add(userData.us_program.trim());
			if (userData.us_school) schoolSet.add(userData.us_school.trim());
		});

		// 4. Set the filters
		setSectionData([...sectionSet]);
		setYearData([...yearSet]);
		setProgramData([...programSet]);
		setSchoolData([...schoolSet]);
	} catch (error) {
		console.error("[getUserAttributeFilters] Error:", error);
		Alert.showDanger("Failed to fetch user filters: " + error.message);
	}
}

export async function getUserLibraryOptions(
	setSelectedLibrary,
	setLibraries,
	Alert
) {
	try {
		const libQuery = query(
			collection(db, "library"),
			where("li_status", "==", "Active")
		);

		const libSnap = await getDocs(libQuery);
		const libraries = libSnap.docs.map((doc) => ({
			id: doc.id,
			li_name: doc.data().li_name,
		}));

		setLibraries(libraries);

		// Optional: auto-select the first one
		if (libraries.length > 0) {
			setSelectedLibrary(libraries[0].id);
		}
	} catch (error) {
		console.error("[getUserLibraryOptions] Error:", error);
		Alert.showDanger("Failed to fetch libraries: " + error.message);
	}
}
