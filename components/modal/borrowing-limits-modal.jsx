"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FiX, FiBookOpen } from "react-icons/fi";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import { useLoading } from "@/contexts/LoadingProvider";
import { LoadingSpinner } from "@/components/loading";

import { updateBorrowingLimit } from "@/controller/firebase/update/updateBorrowingLimit";
import { getBorrowingLimit } from "@/controller/firebase/get/getBorrowingLimit";

export default function BorrowingLimitsModal({ isOpen, onClose }) {
	const pathname = usePathname();
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const { setLoading, setPath } = useLoading();
	const [btnLoading, setBtnLoading] = useState(false);

	const [limits, setLimits] = useState({
		br_student: { maxItems: 3, borrowDays: 8 },
		br_faculty: { maxItems: 5, borrowDays: 8 },
		br_administrator: { maxItems: 5, borrowDays: 8 },
	});

	const handleInputChange = (userType, key, value) => {
		const numValue = Number.parseInt(value) || 0;
		setLimits((prev) => ({
			...prev,
			[userType]: {
				...prev[userType],
				[key]: numValue,
			},
		}));
	};

	const handleSave = async () => {
		if (userDetails && userDetails.us_liID) {
			await updateBorrowingLimit(
				userDetails.us_liID,
				userDetails.uid,
				limits,
				setBtnLoading,
				Alert
			);
			onClose();
		}
	};

	useEffect(() => {
		setPath(pathname);
		if (!isOpen || !userDetails || !userDetails.us_liID) return;
		getBorrowingLimit(userDetails.us_liID, setLimits, setLoading, Alert);
	}, [userDetails, isOpen]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 bg-black/50">
			<div className="absolute inset-0" onClick={onClose} />

			<Card
				role="dialog"
				aria-modal="true"
				className="relative z-10 w-full max-w-md mx-4 max-h-[90vh] flex flex-col bg-card border border-border rounded-xl shadow-lg overflow-hidden transform animate-slide-up scale-100 transition-transform duration-300"
			>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-primary-custom text-white rounded-t-lg">
					<CardTitle className="text-[16px] font-semibold flex items-center gap-2">
						<FiBookOpen className="w-5 h-5" />
						Borrowing Limits
					</CardTitle>
					<button
						onClick={onClose}
						aria-label="Close modal"
						className="p-2 hover:bg-white/20 rounded-md transition-colors"
					>
						<FiX className="w-4 h-4" />
					</button>
				</CardHeader>

				<CardContent className="p-6 space-y-6 overflow-y-auto text-sm text-muted-foreground">
					<p className="text-[12px]">
						Set the maximum number of items and borrowing duration for different
						user types.
					</p>

					{/* Tabs for Student, Faculty, Admin */}
					<Tabs defaultValue="student" className="w-full">
						<TabsList className="grid w-full grid-cols-3 mb-4 bg-muted rounded-lg">
							<TabsTrigger value="student" className="text-[12px]">
								Student
							</TabsTrigger>
							<TabsTrigger value="faculty" className="text-[12px]">
								Faculty
							</TabsTrigger>
							<TabsTrigger value="administrator" className="text-[12px]">
								Administrator
							</TabsTrigger>
						</TabsList>

						{["student", "faculty", "administrator"].map((type) => {
							const key = `br_${type}`;

							return (
								<TabsContent value={type} key={type}>
									<div className="space-y-2">
										<div className="grid grid-cols-2 gap-4">
											{["maxItems", "borrowDays"].map((field) => (
												<div className="space-y-2" key={field}>
													<label className="block font-medium text-foreground text-[12px]">
														{field === "maxItems"
															? "Max Items"
															: "Borrow Days Range"}
													</label>
													<Input
														type="number"
														min="1"
														max={field === "maxItems" ? "150" : "365"}
														value={limits[key][field]}
														onChange={(e) =>
															handleInputChange(key, field, e.target.value)
														}
														className="h-9 bg-background border border-border text-foreground"
														style={{ fontSize: "12px" }}
														placeholder={field === "maxItems" ? "5" : "14"}
													/>
												</div>
											))}
										</div>
									</div>
								</TabsContent>
							);
						})}
					</Tabs>
				</CardContent>

				{/* Footer */}
				<div className="flex justify-end gap-3 px-6 pb-6">
					<Button
						onClick={() => onClose()}
						variant="outline"
						className="bg-transparent h-10 px-4 text-[12px]"
					>
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						className="bg-primary-custom hover:bg-primary-custom/90 text-white h-10 px-4 text-[12px]"
					>
						<LoadingSpinner loading={btnLoading} />
						Save Limits
					</Button>
				</div>
			</Card>
		</div>
	);
}
