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
		alert.showDanger(`Login failed: ${error.message}`);
	} finally {
		setBtnLoading(false);
	}
};
