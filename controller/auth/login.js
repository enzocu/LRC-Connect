"use client";

import {
	signInWithEmailAndPassword,
	sendEmailVerification,
} from "firebase/auth";
import { auth } from "../../server/firebaseConfig";

export const handleLogin = async (
	formData,
	setBtnLoading,
	alert,
	setHasTriggered
) => {
	const { email, password } = formData;

	try {
		setBtnLoading(true);

		const userCredential = await signInWithEmailAndPassword(
			auth,
			email,
			password
		);
		const user = userCredential.user;

		if (user.emailVerified) {
			alert.showSuccess(`Redirecting...`);
			setHasTriggered(true);
		} else {
			await sendEmailVerification(user);
			alert.showInfo(
				"Your email is not verified. We've sent you a verification email."
			);
		}
	} catch (error) {
		console.error("Login error:", error);

		let errorMessage = "Login failed. Please try again.";

		switch (error.code) {
			case "auth/email-already-exists":
				errorMessage =
					"The provided email is already associated with an existing user. Ensure each user has a unique email address.";
				break;
			case "auth/id-token-expired":
				errorMessage =
					"Your session has expired. Please log in again to continue.";
				break;
			case "auth/invalid-email":
				errorMessage =
					"The email address provided is not valid. Ensure it follows the correct email format.";
				break;
			case "auth/invalid-password":
				errorMessage = "The password must be at least six characters long.";
				break;
			case "auth/user-not-found":
				errorMessage =
					"No user record exists for the provided credentials. Verify your login details.";
				break;
			case "auth/wrong-password":
				errorMessage = "Incorrect password. Please try again.";
				break;
			case "auth/too-many-requests":
				errorMessage =
					"Too many requests have been made from this device. Please wait a few minutes before trying again.";
				break;
			case "auth/invalid-credential":
				errorMessage =
					"The credentials provided are invalid or expired. Please reauthenticate.";
				break;
			case "auth/operation-not-allowed":
				errorMessage =
					"The requested sign-in method is disabled. Please contact support or enable it in the Firebase Console.";
				break;
			case "auth/phone-number-already-exists":
				errorMessage =
					"The provided phone number is already in use by another user. Ensure phone numbers are unique.";
				break;
			case "auth/unauthorized-continue-uri":
				errorMessage =
					"The domain of the continue URL is not whitelisted. Add this domain to the Firebase Console.";
				break;
			case "auth/user-disabled":
				errorMessage =
					"This account has been disabled. Contact support for assistance.";
				break;
			default:
				errorMessage = error.message;
		}

		alert.showWarning(errorMessage);
	} finally {
		setBtnLoading(false);
	}
};
