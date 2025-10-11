import {
	collection,
	query,
	where,
	onSnapshot,
	orderBy,
	getDocs,
} from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import { fi } from "date-fns/locale";

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

export async function getFilterCourses(
	selectedType,
	setFilterCoursesData,
	Alert
) {
	try {
		const queryParts = [
			collection(db, "courses"),
			where("cs_status", "==", "Active"),
			where("cs_type", "==", selectedType),
		];

		if (selectedType === "Senior High School") {
			queryParts.push(orderBy("cs_track", "asc"));
		} else {
			queryParts.push(orderBy("cs_institute", "asc"));
		}

		const q = query(...queryParts);

		// Fetch documents once
		const querySnapshot = await getDocs(q);

		const data = querySnapshot.docs.map((doc) => {
			const course = doc.data();
			return {
				id: doc.id,
				cs_type: course.cs_type,
				cs_title:
					course.cs_type === "Senior High School"
						? course.cs_track
						: course.cs_institute,
				cs_subs:
					course.cs_type === "Senior High School"
						? course.cs_strand || []
						: course.cs_program || [],
			};
		});

		setFilterCoursesData(data);
	} catch (error) {
		console.error("Error in getFilterCourses:", error);
		Alert.showDanger(error.message);
	}
}

export function getFilterTrackInstituteCourses(
	selectedID,
	filterCoursesData,
	setSubCoursesData,
	Alert
) {
	try {
		const filteredData = filterCoursesData.find(
			(item) => item.id === selectedID
		);

		if (!filteredData) {
			setSubCoursesData([]);
			return;
		}

		setSubCoursesData(filteredData.cs_subs || []);
	} catch (error) {
		console.error("Error in getFilterTrackInstituteCourses:", error);
		Alert.showDanger(error.message);
	}
}
