import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";

export function getDonorListRealtime(li_id, setDonors, setLoading, Alert) {
	setLoading(true);

	try {
		const q = query(
			collection(db, "donors"),
			where("do_liID", "==", li_id),
			where("do_status", "==", "Active")
		);

		const unsubscribe = onSnapshot(
			q,
			(querySnapshot) => {
				const donors = [];

				querySnapshot.forEach((doc) => {
					const data = doc.data();
					donors.push({
						do_id: doc.id,
						...data,
					});
				});

				setDonors(donors);
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
