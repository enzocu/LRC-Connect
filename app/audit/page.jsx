"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
	FiFileText,
	FiBarChart2,
	FiTable,
	FiX,
	FiSearch,
	FiCamera,
} from "react-icons/fi";

import EmptyState from "@/components/tags/empty";
import DocumentPreviewPage from "@/components/tags/documentPreview";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import ProtectedRoute from "@/contexts/ProtectedRoute";
import { useLoading } from "@/contexts/LoadingProvider";

import { ScannerModal } from "@/components/modal/scanner-modal";
import PaginationControls from "@/components/tags/pagination";

import {
	getAudittrail,
	getAuditFilterData,
} from "../../controller/firebase/get/getAudittrail";

const userTypes = [
	{
		group: "Patrons",
		options: ["Student", "Faculty", "Administrator"],
	},
	{
		group: "Assistants",
		options: ["Student Assistant", "Administrative Assistant"],
	},
	{
		group: "Librarians",
		options: ["Chief Librarian", "Head Librarian"],
	},
	{
		group: "Admin",
		options: ["Super Admin"],
	},
];

const actionOptions = [
	{
		label: "CRUD",
		options: [
			{ value: "Create", label: "Create" },
			{ value: "Read", label: "Read" },
			{ value: "Update", label: "Update" },
			{ value: "Delete", label: "Delete" },
		],
	},
	{
		label: "Entry & Exit",
		options: [
			{ value: "Entry", label: "Entry" },
			{ value: "Exit", label: "Exit" },
		],
	},
	{
		label: "Security",
		options: [
			{ value: "Deactive", label: "Deactivate" },
			{ value: "Reset Password", label: "Reset Password" },
		],
	},
	{
		label: "Transaction",
		options: [
			{ value: "Reserved", label: "Reserved" },
			{ value: "Utilized", label: "Utilized" },
			{ value: "Completed", label: "Completed" },
			{ value: "Cancelled", label: "Cancelled" },
			{ value: "Report", label: "Report" },
		],
	},
	{
		label: "Essential Report",
		options: [{ value: "Print", label: "Print" }],
	},
];

