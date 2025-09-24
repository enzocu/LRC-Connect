import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";

// keep a module-level flag
let alreadyProcessed = false;

export async function getScanner(id = null, scannedCode, router, Alert) {
	try {
		// ✅ Stop if already processed a valid QR
		if (alreadyProcessed) return;

		let colRef, fieldName, redirectUrl, successMsg;

		if (scannedCode?.startsWith("USR-")) {
			colRef = collection(db, "users");
			fieldName = "us_qr";
			redirectUrl = "/account/details";
			successMsg = "✅ Redirecting to User Details";
		} else if (scannedCode?.startsWith("TRN-")) {
			colRef = collection(db, "transaction");
			fieldName = "tr_qr";
			redirectUrl = "/transaction/details";
			successMsg = "✅ Redirecting to Transaction Details";
		} else if (scannedCode?.startsWith("MTL-")) {
			colRef = collection(db, "material");
			fieldName = "ma_qr";
			redirectUrl = "/resources/material/details";
			successMsg = "✅ Redirecting to Material Details";
		} else if (scannedCode?.startsWith("CMP-")) {
			colRef = collection(db, "computers");
			fieldName = "co_qr";
			redirectUrl = "/resources/computer/details";
			successMsg = "✅ Redirecting to Computer Details";
		} else if (scannedCode?.startsWith("DRM-")) {
			colRef = collection(db, "discussionrooms");
			fieldName = "dr_qr";
			redirectUrl = "/resources/discussion/details";
			successMsg = "✅ Redirecting to Discussion Room";
		} else if (scannedCode?.startsWith("LIB-")) {
			colRef = collection(db, "library");
			fieldName = "li_qr";
			redirectUrl = "/library/details";
			successMsg = "✅ Redirecting to Library Resource";
		}

		if (!colRef) {
			Alert.showDanger("❌ Invalid QR prefix");
			alreadyProcessed = true;
			return;
		}

		// ✅ If ID is already provided, skip Firestore read
		if (id) {
			Alert.showSuccess(successMsg);
			alreadyProcessed = true;
			router.push(`${redirectUrl}?id=${id}`);
			return;
		}

		// 🔍 Otherwise, fetch from Firestore
		const q = query(colRef, where(fieldName, "==", scannedCode));
		const snapshot = await getDocs(q);

		if (!snapshot.empty) {
			const doc = snapshot.docs[0];
			const foundId = doc.id;

			Alert.showSuccess(successMsg);
			alreadyProcessed = true;
			router.push(`${redirectUrl}?id=${foundId}`);
		} else {
			Alert.showDanger("❌ No record found for this QR code.");
			alreadyProcessed = true;
			return;
		}
	} catch (error) {
		console.error("getScanner error:", error);
		Alert.showDanger(error.message);
	}
}

export function resetScannerLock() {
	alreadyProcessed = false;
}
