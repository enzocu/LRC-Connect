"use client";

import { useRouter, usePathname } from "next/navigation";
import Lottie from "lottie-react";
import authAnimation from "@/public/lottie/authLoading.json";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { auth, db } from "@/server/firebaseConfig";
import { useAlertActions } from "@/contexts/AlertContext";
import { EnterExit } from "@/controller/firebase/update/updateEnterExit";

const UserContextAuth = createContext(undefined);

export function UserContextAuthProvider({ children }) {
	const router = useRouter();
	const Alert = useAlertActions();
	const pathname = usePathname();

	const [user, setUser] = useState(null);
	const [userDetails, setUserDetails] = useState(null);
	const [hasTriggered, setHasTriggered] = useState(false);
	const [loading, setLoading] = useState(true);

	const libraryAssociated = async (associated, router) => {
		const newDetails = {
			...userDetails,
			us_liID: associated.id,
			us_level: associated.us_level || null,
			us_type: associated.us_type || null,
		};

		localStorage.setItem("userDetails", JSON.stringify(newDetails));
		setUserDetails({
			...newDetails,
			us_liID: doc(db, "library", associated.id),
		});

		if (pathname === "/users") {
			await EnterExit(
				newDetails.uid,
				doc(db, "library", associated.id),
				newDetails.uid,
				null,
				"onApp",
				"Active",
				setLoading,
				Alert
			);
		}

		router.push("/users/home");
	};

	useEffect(() => {
		let unsubscribeUserDoc = () => {};

		const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
			unsubscribeUserDoc();

			setUser(currentUser);
			setLoading(true);

			if (currentUser) {
				const userRef = doc(db, "users", currentUser.uid);

				unsubscribeUserDoc = onSnapshot(
					userRef,
					async (docSnap) => {
						if (docSnap.exists()) {
							const data = docSnap.data();
							setUserDetails(data);

							if (
								["USR-1", "USR-5", "USR-6"].includes(data.us_level) &&
								data.us_type != "Personnel"
							) {
								if (data.us_level === "USR-1") {
									if (pathname === "/" || pathname === "/login") {
										router.push("/superadmin/dashboard");
									}
								} else if (
									data.us_level === "USR-5" ||
									data.us_level === "USR-6"
								) {
									if (data.us_status != "Active") {
										Alert.showDanger(
											"⚠️ This account is currently inactive. Users cannot reserve any resources until it is reactivated. Please contact the administrator for assistance."
										);
									}

									const librarySnap = await getDoc(data.us_liID);

									if (librarySnap.exists()) {
										const li_status = librarySnap.data().li_status;

										if (li_status === "Active") {
											if (pathname === "/" || pathname === "/login") {
												await EnterExit(
													data.uid,
													data.us_liID,
													data.uid,
													null,
													"onApp",
													"Active",
													setLoading,
													Alert
												);

												router.push("/users/home");
											}
										} else {
											Alert.showDanger(
												"⚠️ This account is currently inactive in its associated library. Users cannot log in until it is reactivated. Please contact the administrator for assistance."
											);
											setUserDetails(null);
											await signOut(auth);
											router.push("/");
										}
									} else {
										Alert.showDanger(
											"❌ Library record not found. Please contact the administrator."
										);
									}
								}
							} else {
								const stored = localStorage.getItem("userDetails");
								const data = JSON.parse(stored);

								if (stored && data?.us_liID) {
									setUserDetails((prev) => ({
										...prev,
										us_liID:
											typeof data?.us_liID === "string"
												? doc(db, "library", data.us_liID)
												: data?.us_liID,
										us_level: data.us_level,
										us_type: data.us_type,
									}));
								} else {
									setUserDetails((prev) => ({
										...prev,
										us_level: data?.us_level ?? "USR-3",
									}));
								}

								if (
									pathname === "/" ||
									pathname === "/login" ||
									!data?.us_liID
								) {
									router.push("/users");
								}
							}
						} else {
							setUserDetails(null);
							router.push("/");
						}

						setLoading(false);
					},
					(error) => {
						Alert.showDanger(
							"Error listening to user details: " + error.message
						);
						setUserDetails(null);
						setLoading(false);
						router.push("/");
					}
				);
			} else {
				setUserDetails(null);
				setLoading(false);
				router.push("/");
			}
		});

		return () => {
			unsubscribeAuth();
			unsubscribeUserDoc();
		};
	}, [hasTriggered]);

	return (
		<UserContextAuth.Provider
			value={{
				user,
				userDetails,
				loading,
				libraryAssociated,
				setHasTriggered,
			}}
		>
			{loading ? (
				<div className="flex items-center justify-center h-screen w-full bg-background">
					<Lottie animationData={authAnimation} loop className="w-60 h-60" />
				</div>
			) : (
				children
			)}
		</UserContextAuth.Provider>
	);
}

export function useUserAuth() {
	const context = useContext(UserContextAuth);
	if (context === undefined) {
		throw new Error(
			"useUserAuth must be used within a UserContextAuthProvider"
		);
	}
	return context;
}
