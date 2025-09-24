import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";

export async function generateQrID(collectionName, prefix) {
	const snapshot = await getCountFromServer(collection(db, collectionName));
	const count = snapshot.data().count;

	const year = new Date().getFullYear();
	const generatedID = `${prefix}-${year}-${count}`;

	return generatedID;
}
