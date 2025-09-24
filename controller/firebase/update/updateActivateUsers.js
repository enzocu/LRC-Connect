import { updateDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";

import { insertAudit } from "../insert/insertAudit";

export async function activateUsers(
	li_id,
	us_id,
	selectedAccounts,
	setBtnLoading,
	Alert
) {
	if (!selectedAccounts || selectedAccounts.length === 0) return;

	setBtnLoading(true);

	try {
		let activatedNames = [];
		for (const usData of selectedAccounts) {
			const userRef = doc(db, "users", usData.us_id);

			const libRef = doc(db, "library", li_id);

			if (["USR-5", "USR-6"].includes(usData.us_level)) {
				await updateDoc(userRef, {
					us_status: "Active",
					us_liID: libRef,
					us_level: usData.us_level,
					us_type: usData.us_type,
					us_updatedAt: serverTimestamp(),
					us_remarks: [],
				});

				activatedNames.push(usData.us_name);
			} else {
				const userSnap = await getDoc(userRef);
				if (!userSnap.exists()) continue;
				const user = userSnap.data();
				const oldLibraries = user.us_library || [];

				const alreadyExists = oldLibraries.some((lib) => {
					const libId = lib.us_liID?.id || lib.us_liID;
					return libId === li_id;
				});

				if (!alreadyExists) {
					const updatedLibrary = [
						...oldLibraries,
						{
							us_liID: libRef,
							us_level: usData.us_level,
							us_type: usData.us_type,
						},
					];

					await updateDoc(userRef, {
						us_library: updatedLibrary,
						us_updatedAt: serverTimestamp(),
						us_remarks: [],
					});

					activatedNames.push(usData.us_name);
				}
			}
		}
		if (activatedNames.length > 0) {
			await insertAudit(
				li_id,
				us_id,
				"Update",
				`Activated users: ${activatedNames.join(", ")}.`,
				Alert
			);

			Alert.showSuccess(
				`Activated the following users: ${activatedNames.join(", ")}`
			);
		} else {
			Alert.showInfo(
				"No new users were activated because they are already active."
			);
		}
	} catch (error) {
		console.error("activateUsers Error:", error);
		Alert.showDanger(error.message);
	} finally {
		setBtnLoading(false);
	}
}
