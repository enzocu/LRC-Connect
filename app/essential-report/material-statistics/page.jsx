"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BiSort } from "react-icons/bi";
import {
	FiFileText,
	FiBarChart2,
	FiTable,
	FiX,
	FiSearch,
	FiCamera,
} from "react-icons/fi";
import {
	getActiveFiltersMA,
	renderFiltersMA,
	toggleFilterOrderBy,
} from "@/components/tags/essential";
import PaginationControls from "@/components/tags/pagination";
import EmptyState from "@/components/tags/empty";
import DocumentPreviewPage from "@/components/tags/documentPreview";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import ProtectedRoute from "@/contexts/ProtectedRoute";
import { useLoading } from "@/contexts/LoadingProvider";

import { getMaterialSummary } from "../../../controller/firebase/get/essential-report/material-stats/getMaterialSummary";
import {
	getMaterialList,
	getMaterialFilter,
} from "../../../controller/firebase/get/getMaterialList";

const sections = [
	{ id: "A", title: "Summary of Material Usage", key: "summary" },
	{
		id: "B",
		title: "List of Library Materials",
		key: "totalMaterial",
	},
];

const defaultFilterValues = {
	// Section A filters
	a_type: "Material",
	a_userType: "All",
	a_dateRangeStart: "",
	a_dateRangeEnd: "",
	a_orderBy: "Descending",

	// Section B filters
	b_materialStatus: "Active",
	b_materialType: "All",
	b_category: "All",
	b_shelf: "All",
	b_yearRangeStart: "",
	b_yearRangeEnd: "",
	b_orderBy: "Descending",
};

