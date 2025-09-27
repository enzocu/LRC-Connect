"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/tags/empty";

import {
	FiArrowLeft,
	FiSearch,
	FiGrid,
	FiList,
	FiX,
	FiCamera,
	FiClock,
	FiCalendar,
	FiUserPlus,
	FiMonitor,
	FiMapPin,
} from "react-icons/fi";
import { IoQrCodeOutline } from "react-icons/io5";
import { ExternalLink, Trophy } from "lucide-react";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import ProtectedRoute from "@/contexts/ProtectedRoute";
import { useLoading } from "@/contexts/LoadingProvider";

import { EnterExitUserModal } from "@/components/modal/enter-exit-user-modal";
import { CodeModal } from "@/components/modal/code-modal";
import { getStatusColor } from "@/controller/custom/getStatusColor";
import { ScannerModal } from "@/components/modal/scanner-modal";
import { VisitRankModal } from "@/components/modal/visit-rank-modal";
import PaginationControls from "@/components/tags/pagination";

import {
	getEntryExitList,
	getUserFilterData,
} from "../../controller/firebase/get/getEntryExitList";

import { secureText } from "../../controller/custom/customFunction.js";

export default function EntryExitPage() {
	const router = useRouter();
	const pathname = usePathname();
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const { setLoading, setPath, loading } = useLoading();

	const [userData, setUserData] = useState([]);
	const [viewType, setViewType] = useState("grid");

	//LEVEL
	const [isPersonnel, setIsPersonnel] = useState(false);

	//FIILTER
	const [showFilters, setShowFilters] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedUsType, setSelectedUsType] = useState("All");
	const [selectedLibrary, setSelectedLibrary] = useState("All");
	const [showLoggedIn, setShowLoggedIn] = useState(true);
	const [selectedStatus, setSelectedStatus] = useState(true);
	const [selectedSection, setSelectedSection] = useState("All");
	const [selectedYear, setSelectedYear] = useState("All");
	const [selectedProgram, setSelectedProgram] = useState("All");
	const [selectedSchool, setSelectedSchool] = useState("All");

	const [liqr, setLibraryQR] = useState("");
	const [library, setLibraryData] = useState([]);
	const [sections, setSectionData] = useState([]);
	const [years, setYearData] = useState([]);
	const [programs, setProgramData] = useState([]);
	const [schools, setSchoolData] = useState([]);

	//SCANNER
	const [isScannerOpen, setIsScannerOpen] = useState(false);
	const [codeOpen, setCodeOpen] = useState(false);
	const [showEnterExitModal, setShowEnterExitModal] = useState(false);
	const [isRankModalOpen, setIsRankModalOpen] = useState(false);

	//PAGINATION
	const [pageCursors, setPageCursors] = useState([]);
	const pageLimit = 5;
	const [currentPage, setCurrentPage] = useState(1);
	const [ctrPages, setCtrPage] = useState(1);

	useEffect(() => {
		setIsPersonnel(!["USR-6"].includes(userDetails?.us_level));
	}, [userDetails]);

	useEffect(() => {
		setPath(pathname);

		let unsubscribe;

		if (userDetails && userDetails?.us_liID) {
			unsubscribe = getEntryExitList(
				!["USR-6"].includes(userDetails?.us_level),
				userDetails?.us_liID,
				userDetails?.uid,
				setUserData,
				searchQuery,
				showLoggedIn,
				selectedStatus,
				selectedLibrary,
				selectedUsType,
				selectedSection,
				selectedYear,
				selectedProgram,
				selectedSchool,
				setLoading,
				Alert,
				pageLimit,
				setCtrPage,
				pageCursors,
				setPageCursors,
				currentPage
			);
		}

		return () => {
			if (typeof unsubscribe === "function") {
				unsubscribe();
			}
		};
	}, [
		userDetails,
		searchQuery,
		showLoggedIn,
		selectedStatus,
		selectedLibrary,
		selectedUsType,
		selectedSection,
		selectedYear,
		selectedProgram,
		selectedSchool,
		currentPage,
	]);

	useEffect(() => {
		if (userDetails && userDetails?.us_liID) {
			getUserFilterData(
				!["USR-6"].includes(userDetails?.us_level),
				userDetails?.us_liID,
				setLibraryQR,
				setLibraryData,
				setSectionData,
				setYearData,
				setProgramData,
				setSchoolData,
				Alert
			);
		}
	}, [userDetails]);

	return (
		<ProtectedRoute
			allowedRoles={["USR-2", "USR-3", "USR-4", "USR-5", "USR-6"]}
		>
			<div className="min-h-screen bg-background transition-colors duration-300">
				<Header />

				<main className="pt-28 pb-6 px-6 sm:px-6 md:px-16 lg:px-[100px] xl:px-[150px]">
					<div className="mb-6 animate-fade-in">
						<button
							onClick={() => router.back()}
							className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit text-[11px]"
						>
							<FiArrowLeft className="w-4 h-4" />
							Back to Previous page
						</button>
					</div>

					<div className="flex flex-col gap-4 md:gap-6  md:flex-col lg:flex-row sm:items-left justify-between mb-8 animate-slide-up">
						<div className="w-fit">
							<h1 className="font-semibold text-foreground text-[20px]">
								{isPersonnel
									? showLoggedIn
										? "Users Currently OnSite"
										: "Users Currently OnApp"
									: showLoggedIn
									? "Currently OnSite"
									: "Currently OnApp"}
							</h1>
							<p className="text-muted-foreground text-[14px]">
								{isPersonnel
									? showLoggedIn
										? "View and manage all users present in the library"
										: "View and manage all users logged into the system"
									: showLoggedIn
									? "View and access your records while present in the library"
									: "View and access your records while logged into the system"}
							</p>
						</div>

						<div className="flex items-center border border-border rounded-md h-fit w-fit">
							<Button
								variant={!showLoggedIn ? "default" : "ghost"}
								size="sm"
								onClick={() => setShowLoggedIn(false)}
								className={`h-9 px-3 rounded-r-none  text-[12px] ${
									!showLoggedIn
										? "bg-primary-custom text-white hover:text-white hover:bg-primary-custom/90"
										: "hover:bg-accent"
								}`}
							>
								<FiMonitor className="w-4 h-4 mr-1" />
								OnApp
							</Button>
							<Button
								variant={showLoggedIn ? "default" : "ghost"}
								size="sm"
								onClick={() => setShowLoggedIn(true)}
								className={`h-9 px-3 rounded-l-none text-[12px] ${
									showLoggedIn
										? "bg-primary-custom text-white hover:text-white hover:bg-primary-custom/90"
										: "hover:bg-accent"
								}`}
							>
								<FiMapPin className="w-4 h-4 mr-1" />
								OnSite
							</Button>
						</div>
					</div>

					<div className="mb-8 animate-slide-up-delay-1">
						<div className="flex items-left justify-between flex-col sm:flex-row gap-4 mb-4">
							<div className="relative flex items-center flex-1 max-w-md">
								<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
								<Input
									placeholder={`Search ${isPersonnel ? "user" : "library"}...`}
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

							<div className="flex items-center gap-2">
								{isPersonnel && (
									<>
										<Button
											onClick={() => setCodeOpen(true)}
											variant="outline"
											size="sm"
											className="h-9 border-border text-foreground hover:bg-accent shadow-sm text-[12px]"
										>
											<IoQrCodeOutline className="w-4 h-4" />
										</Button>
										<Button
											onClick={() => setShowEnterExitModal(true)}
											variant="outline"
											size="sm"
											className="h-9 border-border text-foreground hover:bg-accent shadow-sm text-[12px]"
										>
											<FiUserPlus className="w-4 h-4 mr-2" />
											Entry / Exit user
										</Button>
									</>
								)}
								<Button
									onClick={() => setIsRankModalOpen(true)}
									variant="outline"
									size="sm"
									className="h-9 border-border text-foreground hover:bg-accent shadow-sm text-[12px]"
								>
									<Trophy className="w-4 h-4 mr-2" />
									Rank Board
								</Button>

								<Button
									onClick={() => setViewType("grid")}
									variant={viewType === "grid" ? "default" : "outline"}
									size="sm"
									className={`h-9 border-none  ${
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

						{(selectedLibrary !== "All" ||
							selectedUsType !== "All" ||
							selectedStatus ||
							!selectedStatus ||
							selectedSection !== "All" ||
							selectedYear !== "All" ||
							selectedProgram !== "All" ||
							selectedSchool !== "All") && (
							<div className="flex items-center gap-2 mb-4 flex-wrap">
								<span className="text-muted-foreground text-[11px]">
									Active Filters:
								</span>

								{selectedLibrary !== "All" && (
									<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded flex items-center gap-1  text-[11px]">
										Library:{" "}
										{library.find((lib) => lib.id === selectedLibrary)
											?.li_name || "Unknown"}
										<FiX
											className="w-3 h-3 cursor-pointer"
											onClick={() => setSelectedLibrary("All")}
										/>
									</span>
								)}

								{selectedUsType !== "All" && (
									<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded flex items-center gap-1 text-[11px]">
										Type: {selectedUsType}
										<FiX
											className="w-3 h-3 cursor-pointer"
											onClick={() => setSelectedUsType("All")}
										/>
									</span>
								)}

								<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded flex items-center gap-1 text-[11px]">
									Status: {selectedStatus ? "Active" : "Inactive"}
									<FiX
										className="w-3 h-3 cursor-pointer"
										onClick={() => setSelectedStatus(!selectedStatus)}
									/>
								</span>

								{selectedSection !== "All" && (
									<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded flex items-center gap-1 text-[11px]">
										Section: {selectedSection}
										<FiX
											className="w-3 h-3 cursor-pointer"
											onClick={() => setSelectedSection("All")}
										/>
									</span>
								)}
								{selectedYear !== "All" && (
									<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded  flex items-center gap-1 text-[11px]">
										Year: {selectedYear}
										<FiX
											className="w-3 h-3 cursor-pointer"
											onClick={() => setSelectedYear("All")}
										/>
									</span>
								)}
								{selectedProgram !== "All" && (
									<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded  flex items-center gap-1 text-[11px]">
										Program: {selectedProgram}
										<FiX
											className="w-3 h-3 cursor-pointer"
											onClick={() => setSelectedProgram("All")}
										/>
									</span>
								)}
								{selectedSchool !== "All" && (
									<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded  flex items-center gap-1 text-[11px]">
										School: {selectedSchool}
										<FiX
											className="w-3 h-3 cursor-pointer"
											onClick={() => setSelectedSchool("All")}
										/>
									</span>
								)}
							</div>
						)}
					</div>

					<div className="flex gap-6">
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
										<div className="space-y-2">
											<label className="block font-medium text-foreground text-[11px]">
												Library
											</label>
											<select
												value={selectedLibrary}
												onChange={(e) => setSelectedLibrary(e.target.value)}
												className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[11px]"
											>
												<option value="All">All</option>
												{library.map((lib) => (
													<option key={lib.id} value={lib.id}>
														{lib.li_name}
													</option>
												))}
											</select>
										</div>
										{isPersonnel && (
											<>
												<div className="space-y-2">
													<label className="block font-medium text-foreground text-[11px]">
														User Type
													</label>
													<select
														value={selectedUsType}
														onChange={(e) => setSelectedUsType(e.target.value)}
														className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[11px]"
													>
														<option value="All">All</option>

														<optgroup label="Patrons">
															<option value="Student">Student</option>
															<option value="Faculty">Faculty</option>
															<option value="Administrator">
																Administrator
															</option>
														</optgroup>

														<optgroup label="Assistants">
															<option value="Student Assistant">
																Student Assistant
															</option>
															<option value="Administrative Assistant">
																Administrative Assistant
															</option>
														</optgroup>
														<optgroup label="Librarians">
															<option value="Chief Librarian">
																Chief Librarian
															</option>
															<option value="Head Librarian">
																Head Librarian
															</option>
														</optgroup>
													</select>
												</div>
											</>
										)}

										<div className="space-y-3">
											<label className="block font-medium text-foreground text-[11px]">
												Status Filters
											</label>
											<div className="space-y-2">
												<label className="flex items-center gap-2 cursor-pointer">
													<Checkbox
														checked={selectedStatus}
														onCheckedChange={(checked) =>
															setSelectedStatus(checked)
														}
													/>
													<span className="text-foreground text-[11px]">
														Show only Active
													</span>
												</label>
											</div>
										</div>
										{isPersonnel && (
											<>
												<div className="space-y-2">
													<label className="block font-medium text-foreground text-[11px]">
														Section
													</label>
													<select
														value={selectedSection}
														onChange={(e) => setSelectedSection(e.target.value)}
														className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[11px]"
													>
														<option value="All">All</option>
														{sections.map((section) => (
															<option key={section} value={section}>
																{section}
															</option>
														))}
													</select>
												</div>

												<div className="space-y-2">
													<label className="block font-medium text-foreground text-[11px]">
														Year
													</label>
													<select
														value={selectedYear}
														onChange={(e) => setSelectedYear(e.target.value)}
														className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[11px]"
													>
														<option value="All">All</option>
														{years.map((year) => (
															<option key={year} value={year}>
																{year}
															</option>
														))}
													</select>
												</div>

												<div className="space-y-2">
													<label className="block font-medium text-foreground text-[11px]">
														Program
													</label>
													<select
														value={selectedProgram}
														onChange={(e) => setSelectedProgram(e.target.value)}
														className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[11px]"
													>
														<option value="All">All</option>
														{programs.map((program) => (
															<option key={program} value={program}>
																{program}
															</option>
														))}
													</select>
												</div>

												<div className="space-y-2">
													<label className="block font-medium text-foreground text-[11px]">
														School
													</label>
													<select
														value={selectedSchool}
														onChange={(e) => setSelectedSchool(e.target.value)}
														className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[11px]"
													>
														<option value="All">All</option>
														{schools.map((school) => (
															<option key={school} value={school}>
																{school}
															</option>
														))}
													</select>
												</div>
											</>
										)}
									</div>

									<div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
										<div className="flex space-x-3">
											<Button
												onClick={() => {
													setShowFilters(false);
													setSelectedUsType("All");
													setSelectedLibrary("All");
													setSelectedStatus(true);
													setSelectedSection("All");
													setSelectedYear("All");
													setSelectedProgram("All");
													setSelectedSchool("All");
												}}
												variant="outline"
												className="flex-1 h-9 border-border text-[12px]"
											>
												Clear All
											</Button>
											<Button
												onClick={() => setShowFilters(false)}
												className="flex-1 text-white hover:opacity-90 h-9 bg-primary-custom text-[12px]"
											>
												Apply Filters
											</Button>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Main Content */}
						<div className="flex-1 animate-slide-up-delay-2 overflow-x-auto">
							{viewType === "grid" && (
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ">
									{userData?.map((user, index) => (
										<Card
											key={index}
											className="bg-card border border-border shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary-custom/30 rounded-lg overflow-hidden h-fit relative"
										>
											<CardContent className="p-4 space-y-6">
												{isPersonnel
													? renderuserDetails(user)
													: renderlibraryDetails(user)}

												<div>
													<h5 className="font-medium text-foreground mb-4 text-[13px]">
														In & Out Details
													</h5>
													{renderuserLog(user)}
												</div>

												<div className="border-t border-border pt-4">
													<Button
														onClick={() =>
															router.push(
																isPersonnel
																	? `/account/details?id=${user?.lo_user?.id}`
																	: `/library/details?id=${user?.lo_library?.id}`
															)
														}
														size="sm"
														className=" bg-primary-custom hover:bg-secondary-custom text-white h-9 text-[12px]"
													>
														<ExternalLink className="w-3 h-3 mr-1.5" />
														{isPersonnel ? "View Profile" : "View Library"}
													</Button>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							)}

							{viewType === "table" && (
								<Card className="bg-card border-border transition-colors duration-300 shadow-sm">
									<CardContent className="p-0 overflow-x-auto">
										<table className="w-full">
											<thead className="bg-muted/30">
												<tr className="border-b border-border">
													{[
														"Status",
														isPersonnel ? "User Details" : "Library Details",
														"In & Out Details",
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
												{userData?.map((user, index) => (
													<tr
														key={index}
														className={`border-b border-border hover:bg-accent/30 transition-colors ${
															index % 2 === 0 ? "bg-background" : "bg-muted/10"
														}`}
													>
														<td className="py-4 px-6 text-left text-foreground text-[12px]">
															<Badge
																className={getStatusColor(user?.lo_status)}
																style={{ fontSize: "11px" }}
															>
																{user?.lo_status}
															</Badge>
														</td>

														<td className="py-4 px-6 text-left text-foreground text-[12px]">
															{isPersonnel
																? renderuserDetails(user, true)
																: renderlibraryDetails(user, true)}
														</td>
														<td className="py-4 px-6 text-left text-foreground text-[12px] min-w-[350px]">
															{renderuserLog(user)}
														</td>

														<td className="py-4 px-6 text-left text-foreground text-[12px]">
															<Button
																onClick={() =>
																	router.push(
																		isPersonnel
																			? `/account/details?id=${user?.lo_user.id}`
																			: `/library/details?id=${user?.lo_library.id}`
																	)
																}
																size="sm"
																className="bg-primary-custom hover:bg-secondary-custom text-white h-9 text-[12px]"
															>
																<ExternalLink className="w-3 h-3 mr-1.5" />
																{isPersonnel ? "View Profile" : "View Library"}
															</Button>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</CardContent>
								</Card>
							)}

							<EmptyState data={userData} loading={loading} />
							<PaginationControls
								ctrPages={ctrPages}
								currentPage={currentPage}
								setCurrentPage={setCurrentPage}
							/>
						</div>
					</div>
				</main>
				<EnterExitUserModal
					isOpen={showEnterExitModal}
					onClose={() => setShowEnterExitModal(false)}
					li_id={userDetails?.us_liID}
					us_id={userDetails?.uid}
				/>

				<VisitRankModal
					isOpen={isRankModalOpen}
					onClose={() => setIsRankModalOpen(false)}
					showMode={showLoggedIn}
					libraryData={isPersonnel ? [] : library}
				/>

				<ScannerModal
					isOpen={isScannerOpen}
					onClose={() => setIsScannerOpen(false)}
					setResult={setSearchQuery}
					allowedPrefix={isPersonnel ? "USR" : "LIB"}
				/>
				<CodeModal
					isOpen={codeOpen}
					onClose={() => setCodeOpen(false)}
					value={secureText("encrypt", liqr)}
				/>
			</div>
		</ProtectedRoute>
	);
}

export const renderuserDetails = (user, isTable = false) => {
	if (!user) return;
	return (
		<div className="flex items-start gap-4">
			<img
				src={
					user?.lo_user?.us_photoURL || "/placeholder.svg?height=40&width=40"
				}
				alt="user"
				className="w-14 h-14 rounded-full object-cover bg-gray-100  flex-shrink-0"
			/>

			<div className="min-w-0">
				<h4
					className={`text-foreground font-medium break-words whitespace-normal  ${
						isTable ? "text-[12px]" : "text-[14px]"
					}`}
				>
					{user?.lo_user?.us_name || "user Name"}
				</h4>
				<p className="text-primary-custom text-[12px] mb-2 break-words whitespace-normal">
					{user?.lo_user?.us_type || "Type"}
					<span className="text-muted-foreground break-words whitespace-normal">
						{" • "}
						{user?.lo_user?.us_schoolID || "ID"}
					</span>
				</p>
				<div className="mb-2">
					<p className="text-foreground text-[12px]">Email</p>
					<p className="text-muted-foreground text-[12px] break-words whitespace-normal">
						{user?.lo_user?.us_email || "NA"}
					</p>
				</div>
				<div>
					<p className="text-foreground text-[12px]">Library</p>
					<p className="text-muted-foreground text-[12px] break-words whitespace-normal">
						{user?.lo_user?.us_library || "NA"}
					</p>
				</div>
			</div>
			{!isTable && (
				<Badge className={`text-[12px] ${getStatusColor(user?.lo_status)}`}>
					{user?.lo_status}
				</Badge>
			)}
		</div>
	);
};

export const renderlibraryDetails = (library, isTable = false) => {
	return (
		<div className="flex items-start gap-4">
			<img
				src={
					library?.lo_library?.li_photoURL ||
					"/placeholder.svg?height=40&width=40"
				}
				alt="library"
				className="w-[90px] h-[90px] rounded-lg object-cover bg-gray-100 flex-shrink-0"
			/>

			<div className="min-w-0">
				<h4
					className={`text-foreground font-medium break-words whitespace-normal  ${
						isTable ? "text-[12px]" : "text-[14px]"
					}`}
				>
					{library?.lo_library?.li_name || "Library Name"}
				</h4>
				<p className="text-primary-custom text-[12px] mb-2 break-words whitespace-normal">
					{library?.lo_library?.li_qr || "QR"}
					<span className="text-muted-foreground break-words whitespace-normal">
						{" • "}
						{library?.lo_library?.li_schoolID || "ID"}
					</span>
				</p>

				<div className="mb-2">
					<p className="text-foreground text-[12px]">School Name</p>
					<p className="text-muted-foreground text-[12px] break-words whitespace-normal">
						{library?.lo_library?.li_schoolName || "NA"}
					</p>
				</div>

				<div>
					<p className="text-foreground text-[12px]">Address</p>
					<p className="text-muted-foreground text-[12px] break-words whitespace-normal">
						{library?.lo_library?.li_address || "NA"}
					</p>
				</div>
			</div>
			{!isTable && (
				<Badge className={`text-[12px] ${getStatusColor(library.lo_status)}`}>
					{library.lo_status}
				</Badge>
			)}
		</div>
	);
};

export const renderuserLog = (user) => {
	return (
		<div className="space-y-4 mb-4">
			<div className="flex items-start gap-3">
				<FiCalendar className="text-foreground text-[15px] mt-[2px]" />
				<div>
					<p className="text-foreground text-[12px] break-words whitespace-normal">
						{user?.lo_createdAt || "NA"}
					</p>
					<p className="text-muted-foreground text-[12px]">Date</p>
				</div>
			</div>

			<div className="grid grid-cols-3 gap-3">
				<div className="flex items-start gap-2">
					<FiClock className="flex-shrink-0 text-foreground text-[15px] mt-[2px]" />
					<div>
						<p className="text-foreground  text-[12px] break-words whitespace-normal">
							{user?.lo_timeIn || "NA"}
						</p>
						<p className="text-muted-foreground text-[12px]">Time In</p>
					</div>
				</div>

				<div className="flex items-start gap-2">
					<FiClock className="flex-shrink-0 text-foreground text-[15px] mt-[2px]" />
					<div>
						<p className="text-foreground  text-[12px] break-words whitespace-normal">
							{user?.lo_timeOut || "NA"}
						</p>
						<p className="text-muted-foreground text-[12px]">Time Out</p>
					</div>
				</div>

				<div className="flex items-start gap-2">
					<FiClock className="flex-shrink-0 text-foreground text-[15px] mt-[2px]" />
					<div>
						<p className="text-foreground text-[12px] break-words whitespace-normal">
							{user?.lo_duration || "NA"}
						</p>
						<p className="text-muted-foreground text-[12px]">Duration</p>
					</div>
				</div>
			</div>
		</div>
	);
};
