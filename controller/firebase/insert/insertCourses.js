import {
	doc,
	addDoc,
	updateDoc,
	serverTimestamp,
	arrayUnion,
	collection,
} from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";

export const insertCourses = async (name, actionData, setBtnLoading, Alert) => {
	try {
		setBtnLoading(true);

		let insertPayload = {};
		const fieldName = `cs_${actionData.type}`;

		// If adding new track or institute
		if (["track", "institute"].includes(actionData.type)) {
			insertPayload["cs_status"] = "Active";
			insertPayload["cs_type"] =
				actionData.type === "track" ? "Senior High School" : "College Courses";
			insertPayload[fieldName] = name;
			insertPayload[actionData.type === "track" ? "cs_strand" : "cs_program"] =
				[];
			insertPayload["cs_createdAt"] = serverTimestamp();

			await addDoc(collection(db, "courses"), insertPayload);
		} else if (["strand", "program"].includes(actionData.type)) {
			const docRef = doc(db, "courses", actionData.id);
			await updateDoc(docRef, {
				[fieldName]: arrayUnion(name),
				cs_updatedAt: serverTimestamp(),
			});
		}

		Alert.showSuccess(
			`${
				actionData.type.charAt(0).toUpperCase() + actionData.type.slice(1)
			} added successfully!`
		);
	} catch (error) {
		console.error("Error adding course:", error);
		Alert.showDanger(`Failed to add ${actionData.type}.`);
	} finally {
		setBtnLoading(false);
	}
};
