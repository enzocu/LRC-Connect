import { getDoc, doc } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import {
	formatDateField,
	formatTimeField,
	formatDuration,
} from "../../custom/customFunction";

export async function getComputer(coID, setComputerData, setLoading, Alert) {
	setLoading(true);
	try {
		const computerRef = doc(db, "computers", coID);
		const docSnap = await getDoc(computerRef);

		if (!docSnap.exists()) {
			Alert.showDanger("Computer not found.");
			return;
		}

		const data = docSnap.data();

		const ComputerData = {
			...data,
			co_date: formatDateField(data.co_date),
			co_minDuration: formatTimeField(data.co_minDuration),
			co_maxDuration: formatTimeField(data.co_maxDuration),
			co_minDurationFormatted: formatDuration(data.co_minDuration),
			co_maxDurationFormatted: formatDuration(data.co_maxDuration),
			co_minDurationDate: data.co_minDuration,
			co_maxDurationDate: data.co_maxDuration,
			id: coID,
		};

		const liSnap = await getDoc(data.co_liID);

		if (!liSnap.exists()) {
			Alert.showDanger("Library not found.");
			return;
		}

		const liData = liSnap.data() || {};

		ComputerData.co_liStatus = liData.li_status ?? "";
		ComputerData.co_library = liData.li_name ?? "";
		ComputerData.co_school = liData.li_schoolname ?? "";
		ComputerData.co_operation = liData.li_resources?.computer ?? false;

		setComputerData(ComputerData);
	} catch (error) {
		Alert.showDanger(error?.message || "Something went wrong.");
	} finally {
		setLoading(false);
	}
}
