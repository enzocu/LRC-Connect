// lib/sendEmail.js
import emailjs from "@emailjs/browser";

export const sendEmail = async (subject, name, message, email, Alert) => {
	const serviceID = process.env.NEXT_PUBLIC_SERVICE_ID;
	const templateID = process.env.NEXT_PUBLIC_TEMPLATE_ID;
	const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;

	const templateParams = {
		subject: subject,
		user_name: name,
		message: message,
		email: email,
	};

	try {
		await emailjs.send(serviceID, templateID, templateParams, publicKey);
	} catch (error) {
		Alert?.showDanger(error.message || "Failed to send email.");
		console.error("Email sending error:", error);
	}
};
