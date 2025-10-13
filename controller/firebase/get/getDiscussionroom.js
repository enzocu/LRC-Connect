import { getDoc, doc } from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import {
	formatDate,
	formatTimeField,
	formatDuration,
} from "../../custom/customFunction";

export async function getDiscussionroom(
	drID,
	setDiscussionroomData,
	setLoading,
	Alert
) {
	setLoading(true);
	try {
		const drRef = doc(db, "discussionrooms", drID);
		const docSnap = await getDoc(drRef);

		if (!docSnap.exists()) {
			Alert.showDanger("Discussion room not found.");
			return;
		}

		const data = docSnap.data();

		const DiscussionData = {
			...data,
			dr_minDuration: formatTimeField(data.dr_minDuration),
			dr_maxDuration: formatTimeField(data.dr_maxDuration),
			dr_minDurationFormatted: formatDuration(data.dr_minDuration),
			dr_maxDurationFormatted: formatDuration(data.dr_maxDuration),
			dr_minDurationDate: data.dr_minDuration,
			dr_maxDurationDate: data.dr_maxDuration,
			dr_createdAtDATE: formatDate(data.dr_createdAt),
			id: drID,
		};

		const liSnap = await getDoc(data.dr_liID);

		if (!liSnap.exists()) {
			Alert.showDanger("Library not found.");
			return;
		}

		const liData = liSnap.data() || {};

		DiscussionData.dr_liStatus = liData.li_status ?? "";
		DiscussionData.dr_library = liData.li_name ?? "";
		DiscussionData.dr_school = liData.li_schoolname ?? "";
		DiscussionData.dr_operation = liData.li_resources?.discussion ?? false;

		setDiscussionroomData(DiscussionData);
	} catch (error) {
		Alert.showDanger(error.message);
	} finally {
		setLoading(false);
	}
}
