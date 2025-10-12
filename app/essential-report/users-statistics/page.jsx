"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BiSort } from "react-icons/bi";

import {
	FiSearch,
	FiFileText,
	FiBarChart2,
	FiTable,
	FiX,
	FiCamera,
} from "react-icons/fi";

import { getStatusColor } from "@/controller/custom/getStatusColor";
import {
	getActiveFiltersUS,
	renderFiltersUS,
	toggleFilterOrderBy,
} from "@/components/tags/essential";
import PaginationControls from "@/components/tags/pagination";
import EmptyState from "@/components/tags/empty";
import DocumentPreviewPage from "@/components/tags/documentPreview";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import ProtectedRoute from "@/contexts/ProtectedRoute";
import { useLoading } from "@/contexts/LoadingProvider";

import { getUserNumber } from "../../../controller/firebase/get/essential-report/user-stats/getUserNumber";
import { getUserSummary } from "../../../controller/firebase/get/essential-report/user-stats/getUserSummary";
import { getUserReport } from "../../../controller/firebase/get/essential-report/user-stats/getUserReport";
import { getTransactionFilter } from "../../../controller/firebase/get/getTransactionList";

import { getUserList } from "@/controller/firebase/get/getUserList";
import { getFilterCourses } from "@/controller/firebase/get/getCourses";
import { getFilterTrackInstituteCourses } from "@/controller/firebase/get/getCourses";

const sections = [
	{ id: "A", title: "Total Number of Users", key: "totalUsersByType" },
	{
		id: "B",
		title: "List of Library Users",
		key: "libraryUsers",
	},
	{
		id: "C",
		title: "Top Users Based on Transaction Activity",
		key: "usersWithMostTransaction",
	},
	{
		id: "D",
		title: "Top Users Based on Associated Reports",
		key: "usersWithMostReports",
	},
];

const defaultFilterValues = {
	a_type: "User Type",
	a_status: "Active",
	a_dateRangeStart: "",
	a_dateRangeEnd: "",
	a_orderBy: "Descending",

	b_role: "Patron",
	b_status: "Active",
	b_userType: "All",
	b_courses: "All",
	b_year: "All",
	b_tracks: "All",
	b_strand: "All",
	b_institute: "All",
	b_program: "All",
	b_section: "",
	b_dateRangeStart: "",
	b_dateRangeEnd: "",

	c_role: "Patron",
	c_status: "Active",
	c_userType: "All",
	c_courses: "All",
	c_year: "All",
	c_tracks: "All",
	c_strand: "All",
	c_institute: "All",
	c_program: "All",
	c_section: "",
	c_libraryList: "All",
	c_resourceType: "All",
	c_materialFormat: "All",
	c_materialList: "All",
	c_drList: "All",
	c_computerList: "All",
	c_dateRangeStart: "",
	c_dateRangeEnd: "",
	c_orderBy: "Descending",

	d_role: "Patron",
	d_status: "Active",
	d_userType: "All",
	d_courses: "All",
	d_year: "All",
	d_tracks: "All",
	d_strand: "All",
	d_institute: "All",
	d_program: "All",
	d_section: "",
	d_libraryList: "All",
	d_dateRangeStart: "",
	d_dateRangeEnd: "",
	d_orderBy: "Descending",
};

