"use client";

import { createContext, useContext, useState } from "react";

const AlertContext = createContext(undefined);

export const useAlert = () => {
	const context = useContext(AlertContext);
	if (!context) {
		throw new Error("useAlert must be used within an AlertProvider");
	}
	return context;
};

export const AlertProvider = ({ children }) => {
	const [alerts, setAlerts] = useState([]);

	const showAlert = (type, message, autoClose = true, duration = 4000) => {
		const id = Math.random().toString(36).substr(2, 9);
		const newAlert = {
			id,
			type,
			message,
			autoClose,
			duration,
		};

		setAlerts((prev) => [...prev, newAlert]);

		if (autoClose) {
			setTimeout(() => {
				hideAlert(id);
			}, duration);
		}
	};

	const hideAlert = (id) => {
		setAlerts((prev) => prev.filter((alert) => alert.id !== id));
	};

	const clearAllAlerts = () => {
		setAlerts([]);
	};

	const value = {
		alerts,
		showAlert,
		hideAlert,
		clearAllAlerts,
	};

	return (
		<AlertContext.Provider value={value}>{children}</AlertContext.Provider>
	);
};

export const useAlertActions = () => {
	const { showAlert } = useAlert();

	return {
		showSuccess: (message, autoClose, duration) =>
			showAlert("success", message, autoClose, duration),

		showWarning: (message, autoClose, duration) =>
			showAlert("warning", message, autoClose, duration),

		showDanger: (message, autoClose, duration) =>
			showAlert("danger", message, autoClose, duration),

		showInfo: (message, autoClose, duration) =>
			showAlert("info", message, autoClose, duration),
	};
};
