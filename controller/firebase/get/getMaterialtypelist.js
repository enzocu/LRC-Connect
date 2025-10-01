import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";

export function getMaterialtypelistRealtime(
	li_id,
	setRegisteredMaterialTypes,
	setLoading,
	Alert
) {
	setLoading(true);

	try {
		const q = query(
			collection(db, "materialType"),
			where("mt_liID", "==", li_id),
			where("mt_status", "==", "Active")
		);

		const unsubscribe = onSnapshot(
			q,
			(querySnapshot) => {
				const materialTypes = [];

				querySnapshot.forEach((doc) => {
					const data = doc.data();

					materialTypes.push({
						mt_id: doc.id,
						...data,
					});
				});

				setRegisteredMaterialTypes(materialTypes);
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
