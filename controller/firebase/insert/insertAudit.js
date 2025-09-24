import { collection, addDoc, serverTimestamp, doc } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import { UAParser } from "ua-parser-js";
async function getIPAddress() {
	try {
		const res = await fetch("https://api.ipify.org?format=json");
		const data = await res.json();
		return data.ip;
	} catch {
		return "Unknown";
	}
}

function getDeviceInfo() {
	if (typeof window !== "undefined") {
		const parser = new UAParser();
		const result = parser.getResult();
		return `${result.os.name} ${result.os.version} - ${result.browser.name} ${result.browser.version}`;
	}
	return "Server";
}

function getSeverityByAction(actionType) {
	const mapping = {
		Create: "Medium",
		Read: "Low",
		Update: "Medium",
		Delete: "High",
		Entry: "Low",
		Exit: "Low",
		Login: "Low",
		Logout: "Low",
		Deactivate: "High",
		"Reset Password": "Medium",
		Reserved: "Medium",
		Utilized: "Medium",
		Completed: "Low",
		Cancelled: "Medium",
		Report: "Medium",
		Print: "High",
		Feedback: "Low",
	};

	return mapping[actionType] || "Low";
}

export async function insertAudit(
	li_id,
	us_id,
	actionType,
	description,
	Alert
) {
	try {
		const ip = await getIPAddress();
		const device = getDeviceInfo();

		await addDoc(collection(db, "audittrail"), {
			au_liID: typeof li_id === "string" ? doc(db, "library", li_id) : li_id,
			au_usID: typeof us_id === "string" ? doc(db, "users", us_id) : us_id,
			au_actionType: actionType,
			au_status: getSeverityByAction(actionType),
			au_description: description,
			au_device: device,
			au_ipAddress: ip,
			au_createdAt: serverTimestamp(),
		});
	} catch (error) {
		Alert.showDanger(error.message);
	}
}
