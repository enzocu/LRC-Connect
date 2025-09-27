import {
	collection,
	query,
	where,
	orderBy,
	onSnapshot,
	doc,
	deleteDoc,
} from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import {
	getScanner,
	resetScannerLock,
} from "@/controller/firebase/get/getScanner";

export function getScannerCode(
	isSuperadmin = false,
	li_id,
	us_id,
	router,
	Alert
) {
	try {
		const faRef = collection(db, "scanner");

		const scanner = [where("sc_usID", "==", doc(db, "users", us_id))];

		if (!isSuperadmin) {
			scanner.push(where("sc_liID", "==", li_id));
		}

		const finalQuery = query(
			faRef,
			...scanner,
			orderBy("sc_createdAt", "desc")
		);

		const unsubscribe = onSnapshot(
			finalQuery,
			async (snapshot) => {
				if (!snapshot.empty) {
					const firstDocSnap = snapshot.docs[0];
					const firstData = firstDocSnap.data();

					for (const docSnap of snapshot.docs) {
						try {
							await deleteDoc(docSnap.ref);
						} catch (err) {
							console.error("Failed to delete scanner doc:", err);
						}
					}

					resetScannerLock();
					getScanner(firstData.sc_id || null, firstData.sc_code, router, Alert);
				}
			},
			(error) => {
				Alert.showDanger(error.message);
				console.error(error.message);
			}
		);

		return unsubscribe;
	} catch (error) {
		Alert.showDanger(error.message);
		console.error(error.message);
		return () => {};
	}
}
