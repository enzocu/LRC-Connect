import { serverTimestamp, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
	createUserWithEmailAndPassword,
	sendPasswordResetEmail,
	getAuth,
	fetchSignInMethodsForEmail,
} from "firebase/auth";
import { db, firebaseConfig, storage } from "../../../server/firebaseConfig";
import { initializeApp, getApps } from "firebase/app";
import { generateQrID } from "../get/getGeneratedQR";
import { getUserLevel } from "../../../controller/custom/getUserLevel";
import { convertDateToTimestamp } from "../../custom/customFunction";

import { insertAudit } from "../insert/insertAudit";

export async function insertUser(li_id, us_id, userData, setBtnLoading, Alert) {
	setBtnLoading(true);

	try {
		let secondaryApp;
		if (!getApps().some((app) => app.name === "Secondary")) {
			secondaryApp = initializeApp(firebaseConfig, "Secondary");
		} else {
			secondaryApp = getApps().find((app) => app.name === "Secondary");
		}
		const secondaryAuth = getAuth(secondaryApp);

		const existingMethods = await fetchSignInMethodsForEmail(
			secondaryAuth,
			userData.us_email
		);
		if (existingMethods.length > 0) {
			Alert.showDanger(
				"Email already registered! You may check it under its associated library."
			);
			return;
		}

		const randomPassword = generatePassword();
		const userCredential = await createUserWithEmailAndPassword(
			secondaryAuth,
			userData.us_email,
			randomPassword
		);
		await sendPasswordResetEmail(secondaryAuth, userData.us_email);

		let us_photoURL = null;
		if (userData.us_photoURL && userData.us_photoURL !== "") {
			const photoRef = ref(storage, `users/photo_${Date.now()}`);
			const snapshot = await uploadBytes(photoRef, userData.us_photoURL);
			us_photoURL = await getDownloadURL(snapshot.ref);
		}

		const userDocRef = doc(db, "users", userCredential.user.uid);

		const [_, us_province = ""] = userData.us_province?.split("|") || [];
		const [__, us_municipal = ""] = userData.us_municipal?.split("|") || [];
		const [___, us_barangay = ""] = userData.us_barangay?.split("|") || [];

		const userDocData = {
			us_qr: await generateQrID("users", "USR"),
			us_schoolID: userData.us_schoolID || null,
			us_status: "Active",
			us_fname: userData.us_fname || null,
			us_mname: userData.us_mname || null,
			us_lname: userData.us_lname || null,
			us_suffix: userData.us_suffix || null,
			us_sex: userData.us_sex || null,
			us_birthday: convertDateToTimestamp(userData.us_birthday),
			us_email: userData.us_email || null,
			email: userData.us_email || null,
			us_phoneNumber: userData.us_phoneNumber || null,
			us_street: userData.us_street || null,
			us_barangay,
			us_municipal,
			us_province,
			us_courses: userData.us_courses || null,
			us_year: userData.us_year || null,
			us_tracks: userData.us_tracks || null,
			us_strand: userData.us_strand || null,
			us_institute: userData.us_institute || null,
			us_program: userData.us_program || null,
			us_section: userData.us_section || null,

			us_photoURL,
			us_createdAt: serverTimestamp(),
			us_type: userData.us_type || null,
		};

		const newLevel = getUserLevel(userData.us_type);

		if (["USR-5", "USR-6"].includes(newLevel)) {
			userDocData.us_level = newLevel;
			userDocData.us_liID = doc(db, "library", li_id);
		} else {
			userDocData.us_type = "Personnel";
			userDocData.us_library = [
				{
					us_liID: doc(db, "library", li_id),
					us_level: newLevel,
					us_type: userData.us_type,
				},
			];
		}

		await setDoc(userDocRef, {
			...userDocData,
			uid: userCredential.user.uid,
		});

		await insertAudit(
			li_id,
			us_id,
			"Create",
			`A new user account for "${userData.us_fname} ${userData.us_mname} ${userData.us_lname}" was registered in the library.`,
			Alert
		);

		Alert.showSuccess("Account registered successfully!");
	} catch (error) {
		console.error(error);

		let errorMessage = "Something went wrong. Please try again.";

		switch (error.code) {
			case "auth/email-already-in-use":
				errorMessage =
					"The provided email is already registered! Please check the associated account.";
				break;
			case "auth/invalid-email":
				errorMessage =
					"The email address is invalid. Ensure it follows the correct email format.";
				break;
			case "auth/weak-password":
				errorMessage =
					"The password is too weak. It must be at least six characters long. Try again.";
				break;
			case "auth/network-request-failed":
				errorMessage =
					"Network error. Please check your internet connection and try again.";
				break;
			case "auth/operation-not-allowed":
				errorMessage =
					"The requested sign-in method is disabled. Please contact support or enable it in the Firebase Console.";
				break;
			case "auth/too-many-requests":
				errorMessage =
					"Too many requests have been made from this device. Please wait a few minutes before trying again.";
				break;
			case "auth/user-disabled":
				errorMessage =
					"This account has been disabled. Contact support for assistance.";
				break;
			default:
				errorMessage = error.message;
		}

		Alert.showDanger(errorMessage);
	} finally {
		setBtnLoading(false);
	}
}

// Password generator
const generatePassword = () =>
	Math.random().toString(36).slice(-5) +
	Math.random().toString(36).toUpperCase().slice(-5);
