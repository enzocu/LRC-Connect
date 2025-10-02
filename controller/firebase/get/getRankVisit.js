import {
	collection,
	query,
	where,
	getDocs,
	doc,
	getDoc,
} from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";

export async function getRankList(
	li_id,
	setUserData,
	accessMode,
	selectedRole,
	selectedLibraryID,
	setLoading,
	Alert
) {
	setLoading(true);

	try {
		const logsRef = collection(db, "logs");

		const libraryID =
			selectedLibraryID !== "All"
				? doc(db, "library", selectedLibraryID)
				: li_id;

		const conditions = [
			where("lo_liID", "==", libraryID),
			where("lo_type", "==", accessMode ? "onSite" : "onApp"),
		];

		const snapshot = await getDocs(query(logsRef, ...conditions));

		const userCountMap = {};
		snapshot.docs.forEach((logDoc) => {
			const logData = logDoc.data();
			const userId = logData.lo_usID?.id;

			if (!userId) return;

			if (!userCountMap[userId]) {
				userCountMap[userId] = 0;
			}
			userCountMap[userId] += 1;
		});

		const logList = Object.entries(userCountMap)
			.map(([id, count]) => ({ id, count }))
			.sort((a, b) => b.count - a.count);

		const userDocs = await Promise.all(
			logList.map((item) => getDoc(doc(db, "users", item.id)))
		);

		const rankedUsers = userDocs
			.map((userSnap, index) => {
				if (!userSnap.exists()) return null;

				const item = logList[index];
				const userData = userSnap.data();
				let us_type = userData.us_type;

				if (selectedRole === "Patron" && userData.us_level !== "USR-6")
					return null;
				if (selectedRole === "Personnel" && userData.us_level === "USR-6")
					return null;

				if (
					(selectedRole === "All" || selectedRole === "Personnel") &&
					us_type === "Personnel"
				) {
					const matchedLib = userData.us_library?.find(
						(lib) => lib.us_liID?.id === libraryID.id
					);
					if (!matchedLib) return null;
					us_type = matchedLib.us_type;
				}

				const fullName = [
					userData.us_fname,
					userData.us_mname,
					userData.us_lname,
				]
					.filter(Boolean)
					.join(" ");

				return {
					id: item.id,
					us_name: fullName,
					us_avatar: userData.us_photoURL || null,
					us_visits: item.count,
					us_libraryId: userData.us_liID || null,
					us_type: us_type || null,
					us_schoolID: userData.us_schoolID || null,
				};
			})
			.filter(Boolean);

		// Directly set all users without pagination
		setUserData(rankedUsers);

		return rankedUsers;
	} catch (error) {
		console.error("getRankList Error:", error);
		Alert.showDanger(error.message || "Failed to fetch users report.");
		return [];
	} finally {
		setLoading(false);
	}
}
