import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";

// Get Programs in real-time
export function getProgramRealtime(li_id, setProgram, Alert) {
	try {
		const liRef = doc(db, "library", li_id);
		const q = query(
			collection(db, "program"),
			where("pr_liID", "==", liRef),
			where("pr_status", "==", "Active")
		);

		const unsubscribe = onSnapshot(
			q,
			(querySnapshot) => {
				const programs = querySnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));

				setProgram(programs);
			},
			(error) => {
				Alert.showDanger(error.message);
			}
		);

		return unsubscribe;
	} catch (error) {
		Alert.showDanger(error.message);
	}
}

// Get Schools in real-time
export function getSchoolRealtime(li_id, setSchool, Alert) {
	try {
		const liRef = doc(db, "library", li_id);
		const q = query(
			collection(db, "school"),
			where("sc_liID", "==", liRef),
			where("sc_status", "==", "Active")
		);

		const unsubscribe = onSnapshot(
			q,
			(querySnapshot) => {
				const schools = querySnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));

				setSchool(schools);
			},
			(error) => {
				Alert.showDanger(error.message);
			}
		);

		return unsubscribe;
	} catch (error) {
		Alert.showDanger(error.message);
	}
}
