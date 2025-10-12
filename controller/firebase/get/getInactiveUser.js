import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";

export function getInactiveUserList(
	li_id,
	setUserData,
	searchQuery,
	userType,
	selectedType,
	selectedStatus,
	setLoading,
	Alert
) {
	setLoading(true);

	try {
		const usersRef = collection(db, "users");
		const conditions = [];

		// Base filters
		if (userType === "patron") {
			conditions.push(
				where("us_status", "==", "Inactive"),
				where("us_level", "==", "USR-6")
			);
		} else {
			conditions.push(
				where("us_type", "in", ["Personnel", "Student Assistant"])
			);
		}

		if (selectedStatus !== "All" && userType != "patron") {
			conditions.push(where("us_status", "==", selectedStatus));
		} else {
			conditions.push(where("us_status", "in", ["Active", "Inactive"]));
		}

		// Selected type filter for patrons
		if (selectedType !== "All" && userType === "patron") {
			conditions.push(where("us_type", "==", selectedType));
		}

		const isQRSearch = searchQuery?.startsWith("USR-");
		const isSearchEmpty = !searchQuery || searchQuery.trim() === "";

		if (isQRSearch) {
			conditions.push(where("us_qr", "==", searchQuery));
		}

		// Real-time listener
		const unsubscribe = onSnapshot(
			query(usersRef, ...conditions),
			async (snapshot) => {
				const userDataList = await Promise.all(
					snapshot.docs.map(async (docSnap) => {
						const data = docSnap.data();
						let us_type = data.us_type;
						let us_level = data.us_level;

						// Personnel / multi-library handling
						if (userType !== "patron" && data.us_level !== "USR-5") {
							const matchedType = data.us_library?.find(
								(lib) =>
									lib.us_liID?.id !== li_id &&
									(selectedType === "All" || lib.us_type === selectedType)
							);

							if (!matchedType) return null;

							us_type = matchedType.us_type;
							us_level = matchedType.us_level;
						} else if (userType !== "patron" && data.us_level === "USR-5") {
							if (data.us_status === "Active") return null;

							if (selectedType !== "All" && data.us_type !== selectedType)
								return null;
						}

						// Name search
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

						return {
							us_id: docSnap.id,
							us_schoolID: data.us_schoolID || "",
							us_qr: data.us_qr || "",
							us_status: data.us_status || "",
							us_type: us_type || "",
							us_level: us_level || "",
							us_name: `${data.us_fname} ${data.us_mname} ${data.us_lname} ${
								data.us_suffix || ""
							}`.trim(),
							us_email: data.us_email || "",
							us_courses: data.us_courses || "",
							us_year: data.us_year || "",
							us_tracks: data.us_tracks || "",
							us_strand: data.us_strand || "",
							us_institute: data.us_institute || "",
							us_program: data.us_program || "",
							us_section: data.us_section || "",
							us_photoURL: data.us_photoURL || "",
						};
					})
				);

				// Remove duplicates by user ID
				const uniqueUsers = Array.from(
					new Map(
						userDataList.filter(Boolean).map((u) => [u.us_id, u])
					).values()
				);

				setUserData(uniqueUsers);
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
		console.error("getInactiveUserList Error:", error);
		Alert.showDanger("Failed to fetch users: " + error.message);
		setLoading(false);
	}
}
