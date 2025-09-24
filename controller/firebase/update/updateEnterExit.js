import {
	collection,
	query,
	where,
	getDocs,
	doc,
	addDoc,
	updateDoc,
	serverTimestamp,
	getDoc
} from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";

import { insertAudit } from "../insert/insertAudit";

export async function EnterExit(
	modifiedBy,
	li_id = null,
	usID = null,
	us_qr = null,
	type,
	status,
	setLoading,
	Alert
) {
	try {
		setLoading(true);

		let usRef;
		let usFullname;
		let usqr;

		if (usID) {
			usRef = doc(db, "users", usID);
			const userSnap = await getDoc(usRef);

			if (!userSnap.exists()) {
				Alert.showDanger("User not found.");
				return;
			}

			const data = userSnap.data();
			usFullname = data.us_fname + " " + data.us_mname + " " + data.us_lname;
			usqr = data.us_qr;
		} else {
			if (!us_qr?.startsWith("USR-")) {
				Alert.showDanger("Invalid QR format. Must start with 'USR-'.");
				return;
			}

			const userQuery = query(
				collection(db, "users"),
				where("us_qr", "==", us_qr)
			);
			const userSnap = await getDocs(userQuery);

			if (userSnap.empty) {
				Alert.showDanger("User not found for this QR code.");
				return;
			}

			const data = userSnap.docs[0].data();
			usRef = doc(db, "users", userSnap.docs[0].id);
			usFullname = data.us_fname + " " + data.us_mname + " " + data.us_lname;
			usqr = data.us_qr;
		}

		const logQuery = query(
			collection(db, "logs"),
			where("lo_usID", "==", usRef),
			where("lo_status", "==", "Active"),
			where("lo_type", "==", type)
		);

		const logSnap = await getDocs(logQuery);
		const hasActive = !logSnap.empty;
		const activeLog = hasActive ? logSnap.docs[0] : null;

		if (status === null) {
			if (hasActive) {
				await markLogAsInactive(
					activeLog.id,
					li_id,
					type,
					usFullname,
					usqr,
					modifiedBy,
					Alert
				);
			} else {
				await createLogEntry(
					li_id,
					usRef,
					type,
					usFullname,
					usqr,
					modifiedBy,
					Alert
				);
			}
		} else if (status === "Active") {
			if (hasActive) {
				await markLogAsInactive(
					activeLog.id,
					li_id,
					type,
					usFullname,
					usqr,
					modifiedBy,
					Alert
				);
			}
			await createLogEntry(
				li_id,
				usRef,
				type,
				usFullname,
				usqr,
				modifiedBy,
				Alert
			);
		} else if (status === "Inactive") {
			if (hasActive) {
				await markLogAsInactive(
					activeLog.id,
					li_id,
					type,
					usFullname,
					usqr,
					modifiedBy,
					Alert
				);
			}
		}
	} catch (error) {
		console.error("EnterExit Error:", error);
		Alert.showDanger("An error occurred while processing entry/exit.");
	} finally {
		setLoading(false);
	}
}

// ✅ Create a new log entry
async function createLogEntry(
	li_id,
	usRef,
	type,
	usFullname,
	usqr,
	modifiedBy,
	Alert
) {
	await addDoc(collection(db, "logs"), {
		lo_liID: li_id,
		lo_usID: usRef,
		lo_status: "Active",
		lo_type: type,
		lo_timeIn: serverTimestamp(),
		lo_createdAt: serverTimestamp(),
	});

	await insertAudit(
		li_id,
		modifiedBy,
		"Entry",
		`User "${usFullname}" (QR: ${usqr}) entered the library via ${type}.`,
		Alert
	);
}

// ✅ Mark existing log as inactive
async function markLogAsInactive(
	logId,
	li_id,
	type,
	usFullname,
	usqr,
	modifiedBy,
	Alert
) {
	await updateDoc(doc(db, "logs", logId), {
		lo_status: "Inactive",
		lo_timeOut: serverTimestamp(),
	});

	await insertAudit(
		li_id,
		modifiedBy,
		"Exit",
		`User "${usFullname}" (QR: ${usqr}) exited the library via ${type}.`,
		Alert
	);
}
