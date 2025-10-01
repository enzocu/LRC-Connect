import {
	collection,
	query,
	where,
	getDocs,
	orderBy,
	limit,
} from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";

export async function getPatronList(
	li_id,
	setUserData,
	status,
	searchQuery,
	selectedType,
	setLoading,
	Alert
) {
	setLoading(true);

	try {
		const usersRef = collection(db, "users");
		const conditions = [
			where("us_status", "==", status),
			where("us_type", "==", selectedType),
		];

		if (li_id) {
			conditions.push(where("us_liID", "==", li_id));
		}

		const isQRSearch = searchQuery?.startsWith("USR-");
		const isSearchEmpty = !searchQuery || searchQuery.trim() === "";

		if (isQRSearch) {
			conditions.push(where("us_qr", "==", searchQuery));
		} else if (isSearchEmpty) {
			conditions.push(orderBy("us_createdAt"));
		}

		const q = query(usersRef, ...conditions, limit(20));
		const snapshot = await getDocs(q);

		const data = snapshot.docs
			.map((docSnap) => {
				const raw = docSnap.data();

				if (searchQuery && !isSearchEmpty && !isQRSearch) {
					const fullName =
						`${raw.us_fname} ${raw.us_mname} ${raw.us_lname}`.toLowerCase();
					if (!fullName.includes(searchQuery.toLowerCase())) return null;
				}

				return {
					us_id: docSnap.id,
					us_schoolID: raw.us_schoolID || "",
					us_qr: raw.us_qr || "",
					us_status: raw.us_status || "",
					us_type: raw.us_type || "",
					us_name:
						`${raw.us_fname} ${raw.us_mname} ${raw.us_lname}`.trim() || "",
					us_email: raw.us_email || "",
					us_section: raw.us_section || "NA",
					us_year: raw.us_year || "NA",
					us_program: raw.us_program || "NA",
					us_school: raw.us_school || "NA",
					us_photoURL: raw.us_photoURL || "NA",
				};
			})
			.filter(Boolean)
			.sort((a, b) =>
				a.us_name.toLowerCase().localeCompare(b.us_name.toLowerCase())
			);

		setUserData(data);
	} catch (error) {
		console.error("getPatronList error:", error);
		Alert.showDanger(error.message || "Failed to fetch patron list.");
	} finally {
		setLoading(false);
	}
}
