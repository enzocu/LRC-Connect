import {
	collection,
	query,
	where,
	getDocs,
	getDoc,
	doc,
	orderBy,
} from "firebase/firestore";
import { db } from "../../../../../server/firebaseConfig";
import { formatDate, formatTime } from "../../../../custom/customFunction";

export async function getActiveReport(us_id, li_id, setIsFetch, Alert) {
	try {
		setIsFetch("Checking active reports…");

		const conditions = [where("re_status", "==", "Active")];
		if (us_id) conditions.push(where("re_usID", "==", doc(db, "users", us_id)));
		if (li_id) conditions.push(where("re_liID", "==", li_id));

		const baseQuery = query(
			collection(db, "report"),
			...conditions,
			orderBy("re_createdAt", "desc")
		);

		const snapshot = await getDocs(baseQuery);

		const reports = await Promise.all(
			snapshot.docs.map(async (docSnap) => {
				const docData = docSnap.data();

				// fetch transaction doc
				const trSnap = await getDoc(docData.re_trID);
				if (!trSnap.exists()) return null;

				const data = trSnap.data();

				// fetch resource
				let resSnap;
				let tr_resource = "No resource details";
				if (data.tr_type === "Material" && data.tr_maID) {
					resSnap = await getDoc(data.tr_maID);
					if (resSnap.exists()) {
						const d = resSnap.data();
						tr_resource =
							`[Material]\n` +
							`ID: ${resSnap.id}\n` +
							`QR: ${d.ma_qr}\n` +
							`Title: ${d.ma_title}\n` +
							`Author: ${d.ma_author}\n` +
							`Description: ${d.ma_description}\n` +
							`Cover URL: ${d.ma_coverURL}\n`;
					}
				} else if (data.tr_type === "Discussion Room" && data.tr_drID) {
					resSnap = await getDoc(data.tr_drID);
					if (resSnap.exists()) {
						const d = resSnap.data();
						tr_resource =
							`[Discussion Room]\n` +
							`ID: ${resSnap.id}\n` +
							`Name: ${d.dr_name}\n` +
							`QR: ${d.dr_qr}\n` +
							`Capacity: ${d.dr_capacity}\n` +
							`Description: ${d.dr_description}\n` +
							`Created At: ${formatDate(d.dr_createdAt)}\n` +
							`Photo URL: ${d.dr_photoURL}\n`;
					}
				} else if (data.tr_type === "Computer" && data.tr_coID) {
					resSnap = await getDoc(data.tr_coID);
					if (resSnap.exists()) {
						const d = resSnap.data();
						tr_resource =
							`[Computer]\n` +
							`ID: ${resSnap.id}\n` +
							`Name: ${d.co_name}\n` +
							`QR: ${d.co_qr}\n` +
							`Asset Tag: ${d.co_assetTag}\n` +
							`Description: ${d.co_description}\n` +
							`Created At: ${formatDate(d.co_createdAt)}\n` +
							`Photo URL: ${d.co_photoURL}\n`;
					}
				}

				// patron profile
				let patronProfile = null;
				if (docData.re_usID) {
					patronProfile = await getUserProfileDetails(
						docData.re_usID,
						li_id || docData.re_liID
					);
				}

				// library details
				let libraryDetails = null;
				if (docData.re_liID) {
					const libSnap = await getDoc(docData.re_liID);
					if (libSnap.exists()) {
						const lib = libSnap.data();
						libraryDetails =
							`[Library]\n` +
							`Library ID: ${libSnap.id || ""}\n` +
							`Name: ${lib.li_name || ""}\n` +
							`QR: ${lib.li_qr || ""}\n` +
							`School: ${lib.li_schoolName || ""}\n` +
							`School ID: ${lib.li_schoolID || ""}\n`;
					}
				}

				return (
					`----------------------------------\n` +
					`Report ID: ${docSnap.id}\n` +
					`Remarks: ${docData.re_remarks?.join(", ") || "None"}\n` +
					`Instruction: ${docData.re_instruction || "None"}\n` +
					`Deadline: ${formatDate(docData.re_deadline)}\n` +
					`Date Settled: ${
						docData.re_status !== "Active"
							? formatDate(docData.re_dateSettled)
							: "Not settled"
					}\n\n` +
					`Transaction ID: ${docData.re_trID.id}\n` +
					`Transaction QR: ${data.tr_qr}\n` +
					`Type: ${data.tr_type}\n` +
					`Status: ${data.tr_status}\n` +
					`Format: ${data.tr_format}\n` +
					`Created At: ${formatDate(data.tr_createdAt)}\n` +
					`Use Date: ${formatDate(data.tr_useDate) || "None"}\n` +
					`Due Date: ${formatDate(data.tr_dateDue) || "None"}\n` +
					`Session Start: ${formatTime(data.tr_sessionStart) || "None"}\n` +
					`Session End: ${formatTime(data.tr_sessionEnd) || "None"}\n\n` +
					`Resource Details:\n${tr_resource}\n` +
					(libraryDetails ? `${libraryDetails}\n` : "") +
					(patronProfile
						? `[Patron]\n` +
						  `Patron/User ID: ${patronProfile.id}\n` +
						  `Name: ${patronProfile.us_name}\n` +
						  `Type: ${patronProfile.us_type}\n` +
						  `School ID: ${patronProfile.us_schoolID}\n` +
						  `Email: ${patronProfile.us_email}\n` +
						  `Program: ${patronProfile.us_program}\n` +
						  `Year: ${patronProfile.us_year}\n` +
						  `Section: ${patronProfile.us_section}\n` +
						  `School: ${patronProfile.us_school}\n`
						: "")
				);
			})
		);

		const filteredReports = reports.filter((r) => r !== null);

		let output = "📑 Active Reports\n\n";
		if (filteredReports.length > 0) {
			output += filteredReports.join("\n");
		} else {
			output += "No active reports available.";
		}

		return output;
	} catch (error) {
		console.error("Error fetching reports:", error);
		Alert?.showDanger(error.message || "Failed to fetch reports.");
		return "📑 Active Reports\n\nError fetching data.";
	} finally {
		setIsFetch(null);
	}
}

async function getUserProfileDetails(userRef, li_id = null) {
	try {
		const userSnap = await getDoc(userRef);
		if (!userSnap.exists()) return null;

		const userData = userSnap.data();
		const librarySnap = await getDoc(li_id == null ? userData.us_liID : li_id);
		const libraryData = librarySnap.exists() ? librarySnap.data() : {};

		return {
			id: userSnap.id,
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