export default function AuditPage() {
	const pathname = usePathname();
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const { setLoading, setPath, loading } = useLoading();

	const [auditData, setAuditData] = useState([]);

	const [viewMode, setViewMode] = useState("table");

	// FILTER
	const [showFilters, setShowFilters] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const [libraries, setLibraries] = useState([]);

	const [selectedLibrary, setSelectedLibrary] = useState("All");
	const [selectedStudLibrary, setSelectedStudLibrary] = useState("All");
	const [selectedAction, setSelectedAction] = useState("All");
	const [selectedusType, setSelectedUsType] = useState("All");
	const [selectedStatus, setSelectedStatus] = useState("All");
	const [selectedStartDate, setSelectedStartDate] = useState("All");
	const [selectedEndDate, setSelectedEndDate] = useState("All");

	//SCANNER
	const [isScannerOpen, setIsScannerOpen] = useState(false);

	//PAGINATION
	const [pageCursors, setPageCursors] = useState([]);
	const pageLimit = 10;
	const [currentPage, setCurrentPage] = useState(1);
	const [ctrPages, setCtrPage] = useState(1);

	useEffect(() => {
		setPath(pathname);

		let unsubscribe;

		if (userDetails) {
			unsubscribe = getAudittrail(
				userDetails?.us_level == "USR-1"
					? selectedLibrary
					: userDetails?.us_liID,
				setAuditData,
				searchQuery,
				selectedStudLibrary,
				selectedusType,
				selectedAction,
				selectedStatus,
				selectedStartDate,
				selectedEndDate,

				setLoading,
				Alert,
				setCtrPage,
				pageLimit,
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
		selectedLibrary,
		selectedStudLibrary,
		selectedusType,
		selectedAction,
		selectedStatus,
		selectedStartDate,
		selectedEndDate,
		currentPage,
	]);

	useEffect(() => {
		if (userDetails) {
			getAuditFilterData(setLibraries, Alert);
		}
	}, [userDetails]);

	useEffect(() => {
		if (userDetails?.us_level == "USR-1" && libraries && libraries[0]?.id) {
			setSelectedLibrary(libraries[0]?.id);
		}
	}, [libraries]);

	const getActiveFilters = () => {
		const filters = [];

		if (selectedLibrary !== "All") {
			filters.push({
				key: "library",
				label: "Library",
				value:
					libraries.find((lib) => lib.id === selectedLibrary)?.li_name ||
					"Unknown",
				onClear: () => setSelectedLibrary("All"),
			});
		}

		if (selectedStudLibrary !== "All") {
			filters.push({
				key: "studentlibrary",
				label: "Student Library",
				value:
					libraries.find((lib) => lib.id === selectedStudLibrary)?.li_name ||
					"Unknown",
				onClear: () => setSelectedStudLibrary("All"),
			});
		}

		if (selectedAction !== "All") {
			filters.push({
				key: "actionType",
				label: "Action Type",
				value: selectedAction,
				onClear: () => setSelectedAction("All"),
			});
		}

		if (selectedusType !== "All") {
			filters.push({
				key: "usType",
				label: "User Type",
				value: selectedusType,
				onClear: () => setSelectedUsType("All"),
			});
		}

		if (selectedStatus !== "All") {
			filters.push({
				key: "status",
				label: "Status",
				value: selectedStatus,
				onClear: () => setSelectedStatus("All"),
			});
		}

		if (selectedStartDate !== "All") {
			filters.push({
				key: "startDate",
				label: "Start Date",
				value: formatDate(selectedStartDate),
				onClear: () => setSelectedStartDate("All"),
			});
		}

		if (selectedEndDate !== "All") {
			filters.push({
				key: "endDate",
				label: "End Date",
				value: formatDate(selectedEndDate),
				onClear: () => setSelectedEndDate("All"),
			});
		}
		return filters;
	};

	const formatDate = (dateString) => {
		if (dateString === "All") return "All";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "High":
				return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
			case "Medium":
				return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
			case "Low":
				return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
		}
	};

	const renderChartPlaceholder = () => {
		return (
			<div className="flex items-center justify-center h-64 bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/30">
				<div className="text-center">
					<FiBarChart2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
					<p className="text-muted-foreground text-[14px]">
						Chart view coming soon
					</p>
					<p className="text-muted-foreground/70 mt-1 text-[12px]">
						Visual representation will be available in future updates
					</p>
				</div>
			</div>
		);
	};

	const renderTableContent = () => {
		return (
			<table className="w-full">
				<thead className="bg-muted/30">
					<tr className="border-b border-border">
						{[
							"Timestamp",
							"School ID",
							"Type",
							"Fullname",
							"Library",
							"Action Type",
							"Description",
							"Status",
							"IP Address",
							"Device",
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
					{auditData?.map((audit, index) => (
						<tr
							key={index}
							className={`border-b border-border hover:bg-accent/30 transition-colors `}
						>
							<td className="py-4 px-6 text-left text-foreground text-[12px] min-w-[150px]">
								{audit?.au_createdAtFormatted}
							</td>
							<td className="py-4 px-6 text-left text-foreground text-[12px] min-w-[120px]">
								{audit?.au_schoolId}
							</td>
							<td className="py-4 px-6 text-left text-foreground text-[12px] min-w-[100px]">
								{audit?.au_userType}
							</td>
							<td className="py-4 px-6 text-left text-foreground text-[12px] min-w-[180px]">
								{audit?.au_fullname}
							</td>
							<td className="py-4 px-6 text-left text-foreground text-[12px] min-w-[150px]">
								{audit?.au_library}
							</td>
							<td className="py-4 px-6 text-left text-foreground text-[12px] min-w-[130px]">
								{audit?.au_actionType}
							</td>
							<td className="py-4 px-6 text-left text-foreground text-[12px] min-w-[350px] max-w-[600px]">
								{audit?.au_description}
							</td>
							<td className="py-4 px-6 text-left text-[12px] min-w-[80px]">
								<Badge
									className={getStatusColor(audit?.au_status)}
									style={{ fontSize: "11px" }}
								>
									{audit?.au_status}
								</Badge>
							</td>
							<td className="py-4 px-6 text-left text-foreground text-[12px] min-w-[120px]">
								{audit?.au_ipAddress}
							</td>
							<td className="py-4 px-6 text-left text-foreground text-[12px] min-w-[140px]">
								{audit?.au_device}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		);
	};

	return (
		<ProtectedRoute allowedRoles={["USR-1", "USR-2", "USR-3"]}>
			{viewMode === "export" ? (
				<DocumentPreviewPage
					title={`System Activity Log (${auditData?.length} events)`}
					activeFilters={getActiveFilters()}
					renderTable={renderTableContent}
					setViewMode={setViewMode}
					userDetails={userDetails}
					Alert={Alert}
				/>
			) : (
				<div className="flex h-screen bg-background transition-colors duration-300">
					<Sidebar userRole="admin" />

					<div className="flex-1 flex flex-col overflow-hidden">
						<Header />

						<main className="flex-1 overflow-auto p-6 pt-24 overflow-auto">
							<div className="mb-8 animate-fade-in">
								<h1 className="font-semibold text-foreground text-[20px]">
									Audit Trail
								</h1>
								<p className="text-muted-foreground text-[14px]">
									Track and monitor all system activities, user actions, and
									security events
								</p>
							</div>

							<Card className="p-6 bg-card border-border transition-colors duration-300 animate-slide-up animation-delay-400 ">
								<CardHeader className="p-0">
									<CardTitle className="font-semibold text-foreground text-[18px] mb-6">
										{`System Activity Log (${auditData?.length} events)`}
									</CardTitle>
									<div className="flex items-left justify-between flex-col sm:flex-row gap-4">
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

										<div className="flex items-center gap-2">
											<div className="flex items-center border border-border rounded-md">
												<Button
													variant={viewMode === "table" ? "default" : "ghost"}
													size="sm"
													onClick={() => setViewMode("table")}
													className={`text-[12px] h-9 px-3 rounded-r-none ${
														viewMode === "table"
															? "bg-primary-custom text-white hover:bg-primary-custom/90"
															: "hover:bg-accent"
													}`}
												>
													<FiTable className="w-4 h-4 mr-1" />
													Table
												</Button>
												<Button
													variant={viewMode === "chart" ? "default" : "ghost"}
													size="sm"
													onClick={() => setViewMode("chart")}
													className={`text-[12px] h-9 px-3 rounded-l-none ${
														viewMode === "chart"
															? "bg-primary-custom text-white hover:bg-primary-custom/90"
															: "hover:bg-accent"
													}`}
												>
													<FiBarChart2 className="w-4 h-4 mr-1" />
													Chart
												</Button>
											</div>

											<Button
												onClick={() => setViewMode("export")}
												variant="outline"
												size="sm"
												className="h-9 bg-transparent border-border hover:bg-accent text-[12px]"
											>
												<FiFileText className="w-4 h-4 mr-1" />
												Preview
											</Button>
										</div>
									</div>

									{/* Active Filters */}
									{getActiveFilters().length > 0 && (
										<div
											className="flex items-center gap-2 mb-8 flex-wrap"
											style={{ marginTop: "15px" }}
										>
											<span className="text-muted-foreground text-[12px]">
												Active Filters:
											</span>

											{getActiveFilters().map((filter, index) => (
												<span
													key={index}
													className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded flex items-center gap-1 text-[12px]"
												>
													{filter.label}: {filter.value}
													<FiX
														className="w-3 h-3 cursor-pointer"
														onClick={filter.onClear}
													/>
												</span>
											))}
										</div>
									)}
								</CardHeader>

								<CardContent className="p-0 pt-8">
									{viewMode === "table" ? (
										<div className="overflow-x-auto">
											{renderTableContent()}
											<EmptyState data={auditData} loading={loading} />
										</div>
									) : (
										renderChartPlaceholder()
									)}

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
												<label className="block font-medium text-foreground text-[12px]">
													Student Library
												</label>
												<select
													value={selectedStudLibrary}
													onChange={(e) =>
														setSelectedStudLibrary(e.target.value)
													}
													className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent  text-[12px]"
												>
													{libraries.map((library) => (
														<option key={library.id} value={library.id}>
															{library.li_name}
														</option>
													))}
												</select>
											</div>

											<div className="space-y-2">
												<label className="block font-medium text-foreground text-[12px]">
													User Type
												</label>
												<select
													value={selectedusType}
													onChange={(e) => setSelectedUsType(e.target.value)}
													className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9"
													style={{ fontSize: "12px" }}
													required
												>
													<option value="All">Select User Type</option>
													{userTypes.map((group, idx) => (
														<optgroup key={idx} label={group.group}>
															{group.options.map((option, i) => (
																<option key={i} value={option}>
																	{option}
																</option>
															))}
														</optgroup>
													))}
												</select>
											</div>

											<div className="space-y-2">
												<label className="block font-medium text-foreground text-[12px]">
													Action Type
												</label>
												<select
													value={selectedAction}
													onChange={(e) => setSelectedAction(e.target.value)}
													className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9"
													style={{ fontSize: "12px" }}
													required
												>
													<option value="">Select Action Type</option>
													{actionOptions.map((group, index) => (
														<optgroup key={index} label={group.label}>
															{group.options.map((opt) => (
																<option key={opt.value} value={opt.value}>
																	{opt.label}
																</option>
															))}
														</optgroup>
													))}
												</select>
											</div>

											<div className="space-y-2">
												<label className="block font-medium text-foreground  text-[12px]">
													Status
												</label>
												<select
													value={selectedStatus}
													onChange={(e) => setSelectedStatus(e.target.value)}
													className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent  text-[12px]"
												>
													<option value="Low">Low</option>
													<option value="Medium">Medium</option>
													<option value="High">High</option>
												</select>
											</div>

											<div className="space-y-2">
												<label className="block font-medium text-foreground text-[12px]">
													Start Date
												</label>
												<input
													type="date"
													value={selectedStartDate}
													onChange={(e) => setSelectedStartDate(e.target.value)}
													className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
												/>
											</div>

											<div className="space-y-2">
												<label className="block font-medium text-foreground text-[12px]">
													End Date
												</label>
												<input
													type="date"
													value={selectedEndDate}
													onChange={(e) => setSelectedEndDate(e.target.value)}
													className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
												/>
											</div>
										</div>

										<div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
											<div className="flex space-x-3">
												<Button
													onClick={() => {
														setPageCursors([]);
														setCurrentPage(1);
														setSelectedLibrary("All");
														setSelectedStudLibrary("All");
														setSelectedAction("All");
														setSelectedUsType("All");
														setSelectedStatus("All");
														setSelectedStartDate("All");
														setSelectedEndDate("All");
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

					{/* {Scanner} */}
					<ScannerModal
						isOpen={isScannerOpen}
						onClose={() => setIsScannerOpen(false)}
						setResult={setSearchQuery}
						allowedPrefix="USR"
					/>
				</div>
			)}
		</ProtectedRoute>
	);
}
