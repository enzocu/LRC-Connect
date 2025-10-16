import {
	collection,
	query,
	where,
	getCountFromServer,
	getDocs,
	doc,
} from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import {
	formatDate,
	formatTime,
	isSameDate,
	convertDateToTimestamp,
	combineDateAndTimeToTimestamp,
} from "../../custom/customFunction";

export async function getAffectedList(
	id,
	tr_liID,
	resourceType,
	resourceId,
	tr_format,
	tr_useDate,
	tr_dateDue,
	tr_sessionStart,
	tr_sessionEnd,
	resourceData,
	setAffectedData,
	setAvailable,
	setLoading,
	Alert
) {
	setLoading(true);
	setAvailable(true);
	try {
		const convertedDueDate = convertDateToTimestamp(tr_dateDue);
		const convertedStart = combineDateAndTimeToTimestamp(
			tr_useDate,
			tr_sessionStart
		);
		const convertedEnd = combineDateAndTimeToTimestamp(
			tr_useDate,
			tr_sessionEnd
		);
		const trRef = collection(db, "transaction");

		const resourceDocRef = {
			Material: doc(db, "material", resourceId),
			"Discussion Room": doc(db, "discussionrooms", resourceId),
			Computer: doc(db, "computers", resourceId),
		};
		const resourceFieldMap = {
			Material: "tr_maID",
			"Discussion Room": "tr_drID",
			Computer: "tr_coID",
		};

		let utilizedCount = 0;
		if (resourceType === "Material") {
			const utilizedQuery = query(
				trRef,
				where("tr_maID", "==", resourceDocRef["Material"]),
				where("tr_status", "==", "Utilized"),
				where("tr_type", "==", "Material"),
				where("tr_format", "==", tr_format)
			);
			const snapshot = await getCountFromServer(utilizedQuery);
			utilizedCount = snapshot.data().count;
		} else {
			const utilizedQuery = query(
				trRef,
				where(
					resourceFieldMap[resourceType],
					"==",
					resourceDocRef[resourceType]
				),
				where("tr_status", "==", "Utilized"),
				where("tr_type", "==", resourceType),
				where("tr_sessionEnd", "<=", convertedStart)
			);
			const snapshot = await getCountFromServer(utilizedQuery);
			utilizedCount = snapshot.data().count;
		}

		let available = 0;
		if (resourceType === "Material") {
			if (tr_format == "Hard Copy") {
				available = resourceData.ma_coverQty - utilizedCount;
			} else if (tr_format == "Soft Copy") {
				available = resourceData.ma_softQty - utilizedCount;
			} else if (tr_format == "Audio Copy") {
				available = resourceData.ma_audioQty - utilizedCount;
			}
		} else {
			available = utilizedCount >= 1 ? 0 : 1;
		}
		if (available === 1) {
			const reservedConditions = [
				where("tr_liID", "==", tr_liID),
				where("tr_status", "==", "Reserved"),
				where("tr_type", "==", resourceType),
				where(
					resourceFieldMap[resourceType],
					"==",
					resourceDocRef[resourceType]
				),
			];

			if (resourceType === "Material") {
				reservedConditions.push(where("tr_format", "==", tr_format));
			}

			const reservedQuery = query(trRef, ...reservedConditions);
			const reservedSnap = await getDocs(reservedQuery);
			const allAffected = [];
			reservedSnap.forEach((docSnap) => {
				const data = docSnap.data();
				const shouldInclude =
					(resourceType === "Material" &&
						data.tr_useDate?.toDate() <= convertedDueDate?.toDate()) ||
					(resourceType !== "Material" &&
						data.tr_sessionStart?.toDate() < convertedEnd?.toDate() &&
						isSameDate(data.tr_sessionStart, convertedEnd));
				if (shouldInclude) {
					allAffected.push({
						id: docSnap.id,
						tr_type: data.tr_type,
						tr_qr: data.tr_qr || "",
						tr_usID: data.tr_usID,
						tr_date: formatDate(data.tr_useDate),
						tr_dateDue: formatDate(data.tr_dateDue) || "s",
						tr_sessionStart: formatTime(data.tr_sessionStart),
						tr_sessionEnd: formatTime(data.tr_sessionEnd),
						tr_createdAt: formatDate(data.tr_createdAt),
					});
				}
			});

			const filteredAffected = allAffected.filter((item) => item.id !== id);
			setAffectedData(filteredAffected);
			if (filteredAffected.length > 0) {
				Alert.showDanger(
					`⚠️ ${filteredAffected.length} affected reservation(s) detected.`
				);
			}
		} else {
			if (available <= 0) {
				setAvailable(false);
				Alert.showDanger(
					"⚠️ No available resource for now. Please wait for availability or cancel your reservation."
				);
			}

			setAffectedData([]);
		}
	} catch (error) {
		Alert.showDanger(error.message);
		console.log(error.message);
	} finally {
		setLoading(false);
	}
}
