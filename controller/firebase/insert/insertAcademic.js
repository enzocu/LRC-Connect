import { collection, addDoc, serverTimestamp, doc } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import { insertAudit } from "./insertAudit";

export async function insertProgram(
	li_id,
	us_id,
	pr_name,
	setBtnLoading,
	Alert
) {
	try {
		setBtnLoading(true);

		const liRef = doc(db, "library", li_id);

		await addDoc(collection(db, "program"), {
			pr_liID: liRef,
			pr_name: pr_name,
			pr_status: "Active",
			pr_createdAt: serverTimestamp(),
		});

		await insertAudit(
			liRef,
			us_id,
			"Create",
			`A new program "${pr_name}" was created.`,
			Alert
		);

		Alert.showSuccess("Program inserted successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
	} finally {
		setBtnLoading(false);
	}
}

// Insert School
export async function insertSchool(
	li_id,
	us_id,
	school_name,
	setBtnLoading,
	Alert
) {
	try {
		setBtnLoading(true);

		const liRef = doc(db, "library", li_id);

		await addDoc(collection(db, "school"), {
			sc_liID: liRef,
			sc_name: school_name,
			sc_status: "Active",
			sc_createdAt: serverTimestamp(),
		});

		await insertAudit(
			liRef,
			us_id,
			"Create",
			`A new school "${school_name}" was created.`,
			Alert
		);

		Alert.showSuccess("School inserted successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
	} finally {
		setBtnLoading(false);
	}
}