export default function MaterialReports() {
	const pathname = usePathname();
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const { setLoading, setPath, loading } = useLoading();

	const [mockData, setMockData] = useState({
		summary: [],
		totalMaterial: [],
	});
	const [activeSection, setActiveSection] = useState("A");
	const [viewMode, setViewMode] = useState("table");

	//FILTERS
	const [searchQuery, setSearchQuery] = useState("");
	const [showFilters, setShowFilters] = useState(false);
	const [filters, setFilters] = useState(defaultFilterValues);

	const [materialTypes, setMaterialTypes] = useState([]);
	const [categories, setCategory] = useState([]);
	const [shelves, setShelves] = useState([]);

	//PAGINATION
	const [pageCursors, setPageCursors] = useState([]);
	const pageLimit = 3;
	const [currentPage, setCurrentPage] = useState(1);
	const [ctrPages, setCtrPage] = useState(1);

	useEffect(() => {
		setPath(pathname);
		const section = sections.find((s) => s.id === activeSection);

		if (userDetails && userDetails?.us_liID) {
			if (section.key == "summary") {
				getMaterialSummary(
					userDetails?.us_liID,
					setMockData,
					searchQuery,
					filters.a_type,
					filters.a_userType,
					filters.a_dateRangeStart,
					filters.a_dateRangeEnd,
					filters.a_orderBy,
					setLoading,
					Alert,
					pageLimit,
					setCtrPage,
					pageCursors,
					setPageCursors,
					currentPage
				);
			} else if (section.key == "totalMaterial") {
				getMaterialList(
					userDetails?.us_liID,
					filters.b_materialType,
					filters.b_category,
					filters.b_shelf,
					"All",
					filters.b_materialStatus,
					filters.b_yearRangeStart,
					filters.b_yearRangeEnd,
					searchQuery,
					false,
					null,
					"none",
					setMockData,
					setLoading,
					Alert,
					setCtrPage,
					pageLimit,
					pageCursors,
					setPageCursors,
					currentPage,
					true
				);
			}
		}
	}, [
		userDetails,
		searchQuery,
		filters.a_type,
		filters.a_userType,
		filters.a_dateRangeStart,
		filters.a_dateRangeEnd,
		filters.a_orderBy,

		filters.b_materialType,
		filters.b_category,
		filters.b_shelf,
		filters.b_materialStatus,
		filters.b_materialType,
		filters.b_category,
		filters.b_shelf,
		filters.b_yearRangeStart,
		filters.b_yearRangeEnd,

		currentPage,
		activeSection,
	]);

	useEffect(() => {
		setPath(pathname);
		if (userDetails && userDetails?.us_liID) {
			getMaterialFilter(
				userDetails?.us_liID,
				setMaterialTypes,
				setCategory,
				setShelves,
				null,
				Alert
			);
		}
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
			"py-3 px-6 text-foreground text-[12px] min-w-[170px] ";

		const renderHeaders = () => {
			switch (section.id) {
				case "A":
					return (
						<tr className="border-b border-border">
							<th className={commonHeaderStyle}>{filters?.a_type}</th>
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
									style={{ cursor: "pointer" }}
									size={14}
									onClick={() => toggleFilterOrderBy("a_orderBy", setFilters)}
								/>
							</th>
						</tr>
					);

				case "B":
					return (
						<tr className="border-b border-border">
							{[
								"Call Number",
								"Title",
								"Author",
								"Copyright",
								"Description",
								"Copies",
								"Format",
								"Shelf",
								"Material Type",
								"Category",
								"Date Added",
							].map((col) => (
								<th key={col} className={commonHeaderStyle}>
									{col}
								</th>
							))}
						</tr>
					);
			}
		};

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

					case "B":
						return (
							<tr
								key={index}
								className="border-b border-border hover:bg-muted/30 "
							>
								<td className={commonCellStyle}>{item.ma_libraryCall}</td>
								<td className={commonCellStyle}>{item.ma_title}</td>
								<td className={commonCellStyle}>{item.ma_author}</td>
								<td className={commonCellStyle}>{item.ma_copyright}</td>
								<td className={commonCellStyle}>
									{<div className="line-clamp-4"> {item.ma_description}</div>}
								</td>
								<td className={commonCellStyle}>{item.ma_copies}</td>
								<td className={commonCellStyle}>{item.ma_format}</td>
								<td className={commonCellStyle}>{item.ma_shelf}</td>
								<td className={commonCellStyle}>{item.ma_type}</td>
								<td className={commonCellStyle}>{item.ma_category}</td>
								<td className={commonCellStyle}>{item.ma_createdAt}</td>
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

	const activeFilters = getActiveFiltersMA(
		filters,
		activeSection,
		materialTypes,
		categories,
		shelves
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
									Essential Reports - Material Analytics
								</h1>
								<p className="text-muted-foreground text-[14px]">
									Comprehensive material usage reports with detailed analytics
									and insights
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
											className={`h-9 ${
												activeSection === section.id
													? "bg-primary-custom text-white hover:bg-primary-custom/90"
													: "border-border hover:bg-accent"
											} text-[12px]`}
										>
											{section.id}. {section.title}
										</Button>
									))}
								</div>
							</div>

							{/* Sidebar Filters */}
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
											{renderFiltersMA(
												setFilters,
												filters,
												sections,
												activeSection,
												materialTypes,
												categories,
												shelves
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

							<Card className="p-6 bg-card border-border transition-colors duration-300 animate-slide-up animation-delay-400 ">
								<CardHeader className="p-0">
									<CardTitle className="font-semibold text-foreground text-[18px] mb-6">
										{title}
									</CardTitle>

									<div className="flex items-left justify-between flex-col sm:flex-row gap-4">
										<div className="relative flex items-center flex-1 max-w-md">
											<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
											<Input
												placeholder="Search materials..."
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

									{/* Active Filters */}
									{activeFilters.length > 0 && (
										<div
											className="flex items-center gap-2 flex-wrap"
											style={{ marginTop: "15px" }}
										>
											<span className="text-muted-foreground text-[11px]">
												Active Filters:
											</span>
											{activeFilters.map((filter) => (
												<span
													key={filter.key}
													className="no-padding px-2 py-1 bg-primary-custom/10 text-primary-custom rounded flex items-center gap-1 text-[11px]"
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
