import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";

export const updateCourses = async (
	name,
	actionData,
	coursesData,
	setBtnLoading,
	Alert
) => {
	try {
		setBtnLoading(true);

		const docRef = doc(db, "courses", actionData.id);
		let updatePayload = {};

		if (["track", "institute"].includes(actionData.type)) {
			updatePayload["cs_title"] = name;
			updatePayload["cs_updatedAt"] = serverTimestamp();
		} else if (["strand", "program"].includes(actionData.type)) {
			const newData = [...coursesData];
			const index = actionData.type === "strand" ? 0 : 1;

			if (
				!newData[index] ||
				!newData[index].sub[actionData.parentIndex] ||
				!newData[index].sub[actionData.parentIndex]["cs_sub"]
			) {
				throw new Error("Invalid data path for updating course.");
			}

			newData[index].sub[actionData.parentIndex]["cs_sub"][
				actionData.itemIndex
			] = name;

			updatePayload["cs_sub"] =
				newData[index].sub[actionData.parentIndex]["cs_sub"];
			updatePayload["cs_updatedAt"] = serverTimestamp();
		}

		await updateDoc(docRef, updatePayload);

		Alert.showSuccess(
			`${
				actionData.type.charAt(0).toUpperCase() + actionData.type.slice(1)
			} updated successfully!`
		);
	} catch (error) {
		console.error("Error updating course:", error);
		Alert.showDanger(`Failed to update ${actionData.type}.`);
	} finally {
		setBtnLoading(false);
	}
};

export const deleteCourses = async (
	actionData,
	coursesData,
	setBtnLoading,
	Alert
) => {
	try {
		setBtnLoading(true);

		const docRef = doc(db, "courses", actionData.id);
		let updatePayload = {};

		if (["track", "institute"].includes(actionData.type)) {
			updatePayload["cs_status"] = "Inactive";
			updatePayload["cs_updatedAt"] = serverTimestamp();
		} else if (["strand", "program"].includes(actionData.type)) {
			const newData = [...coursesData];
			const index = actionData.type === "strand" ? 0 : 1;

			if (
				!newData[index] ||
				!newData[index].sub[actionData.parentIndex] ||
				!newData[index].sub[actionData.parentIndex]["cs_sub"]
			) {
				throw new Error("Invalid data path for deleting course.");
			}

			newData[index].sub[actionData.parentIndex]["cs_sub"].splice(
				actionData.itemIndex,
				1
			);

			updatePayload["cs_sub"] =
				newData[index].sub[actionData.parentIndex]["cs_sub"];
			updatePayload["cs_updatedAt"] = serverTimestamp();
		}

		await updateDoc(docRef, updatePayload);

		Alert.showSuccess(
			`${
				actionData.type.charAt(0).toUpperCase() + actionData.type.slice(1)
			} deleted successfully!`
		);
	} catch (error) {
		console.error("Error deleting course:", error);
		Alert.showDanger(`Failed to delete ${actionData.type}.`);
	} finally {
		setBtnLoading(false);
	}
};

export const transferCourses = async (
	destinationID,
	actionData,
	coursesData,
	setBtnLoading,
	Alert
) => {
	try {
		setBtnLoading(true);

		const senderRef = doc(db, "courses", actionData.id);
		const destinationRef = doc(db, "courses", destinationID);

		const senderPayload = {};
		const destinationPayload = {};

		const senderData = coursesData.find((c) => c.id === actionData.id);
		const destinationData = coursesData.find((c) => c.id === destinationID);

		if (["track", "institute"].includes(actionData.type)) {
			const itemsToTransfer = senderData?.["cs_sub"] || [];

			destinationPayload["cs_sub"] = [
				...(destinationData?.["cs_sub"] || []),
				...itemsToTransfer,
			];

			senderPayload["cs_status"] = "Inactive";
			senderPayload["cs_sub"] = [];
			senderPayload["cs_updatedAt"] = serverTimestamp();
			destinationPayload["cs_updatedAt"] = serverTimestamp();

			await Promise.all([
				updateDoc(destinationRef, destinationPayload),
				updateDoc(senderRef, senderPayload),
			]);

			Alert.showSuccess(
				`${
					actionData.type.charAt(0).toUpperCase() + actionData.type.slice(1)
				} transferred successfully!`
			);
		} else if (["strand", "program"].includes(actionData.type)) {
			const senderItems = [...(senderData?.["cs_sub"] || [])];
			const itemToTransfer = senderItems[actionData.itemIndex];

			if (!itemToTransfer)
				throw new Error(`No ${actionData.type} found to transfer.`);

			senderItems.splice(actionData.itemIndex, 1);
			senderPayload["cs_sub"] = senderItems;
			destinationPayload["cs_sub"] = [
				...(destinationData?.["cs_sub"] || []),
				itemToTransfer,
			];

			senderPayload["cs_updatedAt"] = serverTimestamp();
			destinationPayload["cs_updatedAt"] = serverTimestamp();

			await Promise.all([
				updateDoc(destinationRef, destinationPayload),
				updateDoc(senderRef, senderPayload),
			]);

			Alert.showSuccess(
				`${
					actionData.type.charAt(0).toUpperCase() + actionData.type.slice(1)
				} transferred successfully!`
			);
		} else {
			throw new Error("Invalid transfer type.");
		}
	} catch (error) {
		console.error("Error transferring course:", error);
		Alert.showDanger(`Failed to transfer ${actionData.type}.`);
	} finally {
		setBtnLoading(false);
	}
};
