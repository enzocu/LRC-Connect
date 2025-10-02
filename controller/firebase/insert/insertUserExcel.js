import {
	collection,
	getDocs,
	query,
	where,
	doc,
	setDoc,
	updateDoc,
	serverTimestamp,
} from "firebase/firestore";
import {
	createUserWithEmailAndPassword,
	sendPasswordResetEmail,
	getAuth,
} from "firebase/auth";
import { db, firebaseConfig } from "../../../server/firebaseConfig";
import { initializeApp, getApps } from "firebase/app";
import { Timestamp } from "firebase/firestore";
import { generateQrID } from "../get/getGeneratedQR";
import { getUserLevel } from "../../../controller/custom/getUserLevel";
import { insertAudit } from "../insert/insertAudit";
import { markCancelled } from "../update/updateMarkCancelled";
import { toSafeString } from "../../custom/customFunction";

export async function insertUserExcel(
	li_id,
	modifiedBy,
	userDataArray,
	setBtnloading,
	Alert
) {
	setBtnloading(true);

	try {
		// 🔑 Init secondary Firebase app/auth
		let secondaryApp;
		if (!getApps().some((app) => app.name === "Secondary")) {
			secondaryApp = initializeApp(firebaseConfig, "Secondary");
		} else {
			secondaryApp = getApps().find((app) => app.name === "Secondary");
		}
		const secondaryAuth = getAuth(secondaryApp);

		let totalRegisteredCount = 0;
		let totalUpdateCount = 0;
		let totalSkippedCount = 0;

		for (const userData of userDataArray) {
			const existsDoc = await checkUserExistence(
				userData.us_schoolID,
				userData.us_email
			);

			let birthdayValue = "";
			if (userData.us_birthday) {
				if (typeof userData.us_birthday === "number") {
					birthdayValue = Timestamp.fromDate(
						new Date(1899, 11, 30 + userData.us_birthday)
					);
				} else if (userData.us_birthday instanceof Date) {
					birthdayValue = Timestamp.fromDate(userData.us_birthday);
				} else if (userData.us_birthday instanceof Timestamp) {
					birthdayValue = userData.us_birthday;
				} else {
					birthdayValue = Timestamp.fromDate(new Date(userData.us_birthday));
				}
			}

			// 🔑 Standardize user data
			const userDocData = {
				us_qr: await generateQrID("users", "USR"),
				us_schoolID: toSafeString(userData.us_schoolID),
				us_status: toSafeString(userData.us_status, "Inactive"),
				us_fname: toSafeString(userData.us_fname),
				us_mname: toSafeString(userData.us_mname),
				us_lname: toSafeString(userData.us_lname),
				us_suffix: toSafeString(userData.us_suffix),
				us_sex: toSafeString(userData.us_sex),
				us_birthday: birthdayValue,
				us_email: toSafeString(userData.us_email),
				us_phoneNumber: toSafeString(userData.us_phoneNumber),
				us_street: toSafeString(userData.us_street, "."),
				us_barangay: toSafeString(userData.us_barangay),
				us_municipal: toSafeString(userData.us_municipal, "."),
				us_province: toSafeString(userData.us_province),

				us_courses: toSafeString(userData.us_courses),
				us_year: toSafeString(userData.us_year),
				us_tracks: toSafeString(userData.us_tracks),
				us_strand: toSafeString(userData.us_strand),
				us_institute: toSafeString(userData.us_institute),
				us_program: toSafeString(userData.us_program),
				us_section: toSafeString(userData.us_section),
				us_updatedAt: serverTimestamp(),
				us_createdAt: serverTimestamp(),
			};

			const newLevel = getUserLevel(userData.us_type);

			if (!existsDoc && userData.us_status == "Active") {
				const randomPassword = generatePassword();
				const userCredential = await createUserWithEmailAndPassword(
					secondaryAuth,
					userData.us_email,
					randomPassword
				);

				await sendPasswordResetEmail(secondaryAuth, userData.us_email);

				const userDocRef = doc(db, "users", userCredential.user.uid);

				userDocData.us_liID = doc(db, "library", li_id);
				userDocData.us_level = newLevel;
				userDocData.us_type = userData.us_type;

				await setDoc(userDocRef, {
					...userDocData,
					uid: userCredential.user.uid,
				});

				totalRegisteredCount++;
			} else {
				// --- Update user if same library or inactive ---
				const docRef = doc(db, "users", existsDoc.id);
				const existing = existsDoc.data();

				const sameLibrary = existing.us_liID?.id === li_id;
				const isInactive = existing.us_status === "Inactive";

				if (sameLibrary || isInactive) {
					await updateDoc(docRef, {
						...userDocData,
						...(isInactive && {
							us_liID: doc(db, "library", li_id),
						}),
						us_level: newLevel,
						us_type: userData.us_type,
						us_remarks: [],
						us_updatedAt: serverTimestamp(),
					});
					totalUpdateCount++;

					if (userData.us_status == "Inactive") {
						await markCancelled(
							existsDoc.id,
							`${userData.us_fname} ${userData.us_mname} ${userData.us_lname}`,
							"tr_usID",
							"users",
							modifiedBy,
							[
								"This transaction has been cancelled due to the deactivation of the associated patron.",
							],
							Alert
						);
					}
				} else {
					totalSkippedCount++;
				}
			}
		}

		// 🔑 Audit + Alerts
		if (totalRegisteredCount > 0 || totalUpdateCount > 0) {
			await insertAudit(
				li_id,
				modifiedBy,
				"Create",
				`Bulk upload completed: ${totalRegisteredCount} new users registered and ${totalUpdateCount} existing users updated.`,
				Alert
			);

			Alert.showSuccess(
				`✅ ${totalRegisteredCount} registered | 🔄 ${totalUpdateCount} updated`
			);
		}
		if (totalSkippedCount > 0) {
			Alert.showWarning(
				`${totalSkippedCount} account(s) were skipped: already active in another library.`
			);
		}
	} catch (error) {
		console.error("Insert Error:", error);
		Alert.showDanger(error.message);
	} finally {
		setBtnloading(false);
	}
}

const checkUserExistence = async (us_schoolID, us_email) => {
	const q = query(
		collection(db, "users"),
		where("us_schoolID", "==", us_schoolID)
	);
	const snapshot = await getDocs(q);
	if (!snapshot.empty) return snapshot.docs[0];

	const emailQuery = query(
		collection(db, "users"),
		where("us_email", "==", us_email)
	);
	const emailSnapshot = await getDocs(emailQuery);
	if (!emailSnapshot.empty) return emailSnapshot.docs[0];

	return null;
};

// 🔑 Random password generator
const generatePassword = () => Math.random().toString(36).slice(-10);
