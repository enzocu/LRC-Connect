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
} from "../../custom/customFunction";

export async function getAffectedList(
	transaction,
	setAffectedData,
	setAvailable,
	setLoading,
	Alert
) {
	setLoading(true);
	setAvailable(true);
	try {
		const trRef = collection(db, "transaction");

		const resourceDocRef = {
			Material: doc(db, "material", transaction.tr_resource.id),
			"Discussion Room": doc(db, "discussionrooms", transaction.tr_resource.id),
			Computer: doc(db, "computers", transaction.tr_resource.id),
		};

		const resourceFieldMap = {
			Material: "tr_maID",
			"Discussion Room": "tr_drID",
			Computer: "tr_coID",
		};

		let utilizedCount = 0;

		if (transaction.tr_type === "Material") {
			const utilizedQuery = query(
				trRef,
				where("tr_maID", "==", resourceDocRef["Material"]),
				where("tr_status", "==", "Utilized"),
				where("tr_type", "==", "Material"),
				where("tr_format", "==", transaction.tr_format)
			);

			const snapshot = await getCountFromServer(utilizedQuery);
			utilizedCount = snapshot.data().count;
		} else {
			const utilizedQuery = query(
				trRef,
				where(
					resourceFieldMap[transaction.tr_type],
					"==",
					resourceDocRef[transaction.tr_type]
				),
				where("tr_status", "==", "Utilized"),
				where("tr_type", "==", transaction.tr_type),
				where("tr_sessionEnd", ">=", transaction.tr_sessionStart)
			);

			const snapshot = await getCountFromServer(utilizedQuery);
			utilizedCount = snapshot.data().count;
		}

		let available = 0;
		if (transaction.tr_type === "Material") {
			if (transaction.tr_format == "Hard Copy") {
				available = transaction.tr_resource.ma_coverQty - utilizedCount;
			} else if (transaction.tr_format == "Soft Copy") {
				available = transaction.tr_resource.ma_softQty - utilizedCount;
			} else if (transaction.tr_format == "Audio Copy") {
				available = transaction.tr_resource.ma_audioQty - utilizedCount;
			}
		} else {
			available = utilizedCount >= 1 ? 0 : 1;
		}

		if (available === 1) {
			const reservedConditions = [
				where("tr_liID", "==", transaction.tr_liID),
				where("tr_status", "==", "Reserved"),
				where("tr_type", "==", transaction.tr_type),
				where(
					resourceFieldMap[transaction.tr_type],
					"==",
					resourceDocRef[transaction.tr_type]
				),
			];

			if (transaction.tr_type === "Material") {
				reservedConditions.push(
					where("tr_format", "==", transaction.tr_format)
				);
			}

			const reservedQuery = query(trRef, ...reservedConditions);
			const reservedSnap = await getDocs(reservedQuery);
			const allAffected = [];

			reservedSnap.forEach((docSnap) => {
				const data = docSnap.data();

				const shouldInclude =
					(transaction.tr_type === "Material" &&
						data.tr_useDate?.toDate() < transaction.tr_dateDue?.toDate()) ||
					(transaction.tr_type !== "Material" &&
						data.tr_sessionStart?.toDate() <
							transaction.tr_sessionEnd?.toDate() &&
						isSameDate(data.tr_sessionStart, transaction.tr_sessionEnd));

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

			const filteredAffected = allAffected.filter(
				(item) => item.id !== transaction.id
			);
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
