import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../../../server/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Timestamp } from "firebase/firestore";

import { insertAudit } from "../insert/insertAudit";

export async function updateUser(
	associatedLibraries,
	modifiedBy,
	userID,
	userData,
	setBtnLoading,
	Alert
) {
	try {
		setBtnLoading(true);

		let us_photoURL = null;
		if (userData.us_photoURL instanceof File) {
			const photoRef = ref(storage, `users/photo_${Date.now()}`);
			const snapshot = await uploadBytes(photoRef, userData.us_photoURL);
			us_photoURL = await getDownloadURL(snapshot.ref);
		} else if (typeof userData.us_photoURL === "string") {
			us_photoURL = userData.us_photoURL;
		}

		const userRef = doc(db, "users", userID);

		await updateDoc(userRef, {
			us_schoolID: userData.us_schoolID || null,
			us_fname: userData.us_fname || null,
			us_mname: userData.us_mname || null,
			us_lname: userData.us_lname || null,
			us_suffix: userData.us_suffix || null,
			us_sex: userData.us_sex || null,
			us_birthday: userData.us_birthday
				? Timestamp.fromDate(new Date(userData.us_birthday))
				: null,
			us_email: userData.us_email || null,
			us_phoneNumber: userData.us_phoneNumber || null,
			us_photoURL: us_photoURL || null,
			us_updatedAt: serverTimestamp(),
		});

		for (const lib of associatedLibraries) {
			const { id, li_name, li_qr } = lib;

			await insertAudit(
				id,
				modifiedBy,
				"Update",
				`User "${userData.us_fname} ${userData.us_mname} ${userData.us_lname}" information was updated in library "${li_name}" (QR: ${li_qr}).`,
				Alert
			);
		}

		Alert.showSuccess("Account updated successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
	} finally {
		setBtnLoading(false);
	}
}

export async function updateAcademic(
	associatedLibraries,
	modifiedBy,
	userID,
	Username,
	academicData,
	setBtnLoading,
	Alert
) {
	try {
		setBtnLoading(true);

		const userRef = doc(db, "users", userID);

		await updateDoc(userRef, {
			us_courses: academicData.us_courses || null,
			us_year: academicData.us_year || null,
			us_tracks: academicData.us_tracks || null,
			us_strand: academicData.us_strand || null,
			us_institute: academicData.us_institute || null,
			us_program: academicData.us_program || null,
			us_section: academicData.us_section || null,
			us_updatedAt: serverTimestamp(),
		});

		for (const lib of associatedLibraries) {
			const { id, li_name, li_qr } = lib;

			await insertAudit(
				id,
				modifiedBy,
				"Update",
				`Academic information of user "${Username}" was updated in library "${li_name}" (QR: ${li_qr}).`,
				Alert
			);
		}
		Alert.showSuccess("Account academic updated successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
	} finally {
		setBtnLoading(false);
	}
}

export async function updateAddress(
	associatedLibraries,
	modifiedBy,
	userID,
	Username,
	addressData,
	setBtnLoading,
	Alert
) {
	try {
		setBtnLoading(true);

		const userRef = doc(db, "users", userID);

		await updateDoc(userRef, {
			us_street: addressData.us_street,
			us_barangay: extractAfterPipe(addressData.us_barangay),
			us_municipal: extractAfterPipe(addressData.us_municipal),
			us_province: extractAfterPipe(addressData.us_province),
			us_updatedAt: serverTimestamp(),
		});

		for (const lib of associatedLibraries) {
			const { id, li_name, li_qr } = lib;

			await insertAudit(
				id,
				modifiedBy,
				"Update",
				`Address of user "${Username}" was updated in library "${li_name}" (QR: ${li_qr}).`,
				Alert
			);
		}

		Alert.showSuccess("Account address updated successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
	} finally {
		setBtnLoading(false);
	}
}

const extractAfterPipe = (str) => {
	return typeof str === "string" && str.includes("|") ? str.split("|")[1] : str;
};
