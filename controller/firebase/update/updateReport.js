import { db } from "../../../server/firebaseConfig";
import { doc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { sendEmail } from "../../custom/sendEmail";
import { formatDate } from "../../custom/customFunction";
import { insertAudit } from "../insert/insertAudit";

export const updateReportAction = async (
	re_id,
	li_id,
	us_id,
	actionText,
	deadline,
	setBtnLoading,
	Alert
) => {
	try {
		setBtnLoading(true);

		const reportRef = doc(db, "report", re_id);
		await updateDoc(reportRef, {
			re_instruction: actionText,
			re_deadline: Timestamp.fromDate(new Date(deadline)),
			re_updatedAt: serverTimestamp(),
		});

		await insertAudit(
			li_id,
			us_id,
			"Update",
			`Report (ID: '${re_id}') instruction was set to '${actionText}' with deadline '${new Date(
				deadline
			).toLocaleDateString("en-US", {
				month: "short",
				day: "2-digit",
				year: "numeric",
			})}'.`,
			Alert
		);
		Alert.showSuccess("Report action updated successfully.");
	} catch (error) {
		console.error("Error updating report action:", error);
		Alert.showError("Failed to update report action.");
	} finally {
		setBtnLoading(false);
	}
};

export const updateReportStatus = async (
	li_id,
	us_id,
	status,
	reportData,
	reportIDs,
	setBtnLoading,
	Alert
) => {
	try {
		setBtnLoading(true);

		const trQr = [];

		for (const id of reportIDs) {
			const reportRef = doc(db, "report", id);
			await updateDoc(reportRef, {
				re_status: status,
				re_dateSettled: serverTimestamp(),
				re_updatedAt: serverTimestamp(),
				re_modifiedBy: doc(db, "users", us_id),
			});

			const reportItem = reportData.find((r) => r.id === id);
			if (reportItem) {
				trQr.push(reportItem.tr_qr);
			}
		}

		const { us_name, us_email } = reportData[0].tr_patron;

		await insertAudit(
			li_id,
			us_id,
			"Update",
			`Reports with transaction QR(s) (${trQr.join(
				", "
			)}) were marked as '${status}'.`,
			Alert
		);

		await sendEmail(
			`Report Marked as ${status}`,
			us_name,
			`Hi ${us_name}, your report(s) with transaction QR: (${trQr.join(
				", "
			)}) have been marked as ${status}.`,
			us_email,
			Alert
		);

		Alert.showSuccess("Reports updated and email sent successfully.");
	} catch (error) {
		console.error("Error updating report status:", error);
		Alert.showError("Failed to update report status.");
	} finally {
		setBtnLoading(false);
	}
};
