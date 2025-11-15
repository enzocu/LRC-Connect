"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
	FiArrowLeft,
	FiEdit3,
	FiBookOpen,
	FiDownload,
	FiHeadphones,
	FiMapPin,
	FiTag,
	FiGrid,
	FiPackage,
	FiShoppingBag,
} from "react-icons/fi";
import { QrCode, Sparkles, Building2, GraduationCap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatronSelectionModal } from "@/components/modal/patron-selection-modal";
import { AIResourcesModal } from "@/components/modal/ai-resources-modal";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import { useLoading } from "@/contexts/LoadingProvider";

import { getStatusColor } from "@/controller/custom/getStatusColor";
import { CodeModal } from "@/components/modal/code-modal";
import { getMaterialWithMarctag } from "../../../../controller/firebase/get/getMaterialWithMarctag";

import { handleProceedWithReservation } from "../../../../controller/custom/customFunction";

export default function MaterialDetailsPage() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const id = searchParams.get("id");

	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const { setLoading, setPath } = useLoading();

	const [isCodeOpen, setCodeOpen] = useState(false);
	const [showMarcTags, setShowMarcTags] = useState(false);
	const [patronSelectionOpen, setPatronSelectionOpen] = useState(false);
	const [isAiModalOpen, setAiModalOpen] = useState(false);

	const [formData, setFormData] = useState({});

	useEffect(() => {
		setPath(pathname);
		if (userDetails && id) {
			getMaterialWithMarctag(id, setFormData, setLoading, Alert);
		}
	}, [userDetails, id]);

	return (
		<div className="min-h-screen bg-background transition-colors duration-300">
			<Header />

			<main className="pt-28 pb-6 px-6 sm:px-6 md:px-16 lg:px-[100px] xl:px-[150px]">
				<div className="mb-6 animate-fade-in">
					<button
						onClick={() => router.back()}
						className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit text-[11px]"
					>
						<FiArrowLeft className="w-4 h-4" />
						Back to Previous pages
					</button>
				</div>

				<div className="mb-8 animate-slide-up">
					<h1 className="font-semibold text-foreground text-[20px]">
						Material Details
					</h1>
					<p className="text-muted-foreground text-[14px]">
						View detailed information about this library material
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-5 gap-14">
					<div className="lg:col-span-2">
						<div className="sticky top-24">
							<div className="rounded-lg p-6 shadow-sm border border-border">
								<div className="relative">
									<img
										src="/placeholder.svg"
										data-src={formData?.ma_coverURL || "/placeholder.svg"}
										alt="Material"
										className="w-full max-w-sm mx-auto rounded-lg shadow-xl aspect-[2/3] object-cover"
										onError={(e) => {
											e.target.onerror = null;
											e.target.src = "/placeholder.svg";
										}}
										onLoad={(e) => {
											if (e.target.getAttribute("data-src")) {
												e.target.src = e.target.getAttribute("data-src");
											}
										}}
									/>
									<Badge
										className={`absolute -top-2 -right-2 px-3 py-1 text-xs ${getStatusColor(
											formData?.ma_status
										)}`}
									>
										{formData?.ma_status}
									</Badge>
								</div>
							</div>
						</div>
					</div>

					<div className="lg:col-span-3 space-y-8">
						<div className="space-y-2">
							<h1 className="text-[28px] font-bold  leading-tight tracking-tight">
								{formData?.ma_title || "Title"}
							</h1>
							<p className="text-[16px] text-foreground-700 font-medium">
								{formData?.ma_author || "Author"}
							</p>
							<p className="text-muted-foreground leading-relaxed text-[14px]">
								{formData?.ma_description || "Description"}
							</p>

							<div className="flex gap-3 pt-2">
								{formData?.ma_operation &&
									userDetails?.us_level != "USR-1" &&
									userDetails?.us_liID &&
									formData?.ma_liStatus == "Active" &&
									formData?.ma_status == "Active" &&
									userDetails?.us_status == "Active" && (
										<Button
											onClick={() => {
												!["USR-5", "USR-6"].includes(userDetails?.us_level)
													? setPatronSelectionOpen(true)
													: handleProceedWithReservation(
															router,
															"Material",
															formData?.id,
															userDetails?.uid
													  );
											}}
											className="bg-primary-custom text-white hover:bg-secondary-custom  text-[12px] h-10 px-6 transition-colors duration-200 flex items-center gap-2 shimmer"
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

						<div>
							<h3 className="font-medium text-foreground text-[16px] mb-3">
								Available Formats
							</h3>
							<div className="grid grid-cols-3 gap-4">
								{formData?.ma_formats?.coverCopy && (
									<div className="text-center p-4 rounded-lg border border-blue-100">
										<FiBookOpen className="w-6 h-6 text-blue-600 mx-auto mb-2" />
										<div className="text-[14px] font-medium text-foreground">
											Hard Copy
										</div>
										<div className="text-[12px] text-muted-foreground">
											{formData?.ma_formats.coverCopyStatus}
										</div>
									</div>
								)}
								{formData?.ma_formats?.softCopy && (
									<div className="text-center p-4 rounded-lg border border-green-100 cursor-pointer transition-colors">
										<FiDownload className="w-6 h-6 text-green-600 mx-auto mb-2" />
										<div className="text-[14px] font-medium text-foreground">
											Soft Copy
										</div>
										<div className="text-[12px] text-muted-foreground">
											{formData?.ma_formats.softCopyStatus}
										</div>
									</div>
								)}
								{formData?.ma_formats?.audioCopy && (
									<div className="text-center p-4  rounded-lg border border-orange-100">
										<FiHeadphones className="w-6 h-6 text-orange-600 mx-auto mb-2" />
										<div className="text-[14px] font-medium text-foreground">
											Audio Copy
										</div>
										<div className="text-[12px] text-muted-foreground">
											{formData?.ma_formats.audioCopyStatus}
										</div>
									</div>
								)}
							</div>
						</div>

						<Tabs defaultValue="details" className="w-full">
							<TabsList className="grid w-full grid-cols-3 mb-6 bg-muted">
								<TabsTrigger value="details" className="text-[12px]">
									Material Details
								</TabsTrigger>
								<TabsTrigger value="holdings" className="text-[12px]">
									Holdings
								</TabsTrigger>
								<TabsTrigger value="location" className="text-[12px]">
									Location
								</TabsTrigger>
							</TabsList>

							<TabsContent value="details">
								<div className="space-y-4">
									{formData?.ma_sections?.length > 0 &&
										formData?.ma_sections.map((section, index) => (
											<div
												key={index}
												className="rounded-lg shadow-sm border border-border hover:shadow-lg"
											>
												<div className="p-6">
													<h3 className="font-medium text-foreground text-[16px] mb-3">
														{section.mt_section}
													</h3>
													<div className="space-y-4">
														{section.mt_fields.map((field, index) => (
															<div
																key={index}
																className="flex flex-col sm:flex-row sm:items-start gap-2"
															>
																<Label className="text-[12px] font-medium text-foreground sm:w-1/3 shrink-0">
																	{field.mt_title}
																	{showMarcTags && (
																		<span className="text-primary-custom ml-2 bg-primary-custom/10 px-2 py-0.5 rounded-md text-[11px] border border-primary-custom/20">
																			{field.mt_marcTag}
																		</span>
																	)}
																</Label>
																<p className="text-[12px] text-muted-foreground sm:flex-1">
																	{field.mt_value}
																</p>
															</div>
														))}
													</div>
												</div>
											</div>
										))}
								</div>
							</TabsContent>

							<TabsContent value="holdings">
								<div className="space-y-4">
									{formData?.ma_holdings?.length > 0 && (
										<div className="overflow-x-auto ">
											<table className="w-full">
												<thead className="bg-muted/60">
													<tr className="border-b border-border">
														<th className="text-left py-3 px-3 text-foreground font-medium text-[12px]">
															Accession No.
														</th>

														<th className="text-left py-3 px-3 text-foreground font-medium text-[12px]">
															Volume/Part
														</th>
														<th className="text-left py-3 px-3 text-foreground font-medium text-[12px]">
															Copy #
														</th>
														<th className="text-left py-3 px-3 text-foreground font-medium text-[12px]">
															Circulation Status
														</th>
													</tr>
												</thead>
												<tbody>
													{formData?.ma_holdings.map((holding, idx) => (
														<tr
															key={idx}
															className="border-b border-border/50 hover:bg-muted/20 transition-colors duration-200 cursor-pointer"
														>
															<td
																className="py-3 px-3 text-foreground text-[12px]"
																style={{ width: "30%" }}
															>
																{holding.ho_access}
															</td>

															<td
																className="py-3 px-3 text-foreground text-[12px]"
																style={{ width: "30%" }}
															>
																{holding.ho_volume}
															</td>

															<td
																className="py-3 px-3 text-foreground text-[12px]"
																style={{ width: "20%" }}
															>
																{holding.ho_copy}
															</td>
															<td
																className="py-3 px-3 text-foreground text-[12px]"
																style={{ width: "20%" }}
															>
																{holding.ho_status}
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									)}
								</div>
							</TabsContent>

							<TabsContent value="location">
								<div className="rounded-lg p-6 shadow-sm border border-border">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="flex items-start gap-2">
											<GraduationCap className="w-4 h-4 text-foreground mt-[2px] flex-shrink-0" />
											<span className="text-muted-foreground">|</span>
											<div className="leading-none space-y-2">
												<label className="text-[12px] font-medium text-foreground">
													School Name
												</label>
												<p className="text-[12px] text-muted-foreground leading-4">
													{formData?.ma_school}
												</p>
											</div>
										</div>

										<div className="flex items-start gap-2">
											<Building2 className="w-4 h-4 text-foreground mt-[2px] flex-shrink-0" />
											<span className="text-muted-foreground">|</span>
											<div className="leading-none space-y-2">
												<label className="text-[12px] font-medium text-foreground">
													Library Name
												</label>
												<p className="text-[12px] text-muted-foreground leading-4">
													{formData?.ma_library}
												</p>
											</div>
										</div>

										<div className="flex items-start gap-2">
											<FiTag className="w-4 h-4 text-foreground mt-[2px] flex-shrink-0" />
											<span className="text-muted-foreground">|</span>
											<div className="leading-none space-y-2">
												<label className="text-[12px] font-medium text-foreground">
													Call Number
												</label>
												<p className="text-[12px] text-muted-foreground leading-4">
													{formData?.ma_callNumber}
												</p>
											</div>
										</div>

										<div className="flex items-start gap-2">
											<FiMapPin className="w-4 h-4 text-foreground mt-[2px] flex-shrink-0" />
											<span className="text-muted-foreground">|</span>
											<div className="leading-none space-y-2">
												<label className="text-[12px] font-medium text-foreground">
													Shelf
												</label>
												<p className="text-[12px] text-muted-foreground leading-4">
													{formData?.ma_shelf}
												</p>
											</div>
										</div>

										<div className="flex items-start gap-2">
											<FiBookOpen className="w-4 h-4 text-foreground mt-[2px] flex-shrink-0" />
											<span className="text-muted-foreground">|</span>
											<div className="leading-none space-y-2">
												<label className="text-[12px] font-medium text-foreground">
													Material Type
												</label>
												<p className="text-[12px] text-muted-foreground leading-4">
													{formData?.ma_materialType}
												</p>
											</div>
										</div>

										<div className="flex items-start gap-2">
											<FiGrid className="w-4 h-4 text-foreground mt-[2px] flex-shrink-0" />
											<span className="text-muted-foreground">|</span>
											<div className="leading-none space-y-2">
												<label className="text-[12px] font-medium text-foreground">
													Category
												</label>
												<p className="text-[12px] text-muted-foreground leading-4">
													{formData?.ma_category}
												</p>
											</div>
										</div>

										<div className="flex items-start gap-2">
											<FiPackage className="w-4 h-4 text-foreground mt-[2px] flex-shrink-0" />
											<span className="text-muted-foreground">|</span>
											<div className="leading-none space-y-2">
												<label className="text-[12px] font-medium text-foreground">
													Acquisition Type
												</label>
												<p className="text-[12px] text-muted-foreground leading-4">
													{formData?.ma_acquisitionType}
												</p>
											</div>
										</div>

										<div className="flex items-start gap-2">
											<FiShoppingBag className="w-4 h-4 text-foreground mt-[2px] flex-shrink-0" />
											<span className="text-muted-foreground">|</span>
											<div className="leading-none space-y-2">
												<label className="text-[12px] font-medium text-foreground">
													{formData?.ma_acquisitionType == "Donated"
														? "Donor"
														: "Price Per Item"}
												</label>
												<p className="text-[12px] text-muted-foreground leading-4">
													{formData?.ma_acquisitionType == "Donated"
														? formData?.ma_donor
														: formData?.ma_pricePerItem}
												</p>
											</div>
										</div>
									</div>
								</div>
							</TabsContent>
						</Tabs>

						<div className="rounded-lg p-4 shadow-sm border border-border">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<Switch
										id="marc-toggle"
										checked={showMarcTags}
										onCheckedChange={setShowMarcTags}
									/>
									<Label
										htmlFor="marc-toggle"
										className="text-[12px] font-medium text-foreground"
									>
										Show MARC Tags
									</Label>
								</div>

								<div className="flex gap-3">
									<Button
										onClick={() => setAiModalOpen(true)}
										className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700  shadow-sm text-[12px] h-9 shimmer"
									>
										<Sparkles className="w-4 h-4 mr-1" />
										AI Assistant
									</Button>
									{userDetails &&
										["USR-2", "USR-3", "USR-4"].includes(
											userDetails?.us_level
										) &&
										formData?.ma_liID?.id == userDetails?.us_liID?.id && (
											<Button
												variant="outline"
												className="hover:bg-secondary bg-transparent text-[12px] h-9"
												onClick={() =>
													router.push(
														`/resources/material/main/register/material?type=edit&id=${id}`
													)
												}
											>
												<FiEdit3 className="w-4 h-4 mr-1" />
												Edit
											</Button>
										)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>

			<AIResourcesModal
				open={isAiModalOpen}
				close={() => setAiModalOpen(false)}
				resourceDetails={formData}
			/>

			<PatronSelectionModal
				isOpen={patronSelectionOpen}
				onClose={() => setPatronSelectionOpen(false)}
				resourceType="Material"
				resourceID={formData?.id}
				libraryID={userDetails?.us_liID}
				Alert
			/>

			<CodeModal
				isOpen={isCodeOpen}
				onClose={() => setCodeOpen(false)}
				value={formData?.ma_qr}
				showQR={true}
				title={`Material Code: ${formData?.ma_qr}`}
			/>
		</div>
	);
}
