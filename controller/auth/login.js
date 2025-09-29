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
			case "auth/invalid-email":
				errorMessage = "Invalid email address. Please check and try again.";
				break;
			case "auth/user-disabled":
				errorMessage =
					"This account has been disabled. Contact support for assistance.";
				break;
			case "auth/user-not-found":
				errorMessage = "No account found with this email.";
				break;
			case "auth/wrong-password":
				errorMessage = "Incorrect password. Please try again.";
				break;
			case "auth/too-many-requests":
				errorMessage =
					"Too many failed attempts. Please wait a few minutes before trying again.";
				break;
			default:
				errorMessage = error.message;
		}

		alert.showWarning(errorMessage);
	} finally {
		setBtnLoading(false);
	}
};
