import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import {
	formatDate,
	formatTime,
	formatDateTime,
	calculatePastDue,
} from "../../custom/customFunction";

export async function getTransactionDetails(
	tr_id,
	setTransactionData,
	setLoading,
	Alert
) {
	setLoading(true);

	try {
		const trDocRef = doc(db, "transaction", tr_id);
		const trSnap = await getDoc(trDocRef);

		if (!trSnap.exists()) {
			Alert.showDanger("Transaction not found.");
			setTransactionData(null);
			return;
		}

		const data = trSnap.data();
		const id = trSnap.id;

		const userRef = data.tr_usID;
		const libraryRef = data.tr_liID;

		let resourceRef = null;
		if (data.tr_type === "Material") {
			resourceRef = data.tr_maID;
		} else if (data.tr_type === "Discussion Room") {
			resourceRef = data.tr_drID;
		} else if (data.tr_type === "Computer") {
			resourceRef = data.tr_coID;
		}

		const [userSnap, librarySnap, resourceSnap] = await Promise.all([
			getDoc(userRef),
			getDoc(libraryRef),
			resourceRef ? getDoc(resourceRef) : Promise.resolve(null),
		]);

		const userData = userSnap.exists() ? userSnap.data() : {};
		const libraryData = librarySnap.exists() ? librarySnap.data() : {};

		let userLibraryName = {};
		if (userData.us_liID) {
			const userLibSnap = await getDoc(userData.us_liID);
			userLibraryName = userLibSnap.exists() ? userLibSnap.data() : {};
		}

		let tr_resource = {};
		if (resourceSnap && resourceSnap.exists()) {
			const resData = resourceSnap.data();
			if (data.tr_type === "Material") {
				tr_resource = {
					id: resourceSnap.id,
					ma_qr: resData.ma_qr,
					ma_callNumber: resData.ma_libraryCall || resData.ma_qr,
					ma_title: resData.ma_title,
					ma_author: resData.ma_author,
					ma_description: resData.ma_description,
					ma_coverURL: resData.ma_coverURL,
					ma_audioURL: resData.ma_audioURL,
					ma_softURL: resData.ma_softURL,
				};
			} else if (data.tr_type === "Discussion Room") {
				tr_resource = {
					id: resourceSnap.id,
					dr_name: resData.dr_name,
					dr_qr: resData.dr_qr,
					dr_photoURL: resData.dr_photoURL,
					dr_capacity: resData.dr_capacity,
					dr_description: resData.dr_description,
					dr_createdAt: formatDate(resData.dr_createdAt),
				};
			} else if (data.tr_type === "Computer") {
				tr_resource = {
					id: resourceSnap.id,
					co_name: resData.co_name,
					co_qr: resData.co_qr,
					co_photoURL: resData.co_photoURL,
					co_assetTag: resData.co_assetTag,
					co_description: resData.co_description,
					co_createdAt: formatDate(resData.co_createdAt),
				};
			}
		}

		const formatted = {
			id,
			tr_liID: data.tr_liID,
			tr_qr: data.tr_qr,
			tr_type: data.tr_type,
			tr_status: data.tr_status,
			tr_format: data.tr_format,
			tr_accession: data.tr_accession,
			tr_remarks: data.tr_remarks || "",
			tr_library: libraryData.li_name || "",
			tr_resource,
			tr_patron: {
				id: data.tr_usID.id,
				us_name: `${userData.us_fname || ""} ${userData.us_mname || ""} ${
					userData.us_lname || ""
				} ${userData.us_suffix || ""}`.trim(),
				us_schoolID: userData.us_schoolID || "",
				us_type: userData.us_type || "",
				us_email: userData.us_email || "",
				us_photoURL: userData.us_photoURL || "",
				us_library: userLibraryName.li_name || "",

				us_courses: userData.us_courses || "",
				us_year: userData.us_year || "",
				us_tracks: userData.us_tracks || "",
				us_strand: userData.us_strand || "",
				us_institute: userData.us_institute || "",
				us_school: userData.us_school || "",
				us_program: userData.us_program || "",
				us_section: userData.us_section || "",
			},
			tr_pastDueDate: calculatePastDue(data.tr_pastDueDate),
			tr_createdAt: formatDateTime(data.tr_createdAt),
			tr_updatedAtFormmated: formatDateTime(data.tr_updatedAt) || "",
			tr_actualEndFormmated: formatDateTime(data.tr_actualEnd) || "",
			tr_dateFormatted: formatDate(data.tr_useDate) || "",
			tr_dateDueFormatted: formatDate(data.tr_dateDue) || "",
			tr_sessionStartFormatted: formatTime(data.tr_sessionStart) || "",
			tr_sessionEndFormatted: formatTime(data.tr_sessionEnd) || "",
		};

		setTransactionData(formatted);
	} catch (error) {
		console.error("getSingleTransaction Error:", error);
		Alert.showDanger(error.message);
	} finally {
		setLoading(false);
	}
}
