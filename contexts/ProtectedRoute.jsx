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
				!allowedRoles.includes(userDetails.us_level)
			) {
				router.push("/");
			}
		}
	}, [user, userDetails, loading, router, allowedRoles]);

	return <>{children}</>;
}
