import { collection, addDoc, serverTimestamp, doc } from "firebase/firestore";
import { db, storage } from "../../../server/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { generateQrID } from "../get/getGeneratedQR";
import { timeStringToTimestamp } from "../../custom/customFunction";

import { insertAudit } from "../insert/insertAudit";

export async function insertLibrary(us_id, formData, setBtnloading, Alert) {
	try {
		setBtnloading(true);

		let li_photoURL = null;

		if (formData.li_photoURL && formData.li_photoURL !== "") {
			const photoRef = ref(storage, `library/photo_${Date.now()}`);
			const snapshot = await uploadBytes(photoRef, formData.li_photoURL);
			li_photoURL = await getDownloadURL(snapshot.ref);
		}

		const li_qr = await generateQrID("library", "LIB");

		const days = [
			"monday",
			"tuesday",
			"wednesday",
			"thursday",
			"friday",
			"saturday",
		];

		const defaultHours = {
			oh_monday: { enabled: false, open: "07:00", close: "21:00" },
			oh_tuesday: { enabled: false, open: "07:00", close: "21:00" },
			oh_wednesday: { enabled: false, open: "07:00", close: "21:00" },
			oh_thursday: { enabled: false, open: "07:00", close: "21:00" },
			oh_friday: { enabled: false, open: "07:00", close: "21:00" },
			oh_saturday: { enabled: false, open: "08:00", close: "21:00" },
		};

		const li_operating = {};
		for (const day of days) {
			const key = `oh_${day}`;
			const schedule = defaultHours[key];
			li_operating[key] = {
				enabled: schedule.enabled,
				open: timeStringToTimestamp(schedule.open),
				close: timeStringToTimestamp(schedule.close),
			};
		}

		const docRef = await addDoc(collection(db, "library"), {
			li_qr: li_qr,
			li_usID: doc(db, "users", us_id),
			li_status: "Active",
			li_schoolID: formData.li_schoolID || null,
			li_name: formData.li_name || null,
			li_schoolname: formData.li_schoolname || null,
			li_email: formData.li_email || null,
			li_phone: formData.li_phone || null,
			li_description: formData.li_description || null,
			li_address: formData.li_address || null,
			li_latlng: formData.li_latlng || null,
			li_photoURL: li_photoURL || null,

			li_resources: {
				material: false,
				discussion: false,
				computer: false,
			},

			li_borrowing: {
				br_student: { maxItems: 3, borrowDays: 8 },
				br_faculty: { maxItems: 5, borrowDays: 8 },
				br_administrator: { maxItems: 5, borrowDays: 8 },
			},

			li_operating: li_operating,

			li_createdAt: serverTimestamp(),
		});

		await insertAudit(
			docRef.id,
			us_id,
			"Create",
			`Library "${formData.li_name}" (QR: ${li_qr}) was successfully registered.`,
			Alert
		);

		Alert.showSuccess("Library registered successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
	} finally {
		setBtnloading(false);
	}
}
