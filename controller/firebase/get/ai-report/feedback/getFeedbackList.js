import {
	collection,
	query,
	where,
	orderBy,
	limit,
	getDocs,
	getDoc,
	doc,
} from "firebase/firestore";
import { db } from "../../../../../server/firebaseConfig";
import { getRelativeTime } from "../../../../custom/customFunction";

export async function getFeedbackList(li_id, setIsFetch, Alert) {
	try {
		setIsFetch?.("Checking feedback list…");
		const feRef = collection(db, "feedback");

		const q = query(
			feRef,
			where("fe_liID", "==", li_id),
			where("fe_status", "==", "Active"),
			orderBy("fe_createdAt", "desc"),
			limit(10)
		);

		const snapshot = await getDocs(q);

		const feedbacks = await Promise.all(
			snapshot.docs.map(async (docSnap) => {
				const raw = docSnap.data();
				const id = docSnap.id;

				let userData = {};
				if (raw.fe_sender) {
					try {
						const userSnap = await getDoc(raw.fe_sender);
						if (userSnap.exists()) {
							userData = userSnap.data();
						}
					} catch (err) {
						console.warn("Error fetching user:", err);
					}
				}

				const sender = `${userData.us_fname ?? ""} ${userData.us_mname ?? ""} ${
					userData.us_lname ?? ""
				} ${userData.us_suffix ?? ""}`.trim();

				return (
					`----------------------------------\n` +
					`Feedback ID: ${id}\n` +
					`Sender: ${sender || "Unknown"}\n` +
					`User Type: ${userData.us_type || "NA"}\n` +
					`School ID: ${userData.us_schoolID || "NA"}\n` +
					`Status: ${raw.fe_status}\n` +
					`Content: ${raw.fe_content}\n` +
					`Read: ${raw.fe_read}\n` +
					`Screenshot: ${raw.fe_screenshot}\n` +
					`Type: ${raw.fe_type}\n` +
					`Created At: ${
						raw.fe_createdAt ? getRelativeTime(raw.fe_createdAt) : "Unknown"
					}\n` +
					`Update At: ${
						raw.fe_updatedAt ? getRelativeTime(raw.fe_updatedAt) : "Unknown"
					}\n`
				);
			})
		);

		let output = "📌 Recent Feedbacks\n\n";
		if (feedbacks.length > 0) {
			output += feedbacks.join("\n");
		} else {
			output += "No feedback available.";
		}

		return output;
	} catch (error) {
		console.error("getFeedbackList Error:", error);
		Alert?.showDanger(error.message || "Failed to fetch feedback list.");
		return "📌 Recent Feedbacks\n\nError fetching data.";
	} finally {
		setIsFetch?.(null);
	}
}
