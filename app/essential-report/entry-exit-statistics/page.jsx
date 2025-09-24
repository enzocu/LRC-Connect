"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BiSort } from "react-icons/bi";
import {
	FiBarChart2,
	FiTable,
	FiX,
	FiSearch,
	FiCamera,
	FiMonitor,
	FiMapPin,
	FiFileText,
} from "react-icons/fi";
import {
	getActiveFiltersEE,
	renderFiltersEE,
	toggleFilterOrderBy,
} from "@/components/tags/essential";
import PaginationControls from "@/components/tags/pagination";
import EmptyState from "@/components/tags/empty";
import DocumentPreviewPage from "@/components/tags/documentPreview";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import ProtectedRoute from "@/contexts/ProtectedRoute";
import { useLoading } from "@/contexts/LoadingProvider";

import { getTypeBreakdown } from "../../../controller/firebase/get/essential-report/enterexit-stats/getTypeBreakdown";
import {
	getUserBreakdown,
	getUserBreakdownFilter,
} from "../../../controller/firebase/get/essential-report/enterexit-stats/getUserBreakdown";
import { getUserAttributeFilters } from "@/controller/firebase/get/getUserList";

const sections = [
	{
		id: "A",
		title: "Visitor Breakdown by Type",
		key: "visitorBreakdownByType",
	},
	{
		id: "B",
		title: "Visitor Breakdown by User",
		key: "visitorBreakdownByUser",
	},
];

const defaultFilterValues = {
	a_status: "All",
	a_type: "User Type",
	a_libraryList: "All",
	a_dateRangeStart: "",
	a_dateRangeEnd: "",
	a_orderBy: "Descending",

	b_status: "All",
	b_role: "Patron",
	b_userType: "All",
	b_school: "All",
	b_program: "All",
	b_year: "All",
	b_section: "All",
	b_libraryList: "All",
	b_dateRangeStart: "",
	b_dateRangeEnd: "",
	b_orderBy: "Descending",
};

