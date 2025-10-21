"use client";

import {
	collection,
	getDocs,
	query,
	where,
	doc,
	updateDoc,
	addDoc,
	serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import { generateQrID } from "../../firebase/get/getGeneratedQR";
import {
	convertYearToTimestamp,
	toSafeString,
} from "../../custom/customFunction";
import { insertAudit } from "../insert/insertAudit";

export async function insertMaterialExcel(
	li_id,
	modifiedBy,
	selectedMaterials,
	materialType,
	category,
	shelf,
	acquisitionType,
	donor,
	pricePerItem,
	setBtnloading,
	Alert
) {
	setBtnloading(true);

	try {
		let totalInsertedCount = 0;
		let totalUpdateCount = 0;
		let totalSkippedCount = 0;

		for (const mat of selectedMaterials) {
			const existsDoc = await checkMaterialExistence(mat.mt_callNo);

			const holdings = [];
			if (mat.mt_accessionNo) {
				const accList = String(mat.mt_accessionNo)
					.split(",")
					.map((a) => a.trim())
					.filter(Boolean);

				accList.forEach((acc, index) => {
					holdings.push({
						ho_access: acc,
						ho_copy: String(index + 1),
						ho_volume: String(index + 1),
					});
				});
			}

			const materialDocData = {
				ma_qr: await generateQrID("material", "MTL"),
				ma_liID: li_id,
				ma_mtID: doc(db, "materialType", materialType),
				ma_caID: doc(db, "category", category),
				ma_shID: doc(db, "shelves", shelf),
				ma_doID: doc(db, "donors", donor),
				ma_acquisitionType: acquisitionType || "Purchased",
				ma_pricePerItem: parseFloat(pricePerItem) || 0,
				ma_status: "Active",

				ma_libraryCall: toSafeString(mat.mt_callNo),
				ma_title: toSafeString(mat.mt_title),
				ma_author: toSafeString(mat.mt_author),
				ma_publication: toSafeString(mat.mt_place),
				ma_publisher: toSafeString(mat.mt_publisher),
				ma_copyright: mat.mt_copyright
					? convertYearToTimestamp(mat.mt_copyright)
					: null,
				ma_pages: toSafeString(mat.mt_pages),
				ma_size: toSafeString(mat.mt_size),
				ma_isbn: toSafeString(mat.mt_isbn),
				ma_language: toSafeString(mat.mt_language),
				ma_description: toSafeString(mat.mt_description),

				ma_subjects: [mat.mt_subject1, mat.mt_subject2].filter(Boolean),
				ma_holdings: holdings,

				ma_coverURL: null,
				ma_coverQty: holdings.length,
				ma_softURL: null,
				ma_softQty: 0,
				ma_audioURL: null,
				ma_audioQty: 0,

				ma_createdAt: serverTimestamp(),
				ma_updatedAt: serverTimestamp(),
			};

			if (!existsDoc) {
				await addDoc(collection(db, "material"), materialDocData);
				totalInsertedCount++;
			} else {
				const docRef = doc(db, "material", existsDoc.id);
				const existing = existsDoc.data();

				const sameLibrary = existing.ma_liID?.id === li_id.id;
				const isInactive = existing.ma_status === "Inactive";

				if (sameLibrary || isInactive) {
					await updateDoc(docRef, {
						...materialDocData,
						...(isInactive && {
							ma_liID: li_id,
						}),
						ma_updatedAt: serverTimestamp(),
					});
					totalUpdateCount++;
				} else {
					totalSkippedCount++;
				}
			}
		}

		if (totalInsertedCount > 0 || totalUpdateCount > 0) {
			await insertAudit(
				li_id,
				modifiedBy,
				"Create",
				`Bulk material upload: ${totalInsertedCount} inserted, ${totalUpdateCount} updated.`,
				Alert
			);

			Alert.showSuccess(
				`📚 ${totalInsertedCount} inserted | 🔄 ${totalUpdateCount} updated`
			);
		}
		if (totalSkippedCount > 0) {
			Alert.showWarning(
				`${totalSkippedCount} material(s) skipped: already active in another library.`
			);
		}
	} catch (error) {
		console.error("Insert Material Error:", error);
		Alert.showDanger(error.message);
	} finally {
		setBtnloading(false);
	}
}

const checkMaterialExistence = async (callNo) => {
	const q = query(
		collection(db, "material"),
		where("ma_libraryCall", "==", callNo)
	);
	const snapshot = await getDocs(q);
	if (!snapshot.empty) return snapshot.docs[0];
	return null;
};
