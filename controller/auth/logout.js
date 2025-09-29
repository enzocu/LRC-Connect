import { signOut } from "firebase/auth";
import { auth } from "@/server/firebaseConfig";
import { EnterExit } from "@/controller/firebase/update/updateEnterExit";

export const handleLogout = async ({
	userDetails,
	setBtnLoading,
	alert,
	router,
	onClose,
}) => {
	try {
		setBtnLoading(true);
		localStorage.removeItem("userDetails");

		if (userDetails && userDetails?.us_level !== "USR-1") {
			await EnterExit(
				userDetails?.uid,
				userDetails?.us_liID,
				userDetails?.uid,
				null,
				"onApp",
				"Inactive",
				setBtnLoading,
				alert
			);
		}

		await signOut(auth);
		alert?.showSuccess?.("Logout successful!");
		router.push("/");
		onClose();
	} catch (error) {
		let errorMessage = "Logout failed. Please try again.";
		if (error.code === "auth/network-request-failed") {
			errorMessage =
				"Network error. Please check your connection and try again.";
		}

		alert?.showDanger?.(errorMessage);
	} finally {
		setBtnLoading(false);
	}
};
