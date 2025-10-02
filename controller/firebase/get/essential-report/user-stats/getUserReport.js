import {
	collection,
	query,
	where,
	orderBy,
	getDocs,
	getCountFromServer,
	doc,
} from "firebase/firestore";
import { db } from "../../../../../server/firebaseConfig";
import { convertDateToTimestamp } from "../../../../custom/customFunction";

export async function getUserReport(
	li_id,
	setMockData,
	searchQuery,
	d_role,
	d_status,
	d_userType,
	d_courses,
	d_year,
	d_tracks,
	d_strand,
	d_institute,
	d_program,
	d_section,
	d_libraryList,
	d_dateRangeStart,
	d_dateRangeEnd,
	d_orderBy,
	setLoading,
	Alert
) {
	setLoading(true);

	try {
		const usRef = collection(db, "users");
		const conditions = [where("us_status", "==", d_status)];

		if (d_role === "Patron") {
			conditions.push(
				where(
					"us_liID",
					"==",
					d_libraryList && d_libraryList !== "All"
						? doc(db, "library", d_libraryList)
						: li_id
				)
			);

			if (d_userType !== "All") {
				conditions.push(where("us_type", "==", d_userType));
			} else {
				conditions.push(where("us_level", "in", ["USR-6", "USR-5"]));
			}

			if (d_courses !== "All") {
				conditions.push(where("us_courses", "==", d_courses));
			}

			if (d_year !== "All") {
				conditions.push(where("us_year", "==", d_year));
			}

			if (d_tracks !== "All") {
				conditions.push(where("us_tracks", "==", d_tracks));
			}

			if (d_strand !== "All") {
				conditions.push(where("us_strand", "==", d_strand));
			}

			if (d_institute !== "All") {
				conditions.push(where("us_institute", "==", d_institute));
			}

			if (d_program !== "All") {
				conditions.push(where("us_program", "==", d_program));
			}

			if (d_section !== "") {
				conditions.push(where("us_section", "==", d_section));
			}
		} else {
			conditions.push(where("us_type", "==", "Personnel"));
		}

		const isQRSearch = searchQuery?.startsWith("USR-");
		const isSearchEmpty = !searchQuery || searchQuery.trim() === "";

		if (isQRSearch) {
			conditions.push(where("us_qr", "==", searchQuery));
		} else {
			conditions.push(orderBy("us_createdAt", "desc"));
		}

		// 🔹 Run user query
		const snapshot = await getDocs(query(usRef, ...conditions));

		if (snapshot.empty) {
			setMockData((prev) => ({
				...prev,
				usersWithMostReports: [],
			}));
			return;
		}

		// 🔹 Process each user’s reports
		const reportList = await Promise.all(
			snapshot.docs.map(async (userDoc) => {
				const usData = userDoc.data();
				const userRef = userDoc.ref;

				// Check user type for Personnel
				let userType = usData.us_type;
				if (d_role !== "Patron") {
					const matchedLib = usData.us_library?.find(
						(lib) => lib.us_liID?.id === d_libraryList
					);

					if (!matchedLib) return null;
					if (d_userType !== "All" && matchedLib.us_type !== d_userType)
						return null;

					userType = matchedLib.us_type;
				}

				// 🔹 Filter by search (non-QR)
				const fullName = [usData.us_fname, usData.us_mname, usData.us_lname]
					.filter(Boolean)
					.join(" ")
					.toLowerCase();

				if (
					!isSearchEmpty &&
					!isQRSearch &&
					!fullName.includes(searchQuery.toLowerCase())
				) {
					return null;
				}

				// 🔹 Query reports
				const reportConditions = [
					where(
						d_role !== "Patron" ? "re_modifiedBy" : "re_usID",
						"==",
						userRef
					),
					where("re_liID", "==", li_id),
				];

				if (d_dateRangeStart) {
					reportConditions.push(
						where(
							"re_createdAt",
							">=",
							convertDateToTimestamp(d_dateRangeStart)
						)
					);
				}
				if (d_dateRangeEnd) {
					reportConditions.push(
						where("re_createdAt", "<=", convertDateToTimestamp(d_dateRangeEnd))
					);
				}

				const reportSnap = await getDocs(
					query(collection(db, "report"), ...reportConditions)
				);

				const reportCounts = { Active: 0, Resolved: 0, Waived: 0 };
				reportSnap.forEach((snap) => {
					const r = snap.data();
					if (reportCounts[r.re_status] !== undefined) {
						reportCounts[r.re_status]++;
					}
				});

				return {
					id: userDoc.id,
					es_qr: usData.us_qr,
					es_name: `${usData.us_fname} ${usData.us_mname} ${usData.us_lname}`,
					es_type: userType,
					es_schoolID: usData.us_schoolID,
					es_photoURL: usData.us_photoURL,
					es_report: reportCounts.Active,
					es_resolved: reportCounts.Resolved,
					es_waived: reportCounts.Waived,
					es_totalReport:
						reportCounts.Active + reportCounts.Resolved + reportCounts.Waived,
				};
			})
		);

		const finalReportList = reportList.filter(Boolean);
		finalReportList.sort((a, b) =>
			d_orderBy === "Descending"
				? b.es_totalReport - a.es_totalReport
				: a.es_totalReport - b.es_totalReport
		);

		setMockData((prev) => ({
			...prev,
			usersWithMostReports: finalReportList,
		}));
	} catch (error) {
		console.error("getUsersReport Error:", error);
		Alert.showDanger(error.message || "Failed to fetch users report.");
		return [];
	} finally {
		setLoading(false);
	}
}
