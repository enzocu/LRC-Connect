import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";

export function getShelfListRealtime(li_id, setShelves, setLoading, Alert) {
	setLoading(true);

	try {
		const q = query(
			collection(db, "shelves"),
			where("sh_liID", "==", li_id),
			where("sh_status", "==", "Active")
		);

		const unsubscribe = onSnapshot(
			q,
			(querySnapshot) => {
				const shelves = [];

				querySnapshot.forEach((doc) => {
					const data = doc.data();

					shelves.push({
						sh_id: doc.id,
						...data,
					});
				});

				setShelves(shelves);
				setLoading(false);
			},
			(error) => {
				Alert.showDanger(error.message);
				setLoading(false);
			}
		);

		return unsubscribe;
	} catch (error) {
		Alert.showDanger(error.message);
		setLoading(false);
	}
}
