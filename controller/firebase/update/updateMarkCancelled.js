import {
	doc,
	updateDoc,
	serverTimestamp,
	getDocs,
	query,
	where,
	collection as colRef,
	getDoc,
} from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import { insertAudit } from "../insert/insertAudit";

export async function markCancelled(
	id,
	name,
	refIDFieldName,
	targetCollection,
	modifiedId,
	reason = ["This transaction has been cancelled due to a deactivation."],
	Alert
) {
	try {
		const q = query(
			colRef(db, "transaction"),
			where(refIDFieldName, "==", doc(db, targetCollection, id)),
			where("tr_status", "in", ["Reserved", "Utilized"])
		);

		const querySnapshot = await getDocs(q);

		let cancelledCount = 0;
		let utilizedCount = 0;

		for (const docSnap of querySnapshot.docs) {
			const docRef = doc(db, "transaction", docSnap.id);
			const targetTrSnap = await getDoc(docRef);
			const targetData = targetTrSnap.data();

			if (targetData.tr_status === "Reserved") {
				await updateDoc(docRef, {
					tr_status: "Cancelled",
					tr_remarks: reason,
					tr_updatedAt: serverTimestamp(),
					tr_modifiedBy: doc(db, "users", modifiedId),
				});

				cancelledCount++;

				await insertAudit(
					targetData.tr_liID,
					modifiedId,
					"Cancelled",
					`⚠️ ${name} has ${cancelledCount} cancelled reservation(s) and ${utilizedCount} utilized transaction(s). Reason: ${reason.join(
						", "
					)}.`,
					Alert
				);
			} else if (targetData.tr_status === "Utilized") {
				utilizedCount++;
			}
		}

		if (cancelledCount > 0 || utilizedCount > 0) {
			Alert.showWarning(
				`⚠️ "${name}" has ${cancelledCount} cancelled reservation(s) and ${utilizedCount} utilized transaction(s) (untouched).`
			);
		}
	} catch (error) {
		console.error("Error in markCancelled:", error);
		Alert.showDanger(error.message);
	}
}
