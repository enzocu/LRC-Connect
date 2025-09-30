import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import { insertAudit } from "../insert/insertAudit";

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export const updateDocumentName = async (
	docId,
	li_id,
	us_id,
	colName,
	prefix,
	newName,
	setBtnLoading,
	Alert
) => {
	try {
		setBtnLoading(true);

		const docRef = doc(db, colName, docId);
		const nameField = `${prefix}name`;

		await updateDoc(docRef, {
			[nameField]: newName.trim(),
			[`${prefix}updatedAt`]: serverTimestamp(),
		});

		await insertAudit(
			li_id,
			us_id,
			"Update",
			`${capitalize(colName)} name was updated to '${newName.trim()}'.`,
			Alert
		);

		Alert.showSuccess(`${capitalize(colName)} name updated successfully!`);
	} catch (error) {
		console.error(`Error updating ${colName} name:`, error);
		Alert.showDanger(`Failed to update ${colName} name.`);
	} finally {
		setBtnLoading(false);
	}
};

export const updateDocumentStatus = async (
	docId,
	li_id,
	us_id,
	colName,
	prefix,
	newStatus,
	setBtnLoading,
	Alert
) => {
	try {
		setBtnLoading(true);

		const docRef = doc(db, colName, docId);
		const statusField = `${prefix}status`;

		await updateDoc(docRef, {
			[statusField]: newStatus,
			[`${prefix}updatedAt`]: serverTimestamp(),
		});

		await insertAudit(
			li_id,
			us_id,
			"Update",
			`${capitalize(colName)} status was changed to '${newStatus}'.`,
			Alert
		);

		Alert.showSuccess(`${capitalize(colName)} status updated successfully!`);
	} catch (error) {
		console.error(`Error updating ${colName} status:`, error);
		Alert.showDanger(`Failed to update ${colName} status.`);
	} finally {
		setBtnLoading(false);
	}
};
