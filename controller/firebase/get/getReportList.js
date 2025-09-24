import {
	doc,
	getDoc,
	collection,
	query,
	where,
	onSnapshot,
	orderBy,
} from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import { formatDate, formatTime } from "../../custom/customFunction";

export function getReportListRealtime(
	isPersonnel,
	us_id,
	li_id,
	status,
	searchQuery,
	selectedType,
	setReportData,
	setLoading,
	Alert
) {
	setLoading(true);

	const orderField = status === "Active" ? "re_createdAt" : "re_updatedAt";

	// 🔹 Build conditions dynamically
	const conditions = [
		where("re_usID", "==", doc(db, "users", us_id)),
		where("re_status", "==", status),
	];

	if (isPersonnel) {
		conditions.push(where("re_liID", "==", li_id));
	}

	// 🔹 Apply conditions + orderBy
	const baseQuery = query(
		collection(db, "report"),
		...conditions,
		orderBy(orderField, "desc")
	);

	const unsubscribe = onSnapshot(
		baseQuery,
		async (snapshot) => {
			try {
				const reports = await Promise.all(
					snapshot.docs.map(async (docSnap) => {
						const docData = docSnap.data();

						// fetch transaction doc (parallel start)
						const trSnapPromise = getDoc(docData.re_trID);

						// fetch patron & personnel profiles (parallel start)
						const patronProfilePromise = isPersonnel
							? getUserProfileDetails(docData.re_usID)
							: Promise.resolve(null);

						const personnelProfilePromise =
							status !== "Active" && docData.re_modifiedBy != null
								? getUserProfileDetails(docData.re_modifiedBy, li_id)
								: Promise.resolve(null);

						// wait for transaction first
						const trSnap = await trSnapPromise;
						if (!trSnap.exists()) return null;

						const data = trSnap.data();

						// fetch resource in parallel depending on type
						let resPromise = Promise.resolve(null);

						if (data.tr_type === "Material") {
							resPromise = getDoc(data.tr_maID);
						} else if (data.tr_type === "Discussion Room") {
							resPromise = getDoc(data.tr_drID);
						} else if (data.tr_type === "Computer") {
							resPromise = getDoc(data.tr_coID);
						}

						// library details if NOT personnel
						const libraryPromise =
							!isPersonnel && docData.re_liID
								? getDoc(docData.re_liID)
								: Promise.resolve(null);

						// wait for all parallel tasks
						const [resSnap, patronProfile, personnelProfile, librarySnap] =
							await Promise.all([
								resPromise,
								patronProfilePromise,
								personnelProfilePromise,
								libraryPromise,
							]);

						let tr_resource = {};
						if (resSnap?.exists()) {
							const resData = resSnap.data();
							if (data.tr_type === "Material") {
								tr_resource = {
									id: resSnap.id,
									ma_qr: resData.ma_qr,
									ma_title: resData.ma_title,
									ma_author: resData.ma_author,
									ma_description: resData.ma_description,
									ma_coverURL: resData.ma_coverURL,
								};
							} else if (data.tr_type === "Discussion Room") {
								tr_resource = {
									id: resSnap.id,
									dr_name: resData.dr_name,
									dr_qr: resData.dr_qr,
									dr_photoURL: resData.dr_photoURL,
									dr_capacity: resData.dr_capacity,
									dr_description: resData.dr_description,
									dr_createdAt: formatDate(resData.dr_createdAt),
								};
							} else if (data.tr_type === "Computer") {
								tr_resource = {
									id: resSnap.id,
									co_name: resData.co_name,
									co_qr: resData.co_qr,
									co_photoURL: resData.co_photoURL,
									co_assetTag: resData.co_assetTag,
									co_description: resData.co_description,
									co_createdAt: formatDate(resData.co_createdAt),
								};
							}
						}

						if (librarySnap?.exists()) {
							tr_resource = {
								...tr_resource,
								reportLibrary: librarySnap.data().li_name || null,
							};
						}

						return {
							id: docSnap.id,
							re_remarks: docData.re_remarks || [],
							re_instruction: docData.re_instruction || "",
							re_dateSettled:
								status !== "Active" ? formatDate(docData.re_dateSettled) : "",
							re_deadline: formatDate(docData.re_deadline),

							tr_qr: data.tr_qr,
							tr_type: data.tr_type,
							tr_status: data.tr_status,
							tr_format: data.tr_format,
							tr_createdAt: formatDate(data.tr_createdAt),

							tr_resource,
							tr_patron: patronProfile,
							tr_personnel: personnelProfile,

							tr_dateFormatted: formatDate(data.tr_useDate) || "",
							tr_dateDueFormatted: formatDate(data.tr_dateDue) || "",
							tr_sessionStartFormatted: formatTime(data.tr_sessionStart) || "",
							tr_sessionEndFormatted: formatTime(data.tr_sessionEnd) || "",
						};
					})
				);

				// 🔹 Filter out nulls
				let filteredReports = reports.filter(Boolean);

				// 🔹 Filter by selectedType
				if (selectedType && selectedType !== "") {
					filteredReports = filteredReports.filter(
						(r) => r.tr_type === selectedType
					);
				}

				// 🔹 Filter by searchQuery
				if (searchQuery && searchQuery.trim() !== "") {
					const q = searchQuery.toLowerCase();
					filteredReports = filteredReports.filter((r) => {
						const nameMatch = r.tr_patron?.us_name?.toLowerCase().includes(q);
						const qrMatch = r.tr_qr?.toLowerCase().includes(q);
						return nameMatch || qrMatch;
					});
				}

				setReportData(filteredReports);
			} catch (error) {
				console.error("Realtime Error:", error);
				Alert.showDanger(error.message);
			} finally {
				setLoading(false);
			}
		},
		(error) => {
			console.error("onSnapshot error:", error);
			setLoading(false);
			Alert.showDanger("Failed to load reports in real-time.");
		}
	);

	return unsubscribe;
}

async function getUserProfileDetails(userRef, li_id = null) {
	try {
		const userSnap = await getDoc(userRef);
		if (!userSnap.exists()) return null;

		const userData = userSnap.data();
		const librarySnap = await getDoc(li_id == null ? userData.us_liID : li_id);
		const libraryData = librarySnap.exists() ? librarySnap.data() : {};

		return {
			us_name: `${userData.us_fname || ""} ${userData.us_mname || ""} ${
				userData.us_lname || ""
			}`.trim(),
			us_schoolID: userData.us_schoolID || "",
			us_type: userData.us_type || "",
			us_email: userData.us_email || "",
			us_photoURL: userData.us_photoURL || "",
			us_library: libraryData.li_name || "",
			us_year: userData.us_year || "",
			us_section: userData.us_section || "",
			us_program: userData.us_program || "",
			us_school: userData.us_school || "",
		};
	} catch (error) {
		console.error("Error fetching user profile:", error);
		return null;
	}
}
