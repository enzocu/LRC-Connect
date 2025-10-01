import {
	collection,
	query,
	where,
	limit,
	orderBy,
	getDocs,
} from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import { formatDate, formatYear } from "../../custom/customFunction";

export async function getMaterialFeaturedList(
	li_id,
	setMaterialData,
	setLoading,
	Alert
) {
	setLoading(true);

	try {
		// base query
		let constraints = [
			where("ma_status", "==", "Active"),
			orderBy("ma_createdAt", "desc"),
			limit(5),
		];

		if (li_id) {
			constraints.unshift(where("ma_liID", "==", li_id));
		}

		const q = query(collection(db, "material"), ...constraints);
		const snapshot = await getDocs(q);

		const materialData = [];

		for (const docSnap of snapshot.docs) {
			const d = docSnap.data();
			materialData.push({
				id: docSnap.id,
				ma_coverURL: d.ma_coverURL || null,
				ma_title: d.ma_title || "NA",
				ma_author: d.ma_author || "NA",
				ma_description: d.ma_description || "NA",
				ma_copyright: formatYear(d.ma_copyright) || "NA",
				ma_libraryCall: d.ma_libraryCall || "NA",
			});
		}

		setMaterialData(materialData);
	} catch (error) {
		Alert.showDanger(error.message);
		console.error("getMaterialFeaturedList Error:", error);
	} finally {
		setLoading(false);
	}
}
