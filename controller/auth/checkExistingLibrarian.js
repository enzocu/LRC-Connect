import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../server/firebaseConfig";

export async function checkExistingLibrarian(userType, libraryID, Alert) {
	try {
		const usersRef = collection(db, "users");

		if (userType === "Chief Librarian") {
			const q = query(
				usersRef,
				where("us_status", "==", "Active"),
				where("us_type", "==", "Personnel")
			);
			const querySnapshot = await getDocs(q);

			for (const docSnap of querySnapshot.docs) {
				const data = docSnap.data();
				if (Array.isArray(data.us_library)) {
					const hasChief = data.us_library.some(
						(lib) => lib.us_type === "Chief Librarian"
					);
					if (hasChief) {
						Alert.showWarning("An active Chief Librarian already exists.");
						return true;
					}
				}
			}
			return false;
		}

		if (userType === "Head Librarian") {
			const q = query(
				usersRef,
				where("us_status", "==", "Active"),
				where("us_type", "==", "Personnel")
			);
			const querySnapshot = await getDocs(q);

			for (const docSnap of querySnapshot.docs) {
				const data = docSnap.data();
				if (!Array.isArray(data.us_library)) continue;

				const hasHead = data.us_library.some(
					(lib) =>
						lib.us_type === "Head Librarian" && lib.us_liID?.id === libraryID
				);
				if (hasHead) {
					Alert.showWarning("This library already has a Head Librarian.");
					return true;
				}
			}
			return false;
		}

		return false;
	} catch (error) {
		console.error("Error checking librarian existence:", error);
		Alert.showDanger("An error occurred while checking librarian data.");
		return false;
	}
}
