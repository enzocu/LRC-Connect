import {
	getCountFromServer,
	query,
	where,
	collection,
	onSnapshot,
	orderBy,
} from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import { formatDateTime } from "../../custom/customFunction";

export async function getDashboardStats(setStatistics, setLoading, Alert) {
	try {
		setLoading(true);

		// 🔹 Collection references
		const usersRef = collection(db, "users");
		const libraryRef = collection(db, "library");
		const auditRef = collection(db, "audittrail");

		// 🔹 Define queries for users and libraries
		const qActiveUsers = query(usersRef, where("us_status", "==", "Active"));
		const qInactiveUsers = query(
			usersRef,
			where("us_status", "==", "Inactive")
		);
		const qActiveLibs = query(libraryRef, where("li_status", "==", "Active"));
		const qInactiveLibs = query(
			libraryRef,
			where("li_status", "==", "Inactive")
		);

		// 🔹 Parallel count fetch
		const [activeUsers, inactiveUsers, activeLibs, inactiveLibs] =
			await Promise.all([
				getCountFromServer(qActiveUsers),
				getCountFromServer(qInactiveUsers),
				getCountFromServer(qActiveLibs),
				getCountFromServer(qInactiveLibs),
			]);

		const now = new Date();
		const startOfDay = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
			0,
			0,
			0,
			0
		);

		const qAudit = query(
			auditRef,
			where("au_createdAt", ">=", startOfDay),
			orderBy("au_createdAt", "desc")
		);

		const unsubscribe = onSnapshot(
			qAudit,
			(snapshot) => {
				const todayCount = snapshot.size;
				let lastDoc = null;

				snapshot.forEach((doc, index) => {
					if (index === 0) lastDoc = doc.data();
				});

				setStatistics({
					activeLibraries: activeLibs.data().count,
					inactiveLibraries: inactiveLibs.data().count,
					activeAccounts: activeUsers.data().count,
					inactiveAccounts: inactiveUsers.data().count,
					todayAuditTrails: todayCount,
					lastUpdate: lastDoc
						? formatDateTime(lastDoc.au_createdAt.toDate())
						: formatDateTime(new Date()),
				});

				setLoading(false);
			},
			(error) => {
				console.error("Realtime audit error:", error);
				setLoading(false);
				Alert.showDanger(error.message);
			}
		);

		return unsubscribe;
	} catch (error) {
		console.error("Error fetching dashboard stats:", error);
		setLoading(false);
		Alert.showDanger(error.message);
	}
}
