import { updateDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import { markCancelled } from "./updateMarkCancelled";
import { getUserLevel } from "../../custom/getUserLevel";

import { insertAudit } from "../insert/insertAudit";

export async function changeUserStatus(
	li_id,
	us_id,
	us_name,
	us_level,
	us_library,
	modifiedId,
	status,
	reason,
	setBtnLoading,
	Alert
) {
	setBtnLoading(true);

	try {
		const userRef = doc(db, "users", us_id);

		if (["USR-5", "USR-6"].includes(us_level)) {
			await updateDoc(userRef, {
				us_status: status,
				us_remarks: reason,
				us_updatedAt: serverTimestamp(),
			});

			await markCancelled(
				us_id,
				us_name,
				"tr_usID",
				"users",
				modifiedId,
				[
					"This transaction has been cancelled due to the deactivation of the associated patron.",
				],
				Alert
			);
		} else if (["USR-2", "USR-3", "USR-4"].includes(us_level)) {
			const updatedLibrary = us_library.filter((lib) => {
				const libId = lib.us_liID?.id || lib.us_liID;
				return libId !== li_id;
			});

			await updateDoc(userRef, {
				us_library: updatedLibrary,
				us_remarks: reason,
				us_updatedAt: serverTimestamp(),
			});
		}

		await insertAudit(
			li_id,
			modifiedId,
			"Update",
			`User "${us_name}" status was changed to "${status}" with reason: "${reason}".`,
			Alert
		);

		Alert.showSuccess(
			`${us_name}'s library status changed to "${status}" and reason updated.`
		);
	} catch (error) {
		console.error("changeUserStatus Error:", error);
		Alert.showDanger(error.message);
	} finally {
		setBtnLoading(false);
	}
}

export async function transferUserLibrary(
	li_id,
	modifiedId,
	new_liID,
	us_id,
	us_name,
	us_level,
	us_type,
	us_library,
	setBtnLoading,
	Alert
) {
	setBtnLoading(true);

	try {
		const userRef = doc(db, "users", us_id);
		const userSnap = await getDoc(userRef);
		const newLibraryRef = doc(db, "library", new_liID);

		if (!userSnap.exists()) {
			throw new Error("User not found.");
		}

		if (["USR-5", "USR-6"].includes(us_level)) {
			await updateDoc(userRef, {
				us_liID: newLibraryRef,
			});

			await insertAudit(
				li_id,
				modifiedId,
				"Update",
				`User "${us_name}" was transferred to another library.`,
				Alert
			);
			Alert.showSuccess(
				`${us_name} was transferred to the new library successfully.`
			);
		} else if (["USR-2", "USR-3", "USR-4"].includes(us_level)) {
			const updatedLibrary = us_library.filter((lib) => {
				const libId = lib.us_liID?.id || lib.us_liID;
				return libId !== li_id;
			});

			const alreadyExists = updatedLibrary.some((lib) => {
				const libId = lib.us_liID?.id || lib.us_liID;
				return libId === new_liID;
			});

			if (alreadyExists) {
				await updateDoc(userRef, {
					us_library: updatedLibrary,
					us_updatedAt: serverTimestamp(),
				});

				await insertAudit(
					li_id,
					modifiedId,
					"Update",
					`User "${us_name}" was already linked to the new library. Old library connection removed.`,
					Alert
				);
				Alert.showInfo(
					`${us_name} is already active in the new library. Old link removed.`
				);
			} else {
				updatedLibrary.push({
					us_liID: newLibraryRef,
					us_level: us_level,
					us_type: us_type,
				});

				await updateDoc(userRef, {
					us_library: updatedLibrary,
					us_updatedAt: serverTimestamp(),
				});

				await insertAudit(
					li_id,
					modifiedId,
					"Update",
					`User "${us_name}" was transferred and added to another library.`,
					Alert
				);

				Alert.showSuccess(
					`${us_name} was transferred to the new library successfully.`
				);
			}
		} else {
			throw new Error("User level not supported for transfer.");
		}
	} catch (error) {
		console.error("transferUserLibrary Error:", error);
		Alert.showDanger(error.message);
	} finally {
		setBtnLoading(false);
	}
}

export async function changeUserType(
	li_id,
	modifiedId,
	us_id,
	us_name,
	us_level,
	us_type,
	us_library,
	setBtnLoading,
	Alert
) {
	setBtnLoading(true);

	try {
		const userRef = doc(db, "users", us_id);

		if (["USR-5", "USR-6"].includes(us_level)) {
			await updateDoc(userRef, {
				us_level: getUserLevel(us_type),
				us_type: us_type,
				us_updatedAt: serverTimestamp(),
			});
		} else if (["USR-2", "USR-3", "USR-4"].includes(us_level)) {
			const updatedLibrary = us_library.map((libEntry) => {
				const libId = libEntry.us_liID?.id || libEntry.us_liID;
				if (libId === li_id) {
					return {
						...libEntry,
						us_level: getUserLevel(us_type),
						us_type: us_type,
					};
				}
				return libEntry;
			});

			await updateDoc(userRef, {
				us_library: updatedLibrary,
				us_updatedAt: serverTimestamp(),
			});
		}

		await insertAudit(
			li_id,
			modifiedId,
			"Update",
			`User "${us_name}" was updated to user type "${us_type}".`,
			Alert
		);

		Alert.showSuccess(`${us_name}'s user type has been updated.`);
	} catch (error) {
		console.error("changeUserType Error:", error);
		Alert.showDanger(error.message);
	} finally {
		setBtnLoading(false);
	}
}
