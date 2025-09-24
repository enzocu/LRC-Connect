import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";

export async function getLibraryFeatureList(setLibraryData, Alert) {
	try {
		const conditions = [where("li_status", "==", "Active")];
		const q = query(collection(db, "library"), ...conditions);
		const snapshot = await getDocs(q);

		const libraryData = snapshot.docs.map((docSnap) => {
			const d = docSnap.data();
			return {
				id: docSnap.id,
				li_name: d.li_name || "",
				li_school: d.li_schoolname || "",
				li_address: d.li_address || "",
				li_photoURL: d.li_photoURL || "",
			};
		});

		setLibraryData(libraryData);
	} catch (error) {
		console.error("getLibraryFeatureList Error:", error);
		Alert.showDanger(error.message);
	}
}
