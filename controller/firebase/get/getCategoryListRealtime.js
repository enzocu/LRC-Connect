import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";

export function getCategoryListRealtime(
	li_id,
	setRegisteredCategories,
	setLoading,
	Alert
) {
	setLoading(true);

	try {
		const q = query(
			collection(db, "category"),
			where("ca_liID", "==", li_id),
			where("ca_status", "==", "Active")
		);

		const unsubscribe = onSnapshot(
			q,
			(querySnapshot) => {
				const categories = [];

				querySnapshot.forEach((doc) => {
					const data = doc.data();

					categories.push({
						ca_id: doc.id,
						...data,
					});
				});

				setRegisteredCategories(categories);
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
