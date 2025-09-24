import { updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";

import { insertAudit } from "../insert/insertAudit";

export async function updateResources(
	li_id,
	us_id,
	libraryName,
	resourcesName,
	resources,
	setBtnLoading,
	Alert
) {
	try {
		setBtnLoading(true);

		await updateDoc(li_id, {
			li_resources: resources,
			li_updatedAt: serverTimestamp(),
		});

		await insertAudit(
			li_id,
			us_id,
			"Update",
			`Library resources for '${libraryName}' (${resourcesName}) were updated.`,
			Alert
		);

		Alert.showSuccess("Library resources updated successfully.");
	} catch (error) {
		console.error("Error updating library limits:", error);
		Alert.showDanger(error.message || "Something went wrong!");
	} finally {
		setBtnLoading(false);
	}
}

export async function updateOperating(
	li_id,
	us_id,
	libraryName,
	operating,
	setBtnLoading,
	Alert
) {
	try {
		setBtnLoading(true);

		// Convert string times to Timestamp
		const today = new Date();
		const convertedOperating = {};

		for (const day in operating) {
			const { enabled, open, close } = operating[day];

			const [openHour, openMinute] = open.split(":").map(Number);
			const [closeHour, closeMinute] = close.split(":").map(Number);

			const openDate = new Date(
				today.getFullYear(),
				today.getMonth(),
				today.getDate(),
				openHour,
				openMinute
			);

			const closeDate = new Date(
				today.getFullYear(),
				today.getMonth(),
				today.getDate(),
				closeHour,
				closeMinute
			);

			convertedOperating[day] = {
				enabled,
				open: Timestamp.fromDate(openDate),
				close: Timestamp.fromDate(closeDate),
			};
		}

		await updateDoc(li_id, {
			li_operating: convertedOperating,
			li_updatedAt: serverTimestamp(),
		});

		await insertAudit(
			li_id,
			us_id,
			"Update",
			`Library operating hours for '${libraryName}' were updated.`,
			Alert
		);

		Alert.showSuccess("Library operating hours updated successfully.");
	} catch (error) {
		console.error("Error updating library operating hours:", error);
		Alert.showDanger(error.message || "Something went wrong!");
	} finally {
		setBtnLoading(false);
	}
}
