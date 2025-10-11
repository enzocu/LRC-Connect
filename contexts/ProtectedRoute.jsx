"use client";

import { useUserAuth } from "../contexts/UserContextAuth";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAlertActions } from "../contexts/AlertContext";

export default function ProtectedRoute({ allowedRoles = [], children }) {
	const { user, userDetails, loading } = useUserAuth();
	const Alert = useAlertActions();
	const router = useRouter();
	const hasChecked = useRef(false);

	useEffect(() => {
		if (loading || hasChecked.current) return;

		hasChecked.current = true;

		if (!user || !userDetails) {
			Alert.showWarning("You must be logged in to access this page.");
			router.push("/");
			return;
		}

		if (
			allowedRoles.length > 0 &&
			!allowedRoles.includes(userDetails?.us_level)
		) {
			Alert.showDanger("You do not have permission to access this page.");
			router.push("/");
			return;
		}
	}, [user, userDetails, loading, router, allowedRoles, Alert]);

	return <>{children}</>;
}
