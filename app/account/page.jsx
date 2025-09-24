"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EmptyState from "@/components/tags/empty";

import {
	FiSearch,
	FiX,
	FiTrash2,
	FiCamera,
	FiFileText,
	FiChevronDown,
	FiPlus,
	FiEdit,
	FiRepeat,
} from "react-icons/fi";
import { ExternalLink } from "lucide-react";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import { useLoading } from "@/contexts/LoadingProvider";

import {
	getUserList,
	getUserAttributeFilters,
	getUserLibraryOptions,
} from "@/controller/firebase/get/getUserList";

import { getStatusColor } from "@/controller/custom/getStatusColor";
import BorrowingLimitsModal from "@/components/modal/borrowing-limits-modal";
import { ManualSearchModal } from "@/components/modal/manual-search-modal";
import { RemoveAccountModal } from "@/components/modal/remove-account-modal";
import { ExcelImportModal } from "@/components/modal/excel-import-modal";
import { UserTypeModal } from "@/components/modal/usertype-modal";
import { ScannerModal } from "@/components/modal/scanner-modal";
import PaginationControls from "@/components/tags/pagination";

export default function AccountList() {
	const router = useRouter();
	const pathname = usePathname();
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const searchParams = useSearchParams();
	const type = searchParams.get("type");
	const { setLoading, setPath, loading } = useLoading();

	const [userData, setUserData] = useState([]);

	// FILTER
	const [showFilters, setShowFilters] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedStatus, setSelectedStatus] = useState("Active");
	const [selectedLibrary, setSelectedLibrary] = useState("All");
	const [selectedType, setSelectedType] = useState("All");
	const [selectedSection, setSelectedSection] = useState("All");
	const [selectedYear, setSelectedYear] = useState("All");
	const [selectedProgram, setSelectedProgram] = useState("All");
	const [selectedSchool, setSelectedSchool] = useState("All");

	const [libraries, setLibraries] = useState([]);
	const [typeData, setTypeData] = useState([]);
	const [sectionData, setSectionData] = useState([]);
	const [yearData, setYearData] = useState([]);
	const [programData, setProgramData] = useState([]);
	const [schoolData, setSchoolData] = useState([]);

	// MODAL
	const [showBorrowingLimitModal, setShowBorrowingLimitsModal] =
		useState(false);
	const [showManualSearchModal, setShowManualSearchModal] = useState(false);
	const [showExcelImportModal, setShowExcelImportModal] = useState(false);
	const [showTypeModal, setShowTypeModal] = useState(false);
	const [showRemoveModal, setShowRemoveModal] = useState(false);
	const [selectedAccount, setSelectedAccount] = useState({});

	//SCANNER
	const [isScannerOpen, setIsScannerOpen] = useState(false);

	//PAGINATION
	const [pageCursors, setPageCursors] = useState([]);
	const pageLimit = 5;
	const [currentPage, setCurrentPage] = useState(1);
	const [ctrPages, setCtrPage] = useState(1);

	useEffect(() => {
		if (
			!userDetails ||
			(userDetails?.us_level == "USR-1" && selectedLibrary == "All") ||
			(userDetails?.us_level != "USR-1" && !userDetails?.us_liID) ||
			(!type &&
				(type == "personnel" ||
					(type == "patron" &&
						!["USR-5", "USR-6"].includes(userDetails.us_level))))
		)
			return;

		setPath(pathname);
		const unsubscribe = getUserList(
			userDetails?.us_level == "USR-1" ? selectedLibrary : userDetails.us_liID,
			setUserData,
			searchQuery,
			type,
			selectedStatus,
			selectedType,
			selectedSection,
			selectedYear,
			selectedProgram,
			selectedSchool,
			"",
			"",
			setLoading,
			Alert,
			pageLimit,
			setCtrPage,
			pageCursors,
			setPageCursors,
			currentPage,
			false
		);

		return () => {
			if (unsubscribe) unsubscribe();
		};
	}, [
		userDetails,
		currentPage,
		searchQuery,
		selectedStatus,
		selectedType,
		selectedSection,
		selectedYear,
		selectedProgram,
		selectedSchool,
		type,
		selectedLibrary,
	]);

	useEffect(() => {
		if (!userDetails || !type) return;

		getUserAttributeFilters(
			userDetails?.us_level == "USR-1" ? selectedLibrary : userDetails.us_liID,
			type,
			setTypeData,
			setSectionData,
			setYearData,
			setProgramData,
			setSchoolData,
			Alert
		);
	}, [userDetails, type, selectedLibrary]);

	useEffect(() => {
		if (!userDetails || userDetails?.us_level != "USR-1" || !type) return;
		getUserLibraryOptions(setSelectedLibrary, setLibraries, Alert);
	}, [userDetails]);

	return (
		<div className="flex h-screen bg-background transition-colors duration-300">
			<Sidebar userRole="admin" />

			<div className="flex-1 flex flex-col overflow-hidden">
				<Header />

				<main className="flex-1 overflow-auto p-6 pt-24 overflow-auto">
					<div className="mb-8 animate-fade-in">
						<h1 className="font-semibold text-foreground text-[20px]">
							{type && type === "patron" ? "Patrons" : "Personnel"}
						</h1>
						<p className="text-muted-foreground text-[14px]">
							{type === "patron"
								? "Manage students, faculty, and administrator access"
								: "Manage library assistants and librarians"}
						</p>
					</div>

					<Card className="bg-card border-border transition-colors duration-300 animate-slide-up">
						<CardContent className="p-6">
							<div
								className={`flex items-left justify-between mb-4 flex-col 
											${userDetails?.us_level !== "USR-1" ? "sm:flex-row" : "md:flex-col"} 
											lg:flex-row gap-4`}
							>
								<div className="flex items-center flex-1">
									<div className="relative flex-1 max-w-md">
										<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
										<Input
											placeholder="Search user..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className="pl-10 pr-24 h-9 bg-background border-none text-foreground rounded-md shadow-sm"
											style={{ fontSize: "12px" }}
										/>
										<div className="absolute right-16 top-1/2 transform -translate-y-1/2">
											<FiCamera
												onClick={() => setIsScannerOpen(true)}
												className="w-4 h-4 text-muted-foreground"
											/>
										</div>
										<Button
											onClick={() => setShowFilters(!showFilters)}
											variant="ghost"
											className="absolute right-0 top-0 h-full px-3 border-l border-border text-foreground hover:bg-accent rounded-l-none text-[12px]"
										>
											Filter
										</Button>
									</div>
								</div>
								{type &&
									type == "patron" &&
									["USR-2", "USR-3"].includes(userDetails?.us_level) && (
										<Button
											onClick={() => setShowBorrowingLimitsModal(true)}
											className="h-9 bg-primary-custom hover:bg-secondary-custom text-white border-none text-[12px]"
										>
											Limit
										</Button>
									)}

								{userDetails?.us_level == "USR-1" && (
									<div className="flex gap-2">
										<Button
											onClick={() => setShowManualSearchModal(true)}
											variant="outline"
											className="flex items-center gap-2 border-border text-foreground hover:bg-accent h-9 px-4 text-[12px]"
										>
											<FiSearch className="w-4 h-4" />
											Existing Account
										</Button>
										{type && type == "patron" && (
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button className="bg-primary-custom hover:bg-secondary-custom text-white h-9 w-fit text-[12px]">
														<FiPlus className="w-4 h-4 mr-2" />
														Register Patron
														<FiChevronDown className="w-4 h-4 ml-2" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="start" className="w-full">
													<DropdownMenuItem
														className="text-[12px]"
														onClick={() =>
															router.push(
																`account/register?id=${selectedLibrary}&type=patron`
															)
														}
													>
														<FiEdit className="w-4 h-4" />
														Manual Registration
													</DropdownMenuItem>
													<DropdownMenuItem
														className="text-[12px]"
														onClick={() => setShowExcelImportModal(true)}
													>
														<FiFileText className="w-4 h-4" />
														Import Excel
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										)}
										{type && type == "personnel" && (
											<Button
												className="bg-primary-custom hover:bg-secondary-custom text-white h-9 w-fit text-[12px]"
												onClick={() =>
													router.push(
														`account/register?id=${selectedLibrary}&type=personnel`
													)
												}
											>
												Register Personnel
											</Button>
										)}
									</div>
								)}
							</div>

							{(selectedStatus !== "All" ||
								selectedLibrary !== "All" ||
								selectedType !== "All" ||
								selectedYear !== "All" ||
								selectedSection !== "All" ||
								selectedProgram !== "All" ||
								selectedSchool !== "All") && (
								<div className="flex items-center gap-2 mb-8 flex-wrap">
									<span className="text-muted-foreground text-[12px]">
										Active Filters:
									</span>

									{selectedLibrary !== "All" && (
										<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded flex items-center gap-1 text-[12px]">
											Library:{" "}
											{libraries.find((lib) => lib.id === selectedLibrary)
												?.li_name || "Unknown"}
										</span>
									)}

									{selectedStatus !== "All" && (
										<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded flex items-center gap-1 text-[12px]">
											Status: {selectedStatus}
											<FiX
												className="w-3 h-3 cursor-pointer"
												onClick={() => setSelectedStatus("Active")}
											/>
										</span>
									)}

									{selectedType !== "All" && (
										<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded flex items-center gap-1 text-[12px]">
											Type: {selectedType}
											<FiX
												className="w-3 h-3 cursor-pointer"
												onClick={() => setSelectedType("All")}
											/>
										</span>
									)}

									{selectedSection !== "All" && (
										<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded flex items-center gap-1 text-[12px]">
											Section: {selectedSection}
											<FiX
												className="w-3 h-3 cursor-pointer"
												onClick={() => setSelectedSection("All")}
											/>
										</span>
									)}

									{selectedYear !== "All" && (
										<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded flex items-center gap-1 text-[12px]">
											Year: {selectedYear}
											<FiX
												className="w-3 h-3 cursor-pointer"
												onClick={() => setSelectedYear("All")}
											/>
										</span>
									)}

									{selectedProgram !== "All" && (
										<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded  flex items-center gap-1 text-[12px]">
											Program: {selectedProgram}
											<FiX
												className="w-3 h-3 cursor-pointer"
												onClick={() => setSelectedProgram("All")}
											/>
										</span>
									)}

									{selectedSchool !== "All" && (
										<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded flex items-center gap-1 text-[12px]">
											School: {selectedSchool}
											<FiX
												className="w-3 h-3 cursor-pointer"
												onClick={() => setSelectedSchool("All")}
											/>
										</span>
									)}
								</div>
							)}

							<div className="overflow-x-auto">
								<table className="w-full">
									<thead className="bg-muted/30">
										<tr className="border-b border-border">
											{[
												"School ID",
												"Status",
												"Type",
												"Fullname",
												"Email Address",
												"Section",
												"Year",
												"Program",
												"School",
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
										{userData.map((user, index) => (
											<tr
												key={index}
												className={`border-b border-border hover:bg-accent/30 transition-colors ${
													index % 2 === 0 ? "bg-background" : "bg-muted/10"
												}`}
											>
												<td className="py-4 px-6 text-left text-foreground text-[12px] min-w-[120px]">
													{user.us_schoolID}
												</td>
												<td className="py-4 px-6 text-left text-foreground text-[12px] min-w-[70px]">
													<Badge
														className={`${getStatusColor(
															user.us_status
														)} text-[12px]`}
													>
														{user.us_status}
													</Badge>
												</td>
												<td className="py-4 px-6 text-left text-foreground text-[12px] min-w-[100px]">
													{user.us_type}
												</td>
												<td className="py-4 px-6 text-left text-foreground text-[12px] min-w-[250px]">
													{user.us_name}
												</td>
												<td className="py-4 px-6 text-left text-foreground text-[12px] min-w-[200px]">
													{user.us_email}
												</td>
												<td className="py-4 px-6 text-left text-foreground text-[12px] min-w-[200px]">
													{user.us_section || "NA"}
												</td>
												<td className="py-4 px-6 text-left text-foreground text-[12px] min-w-[200px]">
													{user.us_year || "NA"}
												</td>
												<td className="py-4 px-6 text-left text-foreground text-[12px] min-w-[200px]">
													{user.us_program || "NA"}
												</td>
												<td className="py-4 px-6 text-left text-foreground text-[12px] min-w-[200px]">
													{user.us_school || "NA"}
												</td>
												<td className="py-3 px-4 text-left">
													<div className="flex gap-2">
														<Button
															variant="ghost"
															size="sm"
															className="hover:bg-accent h-8 w-8 p-0"
															onClick={() =>
																router.push(`/account/details?id=${user.us_id}`)
															}
														>
															<ExternalLink className="w-3 h-3" />
														</Button>

														{userDetails?.us_level == "USR-1" &&
															user.us_status == "Active" && (
																<>
																	<Button
																		variant="ghost"
																		size="sm"
																		className="hover:bg-accent h-8 w-8 p-0"
																		onClick={() => {
																			setShowTypeModal(true),
																				setSelectedAccount(user);
																		}}
																	>
																		<FiRepeat className="w-4 h-4 text-blue-500" />
																	</Button>

																	<Button
																		variant="ghost"
																		size="sm"
																		className="hover:bg-accent h-8 w-8 p-0"
																		onClick={() => {
																			setShowRemoveModal(true),
																				setSelectedAccount(user);
																		}}
																	>
																		<FiTrash2 className="w-4 h-4 text-red-500" />
																	</Button>
																</>
															)}
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>

								<EmptyState data={userData} loading={loading} />
							</div>

							<PaginationControls
								ctrPages={ctrPages}
								currentPage={currentPage}
								setCurrentPage={setCurrentPage}
							/>
						</CardContent>
					</Card>

					{showFilters && (
						<div className="fixed inset-0 z-50 transition-opacity duration-300 opacity-100">
							<div
								className="fixed inset-0 bg-black/50"
								onClick={() => setShowFilters(false)}
							/>
							<div className="relative bg-card w-80 h-full shadow-lg transform transition-transform duration-300 translate-x-0 animate-slide-in-left">
								<div className="flex items-center justify-between p-4 border-b border-border text-white bg-primary-custom">
									<h2 className="font-semibold text-white text-[14px]">
										Filters
									</h2>
									<button
										onClick={() => setShowFilters(false)}
										className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
									>
										<FiX className="w-4 h-4" />
									</button>
								</div>

								<div className="p-4 space-y-4 overflow-y-auto h-full pb-24">
									{userDetails?.us_level == "USR-1" && (
										<div className="space-y-2">
											<label className="block font-medium text-foreground text-[12px]">
												Library
											</label>
											<select
												value={selectedLibrary}
												onChange={(e) => setSelectedLibrary(e.target.value)}
												className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent  text-[12px]"
											>
												{libraries.map((library) => (
													<option key={library.id} value={library.id}>
														{library.li_name}
													</option>
												))}
											</select>
										</div>
									)}

									<div className="space-y-2">
										<label className="block font-medium text-foreground  text-[12px]">
											Status
										</label>
										<select
											value={selectedStatus}
											onChange={(e) => setSelectedStatus(e.target.value)}
											className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent  text-[12px]"
										>
											<option value="Active">Active</option>
											<option value="Inactive">Inactive</option>
										</select>
									</div>

									<div className="space-y-2">
										<label className="block font-medium text-foreground  text-[12px]">
											User Type
										</label>
										<select
											value={selectedType}
											onChange={(e) => setSelectedType(e.target.value)}
											className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
										>
											<option value="All">All</option>
											{typeData.map((group, i) => (
												<optgroup key={i} label={group.label}>
													{group.options.map((type, idx) => (
														<option key={idx} value={type}>
															{type}
														</option>
													))}
												</optgroup>
											))}
										</select>
									</div>

									<div className="space-y-2">
										<label className="block font-medium text-foreground  text-[12px]">
											Section
										</label>
										<select
											value={selectedSection}
											onChange={(e) => setSelectedSection(e.target.value)}
											className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent  text-[12px]"
										>
											<option value="All">All</option>
											{sectionData.map((section, index) => (
												<option key={index} value={section}>
													{section}
												</option>
											))}
										</select>
									</div>

									<div className="space-y-2">
										<label className="block font-medium text-foreground  text-[12px]">
											Year
										</label>
										<select
											value={selectedYear}
											onChange={(e) => setSelectedYear(e.target.value)}
											className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent  text-[12px]"
										>
											<option value="All">All</option>
											{yearData.map((year, index) => (
												<option key={index} value={year}>
													{year}
												</option>
											))}
										</select>
									</div>

									<div className="space-y-2">
										<label className="block font-medium text-foreground  text-[12px]">
											Program
										</label>
										<select
											value={selectedProgram}
											onChange={(e) => setSelectedProgram(e.target.value)}
											className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent  text-[12px]"
										>
											<option value="All">All</option>
											{programData.map((program, index) => (
												<option key={index} value={program}>
													{program}
												</option>
											))}
										</select>
									</div>

									<div className="space-y-2">
										<label className="block font-medium text-foreground  text-[12px]">
											School
										</label>
										<select
											value={selectedSchool}
											onChange={(e) => setSelectedSchool(e.target.value)}
											className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent  text-[12px]"
										>
											<option value="All">All</option>
											{schoolData.map((school, index) => (
												<option key={index} value={school}>
													{school}
												</option>
											))}
										</select>
									</div>
								</div>

								<div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
									<div className="flex space-x-3">
										<Button
											onClick={() => {
												setPageCursors([]);
												setCurrentPage(1);
												setSelectedStatus("Active");
												setSelectedType("All");
												setSelectedSection("All");
												setSelectedYear("All");
												setSelectedProgram("All");
												setSelectedSchool("All");
												setShowFilters(false);
											}}
											variant="outline"
											className="flex-1 h-9 border-border  text-[12px]"
										>
											Clear All
										</Button>
										<Button
											onClick={() => setShowFilters(false)}
											className="flex-1 text-white hover:opacity-90 h-9 bg-primary-custom  text-[12px]"
										>
											Apply Filters
										</Button>
									</div>
								</div>
							</div>
						</div>
					)}
				</main>
			</div>
			{["USR-2", "USR-3"].includes(userDetails?.us_level) && (
				<>
					{/* Borrowing Limits Modal */}
					<BorrowingLimitsModal
						isOpen={showBorrowingLimitModal}
						onClose={() => setShowBorrowingLimitsModal(false)}
					/>
				</>
			)}

			{userDetails?.us_level == "USR-1" && (
				<>
					{/* Manual Search Modal */}
					<ManualSearchModal
						isOpen={showManualSearchModal}
						onClose={() => setShowManualSearchModal(false)}
						userType={type}
						li_id={selectedLibrary}
						modifiedBy={userDetails?.uid}
					/>

					{/* Excel Import Modal */}
					<ExcelImportModal
						isOpen={showExcelImportModal}
						onClose={() => setShowExcelImportModal(false)}
						li_id={selectedLibrary}
						modifiedBy={userDetails?.uid}
					/>

					{/* Type Account Modal */}
					<UserTypeModal
						isOpen={showTypeModal}
						onClose={() => setShowTypeModal(false)}
						li_id={selectedLibrary}
						userData={selectedAccount}
						modifiedBy={userDetails?.uid}
					/>

					{/* Remove Account Modal */}
					<RemoveAccountModal
						isOpen={showRemoveModal}
						onClose={() => {
							setShowRemoveModal(false);
							setSelectedAccount({});
						}}
						li_id={selectedLibrary}
						userData={selectedAccount}
					/>
				</>
			)}
			{/* {Scanner} */}
			<ScannerModal
				isOpen={isScannerOpen}
				onClose={() => setIsScannerOpen(false)}
				setResult={setSearchQuery}
				allowedPrefix="USR"
			/>
		</div>
	);
}
