import {
	collection,
	query,
	where,
	onSnapshot,
	orderBy,
} from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";

export function getCoursesRealtime(
	type,
	searchQuery,
	setCoursesData,
	setLoading,
	Alert
) {
	try {
		setLoading(true);

		const queryParts = [
			collection(db, "courses"),
			where("cs_status", "==", "Active"),
			where("cs_type", "==", type),
		];

		if (type === "Senior High School") {
			queryParts.push(orderBy("cs_track", "asc"));
		} else {
			queryParts.push(orderBy("cs_institute", "asc"));
		}

		const q = query(...queryParts);

		const unsubscribe = onSnapshot(
			q,
			(querySnapshot) => {
				const data = querySnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));

				const filteredData = searchQuery
					? data.filter((item) => {
							const fieldToSearch =
								`${item.cs_track} ${item.cs_institute}`.toLowerCase();
							return fieldToSearch.includes(searchQuery.toLowerCase());
					  })
					: data;

				setCoursesData((prevData) =>
					prevData.map((item) =>
						item.main ===
						(type === "Senior High School"
							? "Senior High School"
							: "College Courses")
							? { ...item, sub: filteredData }
							: item
					)
				);

				setLoading(false);
			},
			(error) => {
				console.error("Realtime error:", error);
				Alert.showDanger(error.message);
				setLoading(false);
			}
		);

		return unsubscribe;
	} catch (error) {
		console.error("Error in getCoursesRealtime:", error);
		Alert.showDanger(error.message);
		setLoading(false);
	}
}
