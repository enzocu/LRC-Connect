"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiBell } from "react-icons/fi";
import { ScanLine } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { useAlertActions } from "@/contexts/AlertContext";
import { ScannerModal } from "@/components/modal/scanner-modal";
import { useUserAuth } from "@/contexts/UserContextAuth";
import { getScanner } from "@/controller/firebase/get/getScanner";
import { getScannerCode } from "@/controller/firebase/get/getScannerCode";

export function Header() {
	const { userDetails } = useUserAuth();
	const router = useRouter();
	const Alert = useAlertActions();

	//SCANNER
	const [isScannerOpen, setIsScannerOpen] = useState(false);
	const [scannedCode, setScannedCode] = useState("");

	useEffect(() => {
		if (scannedCode) {
			getScanner(null, scannedCode, router, Alert);
		}
	}, [scannedCode]);

	useEffect(() => {
		if (!userDetails || !userDetails?.us_liID) return;

		const unsubscribe = getScannerCode(
			userDetails.us_liID,
			userDetails.uid,
			router,
			Alert
		);

		return () => {
			if (unsubscribe) unsubscribe();
		};
	}, [userDetails]);

	return (
		<div className="no-print fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-6 px-6 py-4 bg-card border-b border-border transition-all duration-300 opacity-100">
			<div className="flex items-center gap-2">
				<div className="w-15 h-9 rounded-lg overflow-hidden flex items-center justify-center ">
					<img
						src="/logo.png"
						alt="BETCH"
						className="w-full h-full object-cover"
					/>
				</div>
				<span
					className="font-semibold text-foreground"
					style={{ fontSize: "14px" }}
				>
					Dalubhasaang Politekniko ng Lungsod ng Baliwag
				</span>
			</div>

			<div className="flex items-center gap-3">
				<Button
					onClick={() => setIsScannerOpen(true)}
					variant="ghost"
					size="sm"
					className="relative h-9 w-9 p-0 flex items-center justify-center overflow-hidden"
				>
					<ScanLine className="w-6 h-6 text-foreground" />

					<span className="absolute left-2 right-2 h-[2px] bg-primary animate-scan" />
				</Button>
				<Button variant="ghost" size="sm" className="relative h-9 w-9 p-0">
					<FiBell className="w-4 h-4" />
					<span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
				</Button>

				<div className="flex items-center gap-2">
					<Avatar className="w-8 h-8">
						<AvatarImage
							src={userDetails?.us_photoURL || "/placeholder.svg"}
							alt="User Photo"
							className="object-cover"
						/>
						<AvatarFallback>
							{(userDetails?.us_fname?.[0] || "") +
								(userDetails?.us_lname?.[0] || "")}
						</AvatarFallback>
					</Avatar>

					<div className="sm:block hidden">
						<p
							className="font-medium text-foreground"
							style={{ fontSize: "13px" }}
						>
							{userDetails?.us_fname || ""} {userDetails?.us_lname || ""}
						</p>
						<p className="text-muted-foreground" style={{ fontSize: "11px" }}>
							{userDetails?.us_type || ""} | {userDetails?.us_level || ""}
						</p>
					</div>
				</div>
			</div>

			{/* {Scanner} */}
			<ScannerModal
				isOpen={isScannerOpen}
				onClose={() => setIsScannerOpen(false)}
				setResult={setScannedCode}
				allowedPrefix="TRN|USR|MTL|CMP|DRM|LIB"
			/>
		</div>
	);
}
