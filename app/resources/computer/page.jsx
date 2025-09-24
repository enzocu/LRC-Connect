"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/tags/empty";
import {
	FiSearch,
	FiGrid,
	FiList,
	FiChevronDown,
	FiPlus,
	FiCamera,
} from "react-icons/fi";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import ProtectedRoute from "@/contexts/ProtectedRoute";
import { useLoading } from "@/contexts/LoadingProvider";

import { getComputerList } from "../../../controller/firebase/get/getComputerList";
import { getStatusColor } from "@/controller/custom/getStatusColor";
import { ScannerModal } from "@/components/modal/scanner-modal";
import PaginationControls from "@/components/tags/pagination";

export default function ComputerResourcesPage() {
	const router = useRouter();
	const pathname = usePathname();
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const { setLoading, setPath, loading } = useLoading();

	//SCANNER
	const [isScannerOpen, setIsScannerOpen] = useState(false);

	const [viewType, setViewType] = useState("grid");
	const [computerData, setComputerData] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedStatus, setSelectedStatus] = useState("Active");

	//PAGINATION
	const [pageCursors, setPageCursors] = useState([]);
	const pageLimit = 5;
	const [currentPage, setCurrentPage] = useState(1);
	const [ctrPages, setCtrPage] = useState(1);

	useEffect(() => {
		setPath(pathname);
		if (userDetails && userDetails.us_liID) {
			getComputerList(
				userDetails.us_liID,
				setComputerData,
				selectedStatus,
				"",
				"",
				searchQuery,
				setLoading,
				Alert,
				setCtrPage,
				pageLimit,
				pageCursors,
				setPageCursors,
				currentPage
			);
		}
	}, [userDetails, currentPage, selectedStatus, searchQuery]);

	return (
		<ProtectedRoute
			allowedRoles={["USR-2", "USR-3", "USR-4", "USR-5", "USR-6"]}
		>
			<div className="flex h-screen bg-background transition-colors duration-300">
				<Sidebar />

				<div className="flex-1 flex flex-col overflow-hidden">
					<Header />

					<main className="flex-1 overflow-auto p-6 pt-24 overflow-auto">
						<div className="flex items-left justify-between mb-8 animate-slide-up flex-col sm:flex-row gap-4">
							<div className="w-fit">
								<h1 className="font-semibold text-foreground text-[20px]">
									Computer Resources
								</h1>
								<p className="text-muted-foreground text-[14px]">
									Browse and manage all available computer resources and
									workstations
								</p>
							</div>
							{userDetails &&
								["USR-2", "USR-3", "USR-4"].includes(userDetails.us_level) && (
									<Button
										onClick={() =>
											router.push("/resources/computer/register?type=register")
										}
										className="bg-primary text-white hover:opacity-90 h-9 px-4 flex items-center gap-2 w-fit font-normal text-[12px]"
									>
										<FiPlus className="w-4 h-4" />
										Register Computer
									</Button>
								)}
						</div>

						<div className="mb-8 animate-slide-up-delay-1">
							<div className="flex items-center justify-between mb-4 gap-6">
								<div className="relative flex items-center flex-1 max-w-md">
									<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
									<Input
										placeholder="Search computers..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-10 pr-32 h-9 bg-background border-none text-foreground rounded-md shadow-sm"
										style={{ fontSize: "12px" }}
									/>

									<div className="absolute right-0 top-0 h-full flex items-center gap-2 pr-2">
										<FiCamera
											className="w-4 h-4 text-muted-foreground cursor-pointer"
											onClick={() => setIsScannerOpen(true)}
										/>

										<div className="relative">
											<select
												value={selectedStatus}
												onChange={(e) => setSelectedStatus(e.target.value)}
												className="h-full pl-2 pr-6 text-xs rounded-l-none border-l border-border focus:outline-none bg-background appearance-none text-[12px]"
											>
												<option disabled>Filter</option>
												<option value="Active">Active</option>
												<option value="Inactive">Inactive</option>
											</select>
											<FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-muted-foreground w-4 h-4" />
										</div>
									</div>
								</div>

								<div className="flex items-center gap-2">
									<Button
										onClick={() => setViewType("grid")}
										variant={viewType === "grid" ? "default" : "outline"}
										size="sm"
										className={`h-9 border-none ${
											viewType === "grid"
												? "bg-primary-custom text-white"
												: "bg-background text-foreground hover:bg-accent shadow-sm"
										}`}
									>
										<FiGrid className="w-4 h-4" />
									</Button>
									<Button
										onClick={() => setViewType("table")}
										variant={viewType === "table" ? "default" : "outline"}
										size="sm"
										className={`h-9 border-none ${
											viewType === "table"
												? "bg-primary-custom text-white"
												: "bg-background text-foreground hover:bg-accent shadow-sm"
										}`}
									>
										<FiList className="w-4 h-4" />
									</Button>
								</div>
							</div>
						</div>

						{/* Main Content */}
						<div className="flex-1 animate-slide-up-delay-2">
							{viewType === "grid" && (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
									{computerData.map((computer, index) => (
										<Card
											key={index}
											className="bg-card border-none shadow-sm transition-colors  hover:shadow-md rounded-lg h-fit"
										>
											<CardContent className="flex gap-4 p-4">
												<img
													src={computer?.co_photoURL || "/placeholder.svg"}
													alt="computer"
													className={`h-28 w-28 object-cover rounded-lg bg-gray-100 flex-shrink-0 `}
												/>

												<div className="flex-1 min-w-0 space-y-2">
													<div>
														<h4 className="font-medium text-foreground text-[14px]">
															{computer?.co_name}
														</h4>
														<p className="text-muted-foreground text-[12px]">
															{computer?.co_dateFormatted}
														</p>
													</div>

													<div>
														<p className="text-[12px]">Specifications</p>
														<p className="text-muted-foreground text-[12px]">
															{computer?.co_specifications}
														</p>
													</div>

													<div>
														<p className="text-[12px]">Description</p>
														<p className="text-muted-foreground text-[12px] line-clamp-3">
															{computer?.co_description}
														</p>
													</div>

													<Button
														variant="link"
														size="sm"
														className="text-primary-custom hover:text-secondary-custom text-[12px] p-0"
														onClick={() =>
															router.push(
																`/resources/computer/details?id=${computer?.id}`
															)
														}
													>
														View details
													</Button>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							)}

							{/* Table View */}
							{viewType === "table" && (
								<Card className="bg-card border-border transition-colors duration-300 animate-slide-up">
									<CardContent className="p-0 overflow-x-auto">
										<table className="w-full">
											<thead className="bg-muted/30">
												<tr className="border-b border-border">
													{[
														"Cover",
														"Computer Name",
														"Status",
														"Asset tag",
														"Date acquired",
														"Min & Max Duration",
														"Specification",
														"Description",
														"Action",
													].map((header) => (
														<th
															key={header}
															className="text-left py-4 px-6 font-semibold text-foreground text-[12px]"
														>
															{header}
														</th>
													))}
												</tr>
											</thead>
											<tbody className="align-top">
												{computerData.map((computer, index) => (
													<tr
														key={index}
														className={`border-b border-border hover:bg-accent/30 transition-colors ${
															index % 2 === 0 ? "bg-background" : "bg-muted/10"
														}`}
													>
														<td className="py-4 px-6 min-w-[180px]">
															<img
																src={
																	computer?.co_photoURL || "/placeholder.svg"
																}
																alt="computer"
																className={`h-28 w-28 object-cover rounded-lg bg-gray-100 flex-shrink-0 `}
															/>
														</td>
														<td className="py-4 px-6 text-foreground font-medium text-[12px] min-w-[250px]">
															{computer?.co_name}
														</td>
														<td className="py-4 px-6">
															<Badge
																className={`${getStatusColor(
																	computer?.co_status
																)} text-[12px]`}
															>
																{computer?.co_status}
															</Badge>
														</td>
														<td className="py-4 px-6 text-foreground text-[12px] min-w-[150px]">
															{computer?.co_assetTag}
														</td>
														<td className="py-4 px-6 text-foreground text-[12px] min-w-[150px]">
															{computer?.co_dateFormatted}
														</td>
														<td className="py-4 px-6 text-foreground text-[12px] min-w-[150px]">
															{computer?.co_minDurationFormatted} -{" "}
															{computer?.co_maxDurationFormatted}
														</td>
														<td className="py-4 px-6 text-foreground text-[12px] min-w-[250px]">
															{computer.co_specifications}
														</td>
														<td className="py-4 px-6 text-foreground text-[12px] min-w-[350px] ">
															<div className="line-clamp-3">
																{computer.co_description}
															</div>
														</td>

														<td className="py-4 px-6">
															<Button
																variant="link"
																size="sm"
																className="text-primary-custom hover:text-secondary-custom text-[12px] p-0"
																onClick={() =>
																	router.push(
																		`/resources/computer/details?id=${computer?.id}`
																	)
																}
															>
																View details
															</Button>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</CardContent>
								</Card>
							)}
							<EmptyState data={computerData} loading={loading} />

							<PaginationControls
								ctrPages={ctrPages}
								currentPage={currentPage}
								setCurrentPage={setCurrentPage}
							/>
						</div>

						<ScannerModal
							isOpen={isScannerOpen}
							onClose={() => setIsScannerOpen(false)}
							setResult={setSearchQuery}
							allowedPrefix="CMP"
						/>
					</main>
				</div>
			</div>
		</ProtectedRoute>
	);
}
