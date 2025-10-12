import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../server/firebaseConfig";
import { insertAudit } from "../firebase/insert/insertAudit";

export const ResetPassword = async (
	userData,
	li_id,
	us_id,
	setBtnLoading,
	Alert
) => {
	if (!userData?.us_email) {
		Alert?.showDanger?.("User email not found.");
		return;
	}

	try {
		setBtnLoading(true);

		await sendPasswordResetEmail(auth, userData.us_email);

		await insertAudit(
			li_id,
			us_id,
			"Reset Password",
			`A password reset email has been successfully sent to ${userData.us_name} at ${userData.us_email}`,
			Alert
		);

		Alert?.showSuccess?.(`Password reset email sent to ${userData.us_email}`);
	} catch (error) {
		console.error(error);
		Alert?.showDanger?.(error.message || "Failed to send reset email.");
	} finally {
		setBtnLoading(false);
	}
};
