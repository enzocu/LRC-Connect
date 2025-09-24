import { collection, query, where, getDocs, doc } from "firebase/firestore";
import { db } from "../../../../../server/firebaseConfig";

export async function getReportSummary(us_id, li_id, setIsFetch, Alert) {
	try {
		setIsFetch("Fetching report summary…");

		let constraints = [];
		if (us_id)
			constraints.push(where("re_usID", "==", doc(db, "users", us_id)));
		if (li_id) constraints.push(where("re_liID", "==", li_id));

		const reportQuery = query(collection(db, "report"), ...constraints);
		const reportSnap = await getDocs(reportQuery);

		const counts = {
			Active: 0,
			Resolved: 0,
			Waived: 0,
		};

		reportSnap.forEach((snap) => {
			const r = snap.data();
			const { re_status } = r;

			if (re_status === "Active") counts.Active++;
			if (re_status === "Resolved") counts.Resolved++;
			if (re_status === "Waived") counts.Waived++;
		});

		const totalReports = counts.Active + counts.Resolved + counts.Waived;

		let output = "📊 Report Summary\n\n";
		if (totalReports > 0) {
			output +=
				`Active: ${counts.Active}\n` +
				`Resolved: ${counts.Resolved}\n` +
				`Waived: ${counts.Waived}\n` +
				`--------------------------\n` +
				`Total Reports: ${totalReports}\n`;
		} else {
			output += "No report data found.";
		}

		return output;
	} catch (error) {
		console.error("getReportSummary Error:", error);
		Alert?.showDanger(error.message || "Failed to fetch report summary.");
		return "📊 Report Summary\n\nError fetching data.";
	} finally {
		setIsFetch(null);
	}
}