export default function EntryExitReports() {
	const router = useRouter();
	const pathname = usePathname();
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const { setLoading, setPath, loading } = useLoading();

	const [mockData, setMockData] = useState({
		visitorBreakdownByType: [],
		visitorBreakdownByUser: [],
	});

	const [activeSection, setActiveSection] = useState("A");
	const [viewMode, setViewMode] = useState("table");
	const [accessMode, setAccessMode] = useState("onSite");

	//FILTERS
	const [searchQuery, setSearchQuery] = useState("");
	const [showFilters, setShowFilters] = useState(false);
	const [filters, setFilters] = useState(defaultFilterValues);

	const [libraryList, setLibraryList] = useState([]);
	const [sectionData, setSectionData] = useState([]);
	const [yearData, setYearData] = useState([]);
	const [programData, setProgramData] = useState([]);
	const [schoolData, setSchoolData] = useState([]);

	//PAGINATION
	const [pageCursors, setPageCursors] = useState([]);
	const pageLimit = 10;
	const [currentPage, setCurrentPage] = useState(1);
	const [ctrPages, setCtrPage] = useState(1);

	useEffect(() => {
		setPath(pathname);
		const section = sections.find((s) => s.id === activeSection);

		if (userDetails && userDetails.us_liID) {
			if (section.key == "visitorBreakdownByType") {
				getTypeBreakdown(
					userDetails.us_liID,
					setMockData,
					accessMode,
					filters.a_status,
					filters.a_type,
					filters.a_libraryList,
					filters.a_dateRangeStart,
					filters.a_dateRangeEnd,
					filters.a_orderBy,
					setLoading,
					Alert
				);
			} else if (section.key == "visitorBreakdownByUser") {
				getUserBreakdown(
					userDetails.us_liID,
					setMockData,
					searchQuery,
					accessMode,
					filters.b_status,
					filters.b_role,
					filters.b_userType,
					filters.b_school,
					filters.b_program,
					filters.b_year,
					filters.b_section,
					filters.b_libraryList,
					filters.b_dateRangeStart,
					filters.b_dateRangeEnd,
					filters.b_orderBy,
					setLoading,
					Alert,
					pageLimit,
					setCtrPage,
					pageCursors,
					setPageCursors,
					currentPage
				);
			}
		}
	}, [
		userDetails,
		searchQuery,
		accessMode,
		filters.a_status,
		filters.a_type,
		filters.a_libraryList,
		filters.a_dateRangeStart,
		filters.a_dateRangeEnd,
		filters.a_orderBy,

		filters.b_status,
		filters.b_role,
		filters.b_userType,
		filters.b_school,
		filters.b_program,
		filters.b_year,
		filters.b_section,
		filters.b_libraryList,
		filters.b_dateRangeStart,
		filters.b_dateRangeEnd,
		filters.b_orderBy,
		activeSection,
		currentPage,
	]);

	useEffect(() => {
		if (userDetails && userDetails.us_liID) {
			getUserBreakdownFilter(setLibraryList, Alert);
		}
	}, [userDetails]);

	useEffect(() => {
		if (userDetails && userDetails.us_liID) {
			setFilters((prev) => ({
				...prev,
				a_libraryList: userDetails.us_liID.id,
				b_libraryList: userDetails.us_liID.id,
			}));
		}
	}, [userDetails]);

	useEffect(() => {
		if (!userDetails) return;

		getUserAttributeFilters(
			userDetails.us_liID,
			null,
			null,
			setSectionData,
			setYearData,
			setProgramData,
			setSchoolData,
			Alert
		);
	}, [userDetails]);

	const getActiveData = () => {
		const section = sections.find((s) => s.id === activeSection);

		return mockData[section.key] || [];
	};

	const clearFilter = (filterKey) => {
		setFilters((prev) => ({
			...prev,
			[filterKey]: defaultFilterValues[filterKey],
		}));
	};

	const renderTableContent = () => {
		const data = getActiveData();
		const section = sections.find((s) => s.id === activeSection);
		if (!section || !data.length) {
			return <EmptyState data={data} loading={loading} />;
		}

		const commonHeaderStyle =
			"text-left py-3 px-6 font-semibold text-foreground text-[12px]";
		const commonCellStyle =
			"py-3 px-6 text-foreground text-[12px] min-w-[170px]";

		const renderRows = () => {
			return data.map((item, index) => {
				switch (section.id) {
					case "A":
						return (
							<tr
								key={index}
								className="border-b border-border hover:bg-muted/30 "
							>
								<td className={commonCellStyle}>{item.es_type}</td>
								<td className={commonCellStyle}>{item.es_totalVisit}</td>
								<td className={commonCellStyle}>{item.es_totalDuration}</td>
								<td className={commonCellStyle}>
									<Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-[11px]">
										{item.es_averageDuration}
									</Badge>
								</td>
								<td className={commonCellStyle}>
									<Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-[11px]">
										{item.es_percentageDuration}
									</Badge>
								</td>
							</tr>
						);

					case "B":
						return (
							<tr
								key={index}
								className="border-b border-border hover:bg-muted/30 "
							>
								<td className={commonCellStyle}>{item.es_qr}</td>
								<td className={commonCellStyle}>{item.es_name}</td>
								<td className={commonCellStyle}>{item.es_type}</td>
								<td className={commonCellStyle}>{item.es_visits}</td>
								<td className={commonCellStyle}>{item.es_totalDuration}</td>
								<td className={commonCellStyle}>
									<Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-[11px]">
										{item.es_averageDuration}
									</Badge>
								</td>
								<td className={commonCellStyle}>
									<Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-[11px]">
										{item.es_percentageDuration}
									</Badge>
								</td>
							</tr>
						);

					default:
						return null;
				}
			});
		};

		const renderHeaders = () => {
			switch (section.id) {
				case "A":
					return (
						<tr className="border-b border-border">
							<th className={commonHeaderStyle}>Type</th>
							<th className={`${commonHeaderStyle} flex items-center gap-1`}>
								<span>Total Visits</span>
								<BiSort
									style={{ cursor: "pointer" }}
									size={14}
									onClick={() => toggleFilterOrderBy("a_orderBy", setFilters)}
								/>
							</th>
							<th className={commonHeaderStyle}>Overall Duration</th>
							<th className={commonHeaderStyle}>Avg Duration</th>
							<th className={commonHeaderStyle}>% of Overall Duration</th>
						</tr>
					);

				case "B":
					return (
						<tr className="border-b border-border">
							<th className={commonHeaderStyle}>User ID</th>
							<th className={commonHeaderStyle}>Name</th>
							<th className={commonHeaderStyle}>User Type</th>

							<th className={`${commonHeaderStyle} flex items-center gap-1`}>
								<span>Total Visits</span>
								<BiSort
									style={{ cursor: "pointer" }}
									size={14}
									onClick={() => toggleFilterOrderBy("b_orderBy", setFilters)}
								/>
							</th>
							<th className={commonHeaderStyle}>Overall Duration</th>
							<th className={commonHeaderStyle}>Avg Duration</th>
							<th className={commonHeaderStyle}>% of Overall Duration</th>
						</tr>
					);

				default:
					return null;
			}
		};

		return (
			<table className="w-full table-auto">
				<thead className="bg-muted/30">{renderHeaders()}</thead>
				<tbody className="align-top">{renderRows()}</tbody>
			</table>
		);
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

	const activeFilters = getActiveFiltersEE(
		filters,
		sections,
		activeSection,
		libraryList
	);

	const count = getActiveData().length;
	const title = `${
		sections.find((s) => s.id === activeSection)?.title
	} (${count} item${count === 1 ? "" : "s"})`;

	return (
		<ProtectedRoute allowedRoles={["USR-2", "USR-3"]}>
			{viewMode === "export" ? (
				<DocumentPreviewPage
					title={title}
					activeFilters={activeFilters}
					renderTable={renderTableContent}
					setViewMode={setViewMode}
					userDetails={userDetails}
					Alert={Alert}
				/>
			) : (
				<div className="flex h-screen bg-background transition-colors duration-300">
					<Sidebar />

					<div className="flex-1 flex flex-col overflow-hidden">
						<Header />

						<main className="flex-1 overflow-auto p-6 pt-24 overflow-auto">
							<div className="mb-8 animate-fade-in">
								<h1 className="font-semibold text-foreground text-[20px]">
									Essential Reports - Entry & Exit Analytics
								</h1>
								<p className="text-muted-foreground text-[14px]">
									Track library visitor patterns, entry/exit times, and
									occupancy statistics
								</p>
							</div>

							<div className="mb-6 animate-slide-up animation-delay-200">
								<div className="flex flex-wrap gap-2">
									{sections.map((section) => (
										<Button
											key={section.id}
											variant={
												activeSection === section.id ? "default" : "outline"
											}
											size="sm"
											onClick={() => {
												setActiveSection(section.id);
											}}
											className={`h-9 text-[12px] ${
												activeSection === section.id
													? "bg-primary-custom text-white hover:bg-primary-custom/90"
													: "border-border hover:bg-accent"
											}`}
										>
											{section.id}. {section.title}
										</Button>
									))}
								</div>
							</div>

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

										<div className="p-4 space-y-4 overflow-y-auto h-full pb-44">
											{renderFiltersEE(
												setFilters,
												filters,
												sections,
												activeSection,
												libraryList,
												sectionData,
												yearData,
												programData,
												schoolData
											)}
										</div>

										<div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
											<div className="flex space-x-3">
												<Button
													onClick={() => setFilters(defaultFilterValues)}
													variant="outline"
													className="flex-1 h-9 border-border bg-transparent text-[12px]"
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

							<Card className="p-6 bg-card border-border transition-colors duration-300 animate-slide-up animation-delay-400">
								<CardHeader className="p-0">
									<CardTitle className="font-semibold text-foreground text-[18px] mb-6">
										{title}
									</CardTitle>

									<div className="flex items-left justify-between flex-col sm:flex-row gap-4">
										<div className="relative flex items-center flex-1 max-w-md">
											<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
											<Input
												placeholder="Search by visitor details..."
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
												className="pl-10 pr-24 h-9 bg-background border-none text-foreground rounded-md shadow-sm"
												style={{ fontSize: "12px" }}
											/>
											<div className="absolute right-16 top-1/2 transform -translate-y-1/2">
												<FiCamera className="w-4 h-4 text-muted-foreground" />
											</div>
											<Button
												onClick={() => setShowFilters(!showFilters)}
												variant="ghost"
												className="absolute right-0 top-0 h-full px-3 border-l border-border text-foreground hover:bg-accent rounded-l-none text-[12px]"
											>
												Filter
											</Button>
										</div>

										<div className="flex  flex-wrap items-center gap-2">
											<div className="flex items-center border border-border rounded-md">
												<Button
													variant={accessMode === "onapp" ? "default" : "ghost"}
													size="sm"
													onClick={() => setAccessMode("onApp")}
													className={`h-9 px-3 rounded-r-none  text-[12px] ${
														accessMode === "onApp"
															? "bg-primary-custom text-white hover:text-white hover:bg-primary-custom/90"
															: "hover:bg-accent"
													}`}
												>
													<FiMonitor className="w-4 h-4 mr-1" />
													OnApp
												</Button>
												<Button
													variant={
														accessMode === "onsite" ? "default" : "ghost"
													}
													size="sm"
													onClick={() => setAccessMode("onSite")}
													className={`h-9 px-3 rounded-l-none text-[12px] ${
														accessMode === "onSite"
															? "bg-primary-custom text-white hover:text-white hover:bg-primary-custom/90"
															: "hover:bg-accent"
													}`}
												>
													<FiMapPin className="w-4 h-4 mr-1" />
													OnSite
												</Button>
											</div>

											{/* View Mode Toggle */}
											<div className="flex items-center border border-border rounded-md">
												<Button
													variant={viewMode === "table" ? "default" : "ghost"}
													size="sm"
													onClick={() => setViewMode("table")}
													className={`h-9 px-3 rounded-r-none text-[12px] ${
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
													className={`h-9 px-3 rounded-l-none text-[12px] ${
														viewMode === "chart"
															? "bg-primary-custom text-white hover:bg-primary-custom/90"
															: "hover:bg-accent"
													}`}
												>
													<FiBarChart2 className="w-4 h-4 mr-1" />
													Chart
												</Button>
											</div>

											{getActiveData().length > 0 && (
												<Button
													onClick={() => setViewMode("export")}
													variant="outline"
													size="sm"
													className="h-9 bg-transparent border-border hover:bg-accent text-[12px]"
												>
													<FiFileText className="w-4 h-4 mr-1" />
													Preview
												</Button>
											)}
										</div>
									</div>

									{activeFilters.length > 0 && (
										<div
											className="flex items-center gap-2  flex-wrap"
											style={{ marginTop: "15px" }}
										>
											<span className="text-muted-foreground text-[11px]">
												Active Filters:
											</span>
											{activeFilters.map((filter) => (
												<span
													key={filter.key}
													className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded flex items-center gap-1 text-[11px]"
												>
													{filter.label}: {filter.value}
													<FiX
														className="w-3 h-3 cursor-pointer"
														onClick={() => clearFilter(filter.key)}
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
						</main>
					</div>
				</div>
			)}
		</ProtectedRoute>
	);
}
