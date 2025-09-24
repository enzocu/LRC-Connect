import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import { formatDateField } from "../../custom/customFunction";

export function getUser(
	userID,
	library = false,
	setUserData,
	setAcademicData = null,
	setAddressData = null,
	setAssociatedLibraries = null,
	setLoading,
	Alert
) {
	setLoading(true);

	try {
		const userRef = doc(db, "users", userID);

		const unsubscribeUser = onSnapshot(
			userRef,
			async (docSnap) => {
				if (!docSnap.exists()) {
					Alert.showDanger("User not found.");
					setLoading(false);
					return;
				}

				const data = docSnap.data();

				const userData = {
					us_qr: data.us_qr,
					us_status: data.us_status,
					us_liID: data.us_liID,
					us_level: data.us_level,
					us_type: data.us_type,
					us_schoolID: data.us_schoolID,
					us_fname: data.us_fname,
					us_mname: data.us_mname,
					us_lname: data.us_lname,
					us_suffix: data.us_suffix,
					us_sex: data.us_sex,
					us_birthday: formatDateField(data.us_birthday),
					us_email: data.us_email,
					us_phoneNumber: data.us_phoneNumber,
					us_photoURL: data.us_photoURL,
					id: userID,
				};

				setUserData(userData);

				// Optional: academic data
				if (setAcademicData) {
					setAcademicData({
						us_section: data.us_section,
						us_year: data.us_year,
						us_program: data.us_program,
						us_school: data.us_school,
						id: userID,
					});
				}

				// Optional: address data
				if (setAddressData) {
					setAddressData({
						us_street: data.us_street,
						us_barangay: data.us_barangay,
						us_municipal: data.us_municipal,
						us_province: data.us_province,
						id: userID,
					});
				}

				// Associated Libraries (if needed)
				if (library && setAssociatedLibraries) {
					try {
						if (data.us_type !== "Personnel") {
							// Single library (not an array)
							const liSnap = await getDoc(data.us_liID);
							if (liSnap.exists()) {
								setAssociatedLibraries([
									{
										id: liSnap.id,
										us_type: data.us_type,
										...liSnap.data(),
									},
								]);
							}
						} else if (Array.isArray(data.us_library)) {
							// Multiple libraries
							const libraryRefs = data.us_library.map((lib) =>
								getDoc(lib.us_liID)
							);
							const librarySnaps = await Promise.all(libraryRefs);

							const libraries = librarySnaps
								.map((snap, i) => {
									if (!snap.exists()) return null;
									return {
										id: snap.id,
										us_type: data.us_library[i].us_type,
										...snap.data(),
									};
								})
								.filter((lib) => lib !== null);

							setAssociatedLibraries(libraries);
						}
					} catch (err) {
						console.error("Error fetching library refs:", err);
						Alert.showDanger("Failed to fetch libraries.");
					}
				}

				setLoading(false);
			},
			(error) => {
				Alert.showDanger(error.message);
				setLoading(false);
			}
		);

		return unsubscribeUser;
	} catch (error) {
		Alert.showDanger(error.message);
		setLoading(false);
	}
}
