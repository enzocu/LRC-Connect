import { collection, addDoc, serverTimestamp, doc } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import { generateQrID } from "../../firebase/get/getGeneratedQR";

import { insertAudit } from "../insert/insertAudit";
export async function insertShelf(li_id, us_id, sh_name, setBtnloading, Alert) {
	try {
		setBtnloading(true);

		const sh_id = await generateQrID("shelves", "SHV");

		await addDoc(collection(db, "shelves"), {
			sh_qr: sh_id,
			sh_liID: li_id,
			sh_name: sh_name,
			sh_status: "Active",
			sh_createdAt: serverTimestamp(),
		});

		await insertAudit(
			li_id,
			us_id,
			"Create",
			`A new shelf '${sh_name}' was created with QR '${sh_id}'.`,
			Alert
		);

		Alert.showSuccess("Shelf inserted successfully!");
	} catch (error) {
		Alert.showDanger(error.message);
	} finally {
		setBtnloading(false);
	}
}
