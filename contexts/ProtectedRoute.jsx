"use client";

import { useUserAuth } from "../contexts/UserContextAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ allowedRoles = [], children }) {
	const { user, userDetails, loading } = useUserAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading) {
			if (!user || !userDetails) {
				router.push("/");

				return;
			}

			if (
				allowedRoles.length > 0 &&
				!allowedRoles.includes(userDetails?.us_level)
			) {
				router.push("/");
			}
		}
	}, [user, userDetails, loading, router, allowedRoles]);

	return <>{children}</>;
}

export function useProtectedRoute(allowedRoles = []) {
	const { user, userDetails, loading } = useUserAuth();
	const Alert = useAlertActions();
	const router = useRouter();
	const [isAllowed, setIsAllowed] = useState(false);
	useEffect(() => {
		if (!loading) {
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
			setIsAllowed(true);
		}
	}, [user, userDetails, loading, router, allowedRoles]);
	return isAllowed;
}
