import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";

export function getLibrary(
	li_id,
	setLibraryData,
	setLoading,
	Alert,
	setResources = null,
	setOperating = null
) {
	setLoading(true);

	try {
		const libraryRef =
			typeof li_id === "object" && li_id.id ? li_id : doc(db, "library", li_id);

		const unsubscribe = onSnapshot(
			libraryRef,
			(docSnap) => {
				if (!docSnap.exists()) {
					Alert.showDanger("Library not found.");
					setLibraryData(null);
					setLoading(false);
					return;
				}

				const data = docSnap.data();
				setLibraryData({
					...data,
					id: li_id,
				});

				if (
					setResources &&
					data.li_resources !== null &&
					data.li_resources !== undefined
				) {
					setResources(data.li_resources);
				}

				if (
					setOperating &&
					data.li_operating !== null &&
					data.li_operating !== undefined
				) {
					const dayOrder = [
						"oh_monday",
						"oh_tuesday",
						"oh_wednesday",
						"oh_thursday",
						"oh_friday",
						"oh_saturday",
						"oh_sunday",
					];

					const convertedOperating = {};

					dayOrder.forEach((dayKey) => {
						const dayData = data.li_operating[dayKey];

						convertedOperating[dayKey] = {
							enabled: dayData?.enabled ?? false,
							open: dayData?.open?.toDate
								? dayData.open.toDate().toTimeString().slice(0, 5)
								: "00:00",
							close: dayData?.close?.toDate
								? dayData.close.toDate().toTimeString().slice(0, 5)
								: "00:00",
						};
					});

					setOperating(convertedOperating);
				}

				setLoading(false);
			},
			(error) => {
				Alert.showDanger(error.message);
				setLoading(false);
			}
		);

		return unsubscribe;
	} catch (error) {
		Alert.showDanger(error.message);
		setLoading(false);
	}
}
