"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { FiArrowLeft, FiEdit3 } from "react-icons/fi";
import { QrCode, Sparkles, Building2, GraduationCap } from "lucide-react";
import { PatronSelectionModal } from "@/components/modal/patron-selection-modal";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import { useLoading } from "@/contexts/LoadingProvider";

import { getStatusColor } from "@/controller/custom/getStatusColor";
import { CodeModal } from "@/components/modal/code-modal";
import { getComputer } from "../../../../controller/firebase/get/getComputer";

import { handleProceedWithReservation } from "../../../../controller/custom/customFunction";

export default function ComputerDetails() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const id = searchParams.get("id");

	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const { setLoading, setPath } = useLoading();

	const [isCodeOpen, setCodeOpen] = useState(false);
	const [patronSelectionOpen, setPatronSelectionOpen] = useState(false);

	const [formData, setFormData] = useState({});

	useEffect(() => {
		setPath(pathname);
		if (userDetails && id) {
			getComputer(id, setFormData, setLoading, Alert);
		}
	}, [userDetails]);

	return (
		<div className="min-h-screen bg-background transition-colors duration-300">
			<Header />
			<main className="pt-28 pb-6 px-6 sm:px-6 md:px-16 lg:px-[100px] xl:px-[150px]">
				<div className="mb-6 animate-fade-in">
					<button
						onClick={() => router.back()}
						className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit text-[11px]"
					>
						<FiArrowLeft className="w-3 h-3" />
						Back to Previous page
					</button>
				</div>

				<div className="mb-8 animate-slide-up">
					<h1 className="font-semibold text-foreground text-[20px]">
						Computer Details
					</h1>
					<p className="text-muted-foreground text-[14px]">
						View detailed information about this computer resource
					</p>
				</div>

				{/* Main Content */}
				<div className="grid grid-cols-1 lg:grid-cols-5 gap-14">
					<div className="lg:col-span-2">
						<div className="sticky top-24">
							<div className="rounded-lg p-6 shadow-sm border border-border">
								<div className="relative">
									<img
										src={
											formData?.co_photoURL ||
											"/placeholder.svg?height=600&width=400"
										}
										alt="Computer"
										className="w-full max-w-sm mx-auto rounded-lg shadow-xl aspect-[4/3] object-cover"
										onError={(e) => {
											e.target.onerror = null;
											e.target.src = "/placeholder.svg?height=600&width=400";
										}}
									/>

									<Badge
										className={`absolute -top-2 -right-2 px-3 py-1 text-xs ${getStatusColor(
											formData?.co_status
										)}`}
									>
										{formData?.co_status}
									</Badge>
								</div>
							</div>
						</div>
					</div>

					<div className="lg:col-span-3 space-y-8">
						<div className="space-y-2">
							<h1 className="text-[28px] font-bold  leading-tight tracking-tight">
								{formData?.co_name}
							</h1>
							<p className="text-[16px] text-foreground-700 font-medium">
								Asset Tag: {formData?.co_assetTag}
							</p>
							<p className="text-muted-foreground leading-relaxed text-[14px]">
								{formData?.co_description}
							</p>

							<div className="flex gap-3 pt-2">
								{formData?.co_operation &&
									formData?.co_liStatus == "Active" &&
									userDetails?.us_level != "USR-1" &&
									formData?.co_status == "Active" &&
									userDetails?.us_status == "Active" && (
										<Button
											className="bg-primary-custom text-white hover:bg-secondary-custom  text-[12px] h-10 px-6 transition-colors duration-200 flex items-center gap-2 shimmer"
											onClick={() => {
												!["USR-5", "USR-6"].includes(userDetails?.us_level)
													? setPatronSelectionOpen(true)
													: handleProceedWithReservation(
															router,
															"Computer",
															formData?.id,
															userDetails?.uid
													  );
											}}
										>
											Reserve
										</Button>
									)}
								<Button
									variant="outline"
									className="text-[12px] h-10 w-fit "
									onClick={() => setCodeOpen(true)}
								>
									<QrCode className="w-5 h-5" />
								</Button>
							</div>
						</div>

						<div className="space-y-6">
							<div className="p-6  rounded-lg shadow-sm border border-border">
								<h3 className="font-medium text-foreground text-[16px] mb-3 leading-none">
									Computer Details
								</h3>
								<div className="space-y-4">
									<div className="flex flex-col sm:flex-row sm:items-start gap-2">
										<Label className="text-[12px] font-medium text-foreground sm:w-1/3 shrink-0">
											Specifications
										</Label>
										<p className="text-[12px] text-muted-foreground sm:flex-1">
											{formData?.co_specifications}
										</p>
									</div>
									<div className="flex flex-col sm:flex-row sm:items-start gap-2">
										<Label className="text-[12px] font-medium text-foreground sm:w-1/3 shrink-0">
											Date Acquired
										</Label>
										<p className="text-[12px] text-muted-foreground sm:flex-1">
											{formData?.co_date}
										</p>
									</div>
									<div className="flex flex-col sm:flex-row sm:items-start gap-2">
										<Label className="text-[12px] font-medium text-foreground sm:w-1/3 shrink-0">
											Min Duration
										</Label>
										<p className="text-[12px] text-muted-foreground sm:flex-1">
											{formData?.co_minDurationFormatted}
										</p>
									</div>
									<div className="flex flex-col sm:flex-row sm:items-start gap-2">
										<Label className="text-[12px] font-medium text-foreground sm:w-1/3 shrink-0">
											Max Duration
										</Label>
										<p className="text-[12px] text-muted-foreground sm:flex-1">
											{formData?.co_maxDurationFormatted}
										</p>
									</div>
								</div>
							</div>

							<div className="rounded-lg p-6 shadow-sm border border-border">
								<h3 className="font-medium text-foreground text-[16px]  mb-3">
									Location & Details
								</h3>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{/* School Name */}
									<div className="flex items-start gap-2">
										<GraduationCap className="w-4 h-4 text-foreground mt-[2px] flex-shrink-0" />
										<span className="text-muted-foreground">|</span>
										<div className="leading-none space-y-2">
											<label className="text-[12px] font-medium text-foreground">
												School Name
											</label>
											<p className="text-[12px] text-muted-foreground leading-4">
												{formData?.co_school}
											</p>
										</div>
									</div>

									{/* Library Name */}
									<div className="flex items-start gap-2">
										<Building2 className="w-4 h-4 text-foreground mt-[2px] flex-shrink-0" />
										<span className="text-muted-foreground">|</span>
										<div className="leading-none space-y-2">
											<label className="text-[12px] font-medium text-foreground">
												Library Name
											</label>
											<p className="text-[12px] text-muted-foreground leading-4">
												{formData?.co_library}
											</p>
										</div>
									</div>
								</div>

								<div className="flex gap-3 mt-6 justify-end border-t  pt-4">
									<Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700  shadow-sm text-[12px] h-9 shimmer">
										<Sparkles className="w-4 h-4 mr-1" />
										AI Assistant
									</Button>
									{userDetails &&
										["USR-2", "USR-3", "USR-4"].includes(
											userDetails?.us_level
										) && (
											<Button
												onClick={() =>
													router.push(
														`/resources/computer/register?type=edit&id=${id}`
													)
												}
												variant="outline"
												className="hover:bg-secondary bg-transparent text-[12px] h-9"
											>
												<FiEdit3 className="w-3 h-3 mr-1" />
												Edit
											</Button>
										)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>

			{/* Patron Selection Modal */}
			<PatronSelectionModal
				isOpen={patronSelectionOpen}
				onClose={() => setPatronSelectionOpen(false)}
				resourceType="Computer"
				resourceID={formData?.id}
				libraryID={userDetails?.us_liID}
				Alert
			/>

			<CodeModal
				isOpen={isCodeOpen}
				onClose={() => setCodeOpen(false)}
				value={formData?.co_qr}
				showQR={true}
				title={`Computer Code: 	${formData?.co_qr}`}
			/>
		</div>
	);
}