export default function UserStatsEssential() {
	const router = useRouter();
	const pathname = usePathname();
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const { setLoading, setPath, loading } = useLoading();

	const [mockData, setMockData] = useState({
		totalUsersByType: [],
		libraryUsers: [],
		usersWithMostTransaction: [],
		usersWithMostReports: [],
	});

	const [activeSection, setActiveSection] = useState("A");
	const [viewMode, setViewMode] = useState("table");

	//FILTERS
	const [searchQuery, setSearchQuery] = useState("");
	const [showFilters, setShowFilters] = useState(false);
	const [filters, setFilters] = useState(defaultFilterValues);

	const [libraryList, setLibraryList] = useState([]);
	const [materialList, setMaterialList] = useState([]);
	const [discussionRoomList, setDiscussionRoomList] = useState([]);
	const [computerList, setComputerList] = useState([]);

	const [selectedCourseID, setSelectedCourseID] = useState("");
	const [filterCoursesData, setFilterCoursesData] = useState([]);
	const [subCoursesData, setSubCoursesData] = useState([]);

	//PAGINATION
	const [pageCursors, setPageCursors] = useState([]);
	const pageLimit = 5;
	const [currentPage, setCurrentPage] = useState(1);
	const [ctrPages, setCtrPage] = useState(1);

	useEffect(() => {
		setPath(pathname);
		const section = sections.find((s) => s.id === activeSection);

		if (userDetails && userDetails?.us_liID) {
			if (section.key == "totalUsersByType") {
				getUserNumber(
					userDetails?.us_liID,
					setMockData,
					searchQuery,
					filters.a_type,
					filters.a_status,
					filters.a_dateRangeStart,
					filters.a_dateRangeEnd,
					filters.a_orderBy,
					setLoading,
					Alert
				);
			} else if (section.key == "libraryUsers") {
				getUserList(
					userDetails?.us_liID,
					setMockData,
					searchQuery,
					filters.b_role,
					filters.b_status,
					filters.b_userType,
					filters.b_courses,
					filters.b_year,
					filters.b_tracks,
					filters.b_strand,
					filters.b_institute,
					filters.b_program,
					filters.b_section,
					filters.b_dateRangeStart,
					filters.b_dateRangeEnd,
					setLoading,
					Alert,
					pageLimit,
					setCtrPage,
					pageCursors,
					setPageCursors,
					currentPage,
					true
				);
			} else if (section.key == "usersWithMostTransaction") {
				getUserSummary(
					userDetails?.us_liID,
					setMockData,
					searchQuery,
					filters.c_role,
					filters.c_status,
					filters.c_userType,
					filters.c_courses,
					filters.c_year,
					filters.c_tracks,
					filters.c_strand,
					filters.c_institute,
					filters.c_program,
					filters.c_section,
					filters.c_libraryList,
					filters.c_resourceType,
					filters.c_materialFormat,
					filters.c_materialList,
					filters.c_drList,
					filters.c_computerList,
					filters.c_dateRangeStart,
					filters.c_dateRangeEnd,
					filters.c_orderBy,
					setLoading,
					Alert,
					pageLimit,
					setCtrPage,
					pageCursors,
					setPageCursors,
					currentPage
				);
			} else if (section.key == "usersWithMostReports") {
				getUserReport(
					userDetails?.us_liID,
					setMockData,
					searchQuery,
					filters.d_role,
					filters.d_status,
					filters.d_userType,
					filters.d_courses,
					filters.d_year,
					filters.d_tracks,
					filters.d_strand,
					filters.d_institute,
					filters.d_program,
					filters.d_section,
					filters.d_libraryList,
					filters.d_dateRangeStart,
					filters.d_dateRangeEnd,
					filters.d_orderBy,
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
		filters.a_type,
		filters.a_status,
		filters.a_dateRangeStart,
		filters.a_dateRangeEnd,
		filters.a_orderBy,

		filters.b_role,
		filters.b_status,
		filters.b_userType,
		filters.b_userType,
		filters.b_courses,
		filters.b_year,
		filters.b_tracks,
		filters.b_strand,
		filters.b_institute,
		filters.b_program,
		filters.b_section,
		filters.b_dateRangeStart,
		filters.b_dateRangeEnd,

		filters.c_role,
		filters.c_status,
		filters.c_userType,
		filters.c_courses,
		filters.c_year,
		filters.c_tracks,
		filters.c_strand,
		filters.c_institute,
		filters.c_program,
		filters.c_section,
		filters.c_libraryList,
		filters.c_resourceType,
		filters.c_materialFormat,
		filters.c_materialList,
		filters.c_drList,
		filters.c_computerList,
		filters.c_dateRangeStart,
		filters.c_dateRangeEnd,
		filters.c_orderBy,

		filters.d_role,
		filters.d_status,
		filters.d_userType,
		filters.d_courses,
		filters.d_year,
		filters.d_tracks,
		filters.d_strand,
		filters.d_institute,
		filters.d_program,
		filters.d_section,
		filters.d_libraryList,
		filters.d_dateRangeStart,
		filters.d_dateRangeEnd,
		filters.d_orderBy,

		currentPage,
		activeSection,
	]);

	useEffect(() => {
		if (userDetails && userDetails?.us_liID) {
			getTransactionFilter(
				userDetails?.us_liID,
				filters.c_resourceType,
				setLibraryList,
				null,
				null,
				setMaterialList,
				setDiscussionRoomList,
				setComputerList,
				Alert
			);
		}
	}, [userDetails, filters.c_resourceType]);

	useEffect(() => {
		if (userDetails && userDetails?.us_liID) {
			setFilters((prev) => ({
				...prev,
				c_libraryList: userDetails?.us_liID.id,
				d_libraryList: userDetails?.us_liID.id,
			}));
		}
	}, [userDetails]);

	//FETCH COURSES
	useEffect(() => {
		if (!userDetails || !activeSection) return;
		const prefix = activeSection.toLowerCase();

		if (
			filters[`${prefix}_courses`] !== "All" &&
			filters[`${prefix}_courses`]
		) {
			getFilterCourses(
				filters[`${prefix}_courses`],
				setFilterCoursesData,
				Alert
			);
		}
	}, [
		userDetails,
		activeSection,
		filters.b_courses,
		filters.c_courses,
		filters.d_courses,
	]);

	useEffect(() => {
		if (selectedCourseID) {
			getFilterTrackInstituteCourses(
				selectedCourseID,
				filterCoursesData,
				setSubCoursesData,
				Alert
			);
		} else {
			setSubCoursesData([]);
		}
	}, [selectedCourseID, filterCoursesData]);

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

		const renderHeaders = () => {
			switch (section.id) {
				case "A":
					return (
						<tr className="border-b border-border">
							<th className={commonHeaderStyle}>Type</th>
							<th className={`${commonHeaderStyle} flex items-center gap-1`}>
								<span>Total Users</span>
								<BiSort
									style={{ cursor: "pointer" }}
									size={14}
									onClick={() => toggleFilterOrderBy("a_orderBy", setFilters)}
								/>
							</th>
							<th className={commonHeaderStyle}>% of Total</th>
						</tr>
					);
				case "B":
					return (
						<tr className="border-b border-border">
							<th className={commonHeaderStyle}>User ID</th>
							<th className={commonHeaderStyle}>Status</th>
							<th className={commonHeaderStyle}>Full Name</th>
							<th className={commonHeaderStyle}>User Type</th>
							<th className={commonHeaderStyle}>Email Address</th>

							<th className={commonHeaderStyle}>Course</th>
							<th className={commonHeaderStyle}>Year</th>
							{filters.b_courses !== "All" && (
								<>
									<th className={commonHeaderStyle}>
										{filters.b_courses === "Senior High School"
											? "Track"
											: "Institute"}
									</th>
									<th className={commonHeaderStyle}>
										{filters.b_courses === "Senior High School"
											? "Strand"
											: "Program"}
									</th>
								</>
							)}

							<th className={commonHeaderStyle}>Section</th>
							<th className={commonHeaderStyle}>Date Added</th>
						</tr>
					);

				case "C":
					return (
						<tr className="border-b border-border">
							<th className={commonHeaderStyle}>User ID</th>
							<th className={commonHeaderStyle}>Full Name</th>
							<th className={commonHeaderStyle}>User Type</th>
							<th className={commonHeaderStyle}>Reserved</th>
							<th className={commonHeaderStyle}>Utilized</th>
							<th className={commonHeaderStyle}>Cancelled</th>
							<th className={commonHeaderStyle}>Completed</th>
							<th className={commonHeaderStyle}>Late Return</th>
							<th className={commonHeaderStyle}>Usage Rate (%)</th>
							<th className={commonHeaderStyle}>Cancel Rate (%)</th>
							<th className={`${commonHeaderStyle} flex items-center gap-1`}>
								<span>Total Transaction</span>
								<BiSort
									size={14}
									onClick={() => toggleFilterOrderBy("c_orderBy", setFilters)}
								/>
							</th>
						</tr>
					);
				case "D":
					return (
						<tr className="border-b border-border">
							<th className={commonHeaderStyle}>User ID</th>
							<th className={commonHeaderStyle}>Full Name</th>
							<th className={commonHeaderStyle}>User Type</th>
							<th className={commonHeaderStyle}>Active Reports</th>
							<th className={commonHeaderStyle}>Reports Resolved</th>
							<th className={commonHeaderStyle}>Waived Reports</th>
							<th className={`${commonHeaderStyle} flex items-center gap-1`}>
								<span>Total Reports</span>
								<BiSort
									size={14}
									onClick={() => toggleFilterOrderBy("d_orderBy", setFilters)}
								/>
							</th>
						</tr>
					);
				default:
					return null;
			}
		};

		const renderRows = () => {
			return data.map((item, index) => {
				switch (section.id) {
					case "A":
						return (
							<tr
								key={index}
								className="border-b border-border hover:bg-muted/30 min-h-[48px]"
							>
								<td className={`${commonCellStyle} font-medium`}>
									{item.es_type}
								</td>
								<td className={`${commonCellStyle} font-medium`}>
									{item.es_total}
								</td>
								<td className={commonCellStyle}>
									<Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-[11px]">
										{item.es_percentage}%
									</Badge>
								</td>
							</tr>
						);

					case "B":
						return (
							<tr
								key={index}
								className="border-b border-border hover:bg-muted/30 min-h-[48px]"
							>
								<td className={`${commonCellStyle} font-medium`}>
									{item.us_schoolID}
								</td>
								<td className={commonCellStyle}>
									<Badge
										className={`${getStatusColor(item.us_status)} text-[12px]`}
									>
										{item.us_status}
									</Badge>
								</td>
								<td className={`${commonCellStyle} font-medium`}>
									{item.us_name}
								</td>
								<td className={`${commonCellStyle}`}>
									<Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-[11px]">
										{item.us_type}
									</Badge>
								</td>
								<td className={`${commonCellStyle}`}>{item.us_email}</td>
								<td className={commonCellStyle}>{item.us_courses}</td>
								<td className={commonCellStyle}>{item.us_year}</td>

								{filters.b_courses !== "All" && (
									<>
										<td className={commonCellStyle}>
											{filters.b_courses === "Senior High School"
												? item.us_tracks
												: item.us_institute}
										</td>
										<td className={commonCellStyle}>
											{filters.b_courses === "Senior High School"
												? item.us_strand
												: item.us_program}
										</td>
									</>
								)}

								<td className={commonCellStyle}>{item.us_section}</td>
								<td className={`${commonCellStyle}`}>{item.us_createdAt}</td>
							</tr>
						);

					case "C":
						return (
							<tr
								key={index}
								className="border-b border-border hover:bg-muted/30 min-h-[48px]"
							>
								<td className={`${commonCellStyle} font-medium`}>
									{item.es_schoolID}
								</td>
								<td className={`${commonCellStyle} font-medium`}>
									{item.es_name}
								</td>
								<td className={commonCellStyle}>
									<Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-[11px]">
										{item.es_type}
									</Badge>
								</td>
								<td className={commonCellStyle}>{item.es_reserved}</td>
								<td className={commonCellStyle}>{item.es_utilized}</td>
								<td className={commonCellStyle}>{item.es_cancelled}</td>
								<td className={commonCellStyle}>{item.es_completed}</td>
								<td className={commonCellStyle}>{item.es_lateReturn}</td>
								<td className={commonCellStyle}>
									<Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-[11px]">
										{item.es_usageRate}%
									</Badge>
								</td>
								<td className={commonCellStyle}>
									<Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-[11px]">
										{item.es_cancelRate}%
									</Badge>
								</td>
								<td className={commonCellStyle}>{item.es_totalTransactions}</td>
							</tr>
						);

					case "D":
						return (
							<tr
								key={index}
								className="border-b border-border hover:bg-muted/30"
							>
								<td className={commonCellStyle}>{item.es_schoolID}</td>
								<td className={commonCellStyle}>{item.es_name}</td>
								<td className={commonCellStyle}>
									<Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-[11px]">
										{item.es_type}
									</Badge>
								</td>
								<td className={commonCellStyle}>{item.es_report}</td>
								<td className={commonCellStyle}>{item.es_resolved}</td>
								<td className={commonCellStyle}>{item.es_waived}</td>
								<td className={commonCellStyle}>{item.es_totalReport}</td>
							</tr>
						);

					default:
						return null;
				}
			});
		};

		return (
			<table className="w-full">
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

	const activeFilters = getActiveFiltersUS(
		filters,
		activeSection,
		libraryList,
		materialList,
		discussionRoomList,
		computerList
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
									Essential Reports - User Statistics
								</h1>
								<p className="text-muted-foreground text-[14px]">
									Comprehensive user analytics, activity tracking, and
									engagement metrics
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
											{renderFiltersUS(
												setFilters,
												filters,
												sections,
												activeSection,
												libraryList,
												materialList,
												discussionRoomList,
												computerList,
												filterCoursesData,
												subCoursesData,
												selectedCourseID,
												setSelectedCourseID
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
												placeholder="Search users..."
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

										<div className="flex items-center gap-2">
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
													className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded  flex items-center gap-1 text-[11px]"
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
