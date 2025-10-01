"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IoQrCodeOutline } from "react-icons/io5";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EmptyState from "@/components/tags/empty";
import {
	FiArrowLeft,
	FiSearch,
	FiGrid,
	FiList,
	FiX,
	FiChevronDown,
	FiBook,
	FiCamera,
} from "react-icons/fi";

const statuses = ["Active", "Inactive"];

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import ProtectedRoute from "@/contexts/ProtectedRoute";
import { useLoading } from "@/contexts/LoadingProvider";

import {
	getMaterialList,
	getMaterialFilter,
} from "../../../../../controller/firebase/get/getMaterialList";
import { ScannerModal } from "@/components/modal/scanner-modal";
import { CodeModal } from "@/components/modal/code-modal";
import PaginationControls from "@/components/tags/pagination";
import { ExcelImportModal } from "@/components/modal/excel-import-material";

import {
	renderMaterials,
	renderMaterialsTable,
} from "@/components/tags/material";

export default function MaterialsPage() {
	const router = useRouter();
	const pathname = usePathname();
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const { setLoading, setPath, loading } = useLoading();

	const [viewType, setViewType] = useState("grid");
	const [materialData, setMaterialData] = useState([]);
	const [materialTypes, setMaterialTypes] = useState([]);
	const [categories, setCategory] = useState([]);
	const [shelves, setShelves] = useState([]);

	//SCANNER
	const [isScannerOpen, setIsScannerOpen] = useState(false);
	const [codeOpen, setCodeOpen] = useState(false);

	const [showFilters, setShowFilters] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedStatus, setSelectedStatus] = useState("Active");
	const [selectedType, setSelectedType] = useState("All");
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [selectedShelf, setSelectedShelf] = useState("All");

	const [copyrightYearStart, setCopyrightYearStart] = useState("");
	const [copyrightYearEnd, setCopyrightYearEnd] = useState("");

	//ADVANCED SEARCH
	const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
	const [advancedSearch, setAdvancedSearch] = useState({
		title: "",
		author: "",
		subject: "",
		callNumber: "",
		isbn: "",
		publisher: "",
	});
	const [matchType, setMatchType] = useState("none");

	const [showExcelImportModal, setShowExcelImportModal] = useState(false);

	//PAGINATION
	const [pageCursors, setPageCursors] = useState([]);
	const pageLimit = 5;
	const [currentPage, setCurrentPage] = useState(1);
	const [ctrPages, setCtrPage] = useState(1);

	const groupMaterialsByType = (data) => {
		const grouped = {};

		data.forEach((item) => {
			const type = item.ma_type;
			if (!grouped[type]) {
				grouped[type] = [];
			}
			grouped[type].push(item);
		});

		return grouped;
	};

	useEffect(() => {
		setPath(pathname);
		if (userDetails && userDetails?.us_liID) {
			getMaterialList(
				userDetails?.us_liID,
				selectedType,
				selectedCategory,
				selectedShelf,
				null,
				selectedStatus,
				copyrightYearStart,
				copyrightYearEnd,
				searchQuery,
				showAdvancedSearch,
				advancedSearch,
				matchType,

				setMaterialData,
				setLoading,
				Alert,
				setCtrPage,
				pageLimit,
				pageCursors,
				setPageCursors,
				currentPage
			);
		}
	}, [
		userDetails,
		currentPage,
		selectedStatus,
		selectedType,
		selectedCategory,
		selectedShelf,
		searchQuery,
		copyrightYearStart,
		copyrightYearEnd,
		matchType,
		showExcelImportModal,
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

	return (
		<ProtectedRoute
			allowedRoles={["USR-2", "USR-3", "USR-4", "USR-5", "USR-6"]}
		>
			<div className="min-h-screen bg-background transition-colors duration-300">
				<Header />

				<main className="pt-28 pb-6 px-6 sm:px-6 md:px-16 lg:px-[100px] xl:px-[150px]">
					<button
						onClick={() => router.back()}
						className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit mb-6 animate-fade-in text-[11px]"
					>
						<FiArrowLeft className="w-4 h-4" />
						Back to Previous page
					</button>

					<div className="flex items-left justify-between mb-8 animate-slide-up flex-col sm:flex-row gap-4">
						<div className="w-fit">
							<h1 className="font-semibold text-foreground text-[20px]">
								Material Resources
							</h1>
							<p className="text-muted-foreground text-[14px]">
								Browse and manage all available library resources and materials
							</p>
						</div>

						{userDetails &&
							["USR-2", "USR-3", "USR-4"].includes(userDetails?.us_level) && (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button className="bg-primary text-white hover:opacity-90 h-9 px-4 flex items-center gap-2 w-fit font-normal text-[12px]">
											Register Material
											<FiChevronDown className="w-4 h-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-48">
										<DropdownMenuItem
											onClick={() =>
												router.push("/resources/material/main/register/type")
											}
											className="cursor-pointer text-[12px]"
										>
											Material Type Registration
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() =>
												router.push(
													"/resources/material/main/register/material?type=register"
												)
											}
											className="cursor-pointer text-[12px]"
										>
											Material Registration
										</DropdownMenuItem>

										<DropdownMenuItem
											className="cursor-pointer text-[12px]"
											onClick={() => setShowExcelImportModal(true)}
										>
											Import Material from Excel
										</DropdownMenuItem>
										<DropdownMenuItem className="cursor-pointer text-[12px]">
											Export Material Template (Excel)
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							)}
					</div>

					<div className="mb-8 animate-slide-up-delay-1">
						<div className="flex items-center justify-between mb-4 gap-6">
							<div className="relative flex items-center flex-1 max-w-md">
								<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
								<Input
									placeholder="Search material..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10 pr-28 h-9 bg-background border-none text-foreground rounded-md shadow-sm"
									style={{ fontSize: "12px" }}
								/>

								<div className="absolute right-0 top-0 h-full flex items-center gap-2 pr-2">
									<FiCamera
										className="w-4 h-4 text-muted-foreground cursor-pointer"
										onClick={() => setIsScannerOpen(true)}
									/>
									<Button
										onClick={() => setShowFilters(!showFilters)}
										variant="ghost"
										className="h-8 px-3 border-l border-border text-foreground hover:bg-accent rounded-l-none text-[12px]"
									>
										Filter
									</Button>
								</div>
							</div>

							<div className="flex items-center gap-2">
								{selectedShelf != "All" && (
									<Button
										onClick={() => setCodeOpen(true)}
										variant="outline"
										size="sm"
										className="h-9 border-border text-foreground hover:bg-accent shadow-sm"
									>
										<IoQrCodeOutline className="w-4 h-4" />
									</Button>
								)}
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
									onClick={() => setViewType("material-type")}
									variant={viewType === "material-type" ? "default" : "outline"}
									size="sm"
									className={`h-9 border-none ${
										viewType === "material-type"
											? "bg-primary-custom text-white"
											: "bg-background text-foreground hover:bg-accent shadow-sm"
									}`}
								>
									<FiBook className="w-4 h-4" />
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

						{(selectedType !== "All" ||
							selectedCategory !== "All" ||
							selectedStatus !== "All" ||
							selectedShelf !== "All") && (
							<div className="flex items-center gap-2 mb-4">
								<span className="text-muted-foreground text-[11px]">
									Active Filters:
								</span>
								{selectedType !== "All" && (
									<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded flex items-center gap-1 text-[11px]">
										Type:{" "}
										{materialTypes.find((type) => type.id === selectedType)
											?.mt_name || "Unknown"}
										<FiX
											className="w-3 h-3 cursor-pointer"
											onClick={() => setSelectedType("All")}
										/>
									</span>
								)}
								{selectedCategory !== "All" && (
									<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded flex items-center gap-1 text-[11px]">
										Category:{" "}
										{categories.find(
											(category) => category.id === selectedCategory
										)?.ca_name || "Unknown"}
										<FiX
											className="w-3 h-3 cursor-pointer"
											onClick={() => setSelectedCategory("All")}
										/>
									</span>
								)}

								{selectedShelf !== "All" && (
									<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded flex items-center gap-1 text-[11px]">
										Shelf:{" "}
										{shelves.find((shelf) => shelf.id === selectedShelf)
											?.sh_name || "Unknown"}
										<FiX
											className="w-3 h-3 cursor-pointer"
											onClick={() => setSelectedShelf("All")}
										/>
									</span>
								)}
								{selectedStatus !== "All" && (
									<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded flex items-center gap-1 text-[11px]">
										Status: {selectedStatus}
									</span>
								)}

								{copyrightYearStart !== "" && (
									<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded flex items-center gap-1 text-[11px]">
										Year Start: {copyrightYearStart}{" "}
										<FiX
											className="w-3 h-3 cursor-pointer"
											onClick={() => setCopyrightYearStart("")}
										/>
									</span>
								)}

								{copyrightYearEnd !== "" && (
									<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded flex items-center gap-1 text-[11px]">
										Year End: {copyrightYearEnd}{" "}
										<FiX
											className="w-3 h-3 cursor-pointer"
											onClick={() => setCopyrightYearEnd("")}
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

									<div className="p-4 space-y-4 overflow-y-auto h-full pb-44">
										{/* Advanced Search Toggle */}
										<div className="space-y-4 pb-4 border-b border-border">
											<div className="flex items-center space-x-2">
												<input
													type="checkbox"
													id="advancedSearch"
													checked={showAdvancedSearch}
													onChange={(e) =>
														setShowAdvancedSearch(e.target.checked)
													}
													className="w-4 h-4 text-primary-custom bg-card border-border rounded focus:ring-primary-custom focus:ring-2"
												/>
												<label
													htmlFor="advancedSearch"
													className="font-medium text-foreground text-[12px]"
												>
													Advanced Search
												</label>
											</div>

											{showAdvancedSearch && (
												<div className="space-y-4 pl-6 border-l-2 border-primary-custom/20">
													<div className="space-y-2">
														<label className="block font-medium text-foreground text-[12px]">
															Title
														</label>
														<Input
															placeholder="Enter title..."
															value={advancedSearch.title}
															onChange={(e) =>
																setAdvancedSearch((prev) => ({
																	...prev,
																	title: e.target.value,
																}))
															}
															className="h-9 bg-card text-foreground border-border"
															style={{ fontSize: "12px" }}
														/>
													</div>

													<div className="space-y-2">
														<label className="block font-medium text-foreground text-[12px]">
															Author
														</label>
														<Input
															placeholder="Enter author..."
															value={advancedSearch.author}
															onChange={(e) =>
																setAdvancedSearch((prev) => ({
																	...prev,
																	author: e.target.value,
																}))
															}
															className="h-9 bg-card text-foreground border-border"
															style={{ fontSize: "12px" }}
														/>
													</div>

													<div className="space-y-2">
														<label className="block font-medium text-foreground text-[12px]">
															Subject
														</label>
														<Input
															placeholder="Enter subject..."
															value={advancedSearch.subject}
															onChange={(e) =>
																setAdvancedSearch((prev) => ({
																	...prev,
																	subject: e.target.value,
																}))
															}
															className="h-9 bg-card text-foreground border-border"
															style={{ fontSize: "12px" }}
														/>
													</div>

													<div className="space-y-2">
														<label className="block font-medium text-foreground text-[12px]">
															Call Number
														</label>
														<Input
															placeholder="Enter call number..."
															value={advancedSearch.callNumber}
															onChange={(e) =>
																setAdvancedSearch((prev) => ({
																	...prev,
																	callNumber: e.target.value,
																}))
															}
															className="h-9 bg-card text-foreground border-border"
															style={{ fontSize: "12px" }}
														/>
													</div>

													<div className="space-y-2">
														<label className="block font-medium text-foreground text-[12px]">
															ISBN/ISSN
														</label>
														<Input
															placeholder="Enter ISBN/ISSN..."
															value={advancedSearch.isbn}
															onChange={(e) =>
																setAdvancedSearch((prev) => ({
																	...prev,
																	isbn: e.target.value,
																}))
															}
															className="h-9 bg-card text-foreground border-border"
															style={{ fontSize: "12px" }}
														/>
													</div>

													<div className="space-y-2">
														<label className="block font-medium text-foreground text-[12px]">
															Publisher
														</label>
														<Input
															placeholder="Enter publisher..."
															value={advancedSearch.publisher}
															onChange={(e) =>
																setAdvancedSearch((prev) => ({
																	...prev,
																	publisher: e.target.value,
																}))
															}
															className="h-9 bg-card text-foreground border-border"
															style={{ fontSize: "12px" }}
														/>
													</div>

													<div className="space-y-2">
														<label className="block font-medium text-foreground text-[12px]">
															Match Type
														</label>
														<div className="flex space-x-4">
															<label className="flex items-center space-x-2">
																<input
																	type="radio"
																	name="matchType"
																	value="all"
																	checked={matchType === "all"}
																	onChange={(e) => setMatchType(e.target.value)}
																	className="w-3 h-3 text-primary-custom bg-card border-border focus:ring-primary-custom focus:ring-2"
																/>
																<span className="text-foreground text-[12px]">
																	Match All (AND)
																</span>
															</label>
															<label className="flex items-center space-x-2">
																<input
																	type="radio"
																	name="matchType"
																	value="any"
																	checked={matchType === "any"}
																	onChange={(e) => setMatchType(e.target.value)}
																	className="w-3 h-3 text-primary-custom bg-card border-border focus:ring-primary-custom focus:ring-2"
																/>
																<span className="text-foreground text-[12px]">
																	Match Any (OR)
																</span>
															</label>
														</div>
													</div>
												</div>
											)}
										</div>

										<div className="space-y-2">
											<label className="block font-medium text-foreground text-[12px]">
												Material Type
											</label>
											<select
												value={selectedType}
												onChange={(e) => setSelectedType(e.target.value)}
												className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
											>
												<option value="All">Select Material Type</option>
												{materialTypes.map((type, index) => (
													<option key={index} value={type.id}>
														{type.mt_name}
													</option>
												))}
											</select>
										</div>

										<div className="space-y-2">
											<label className="block font-medium text-foreground text-[12px]">
												Category
											</label>
											<select
												value={selectedCategory}
												onChange={(e) => setSelectedCategory(e.target.value)}
												className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
											>
												<option value="All">Select Category</option>
												{categories.map((category, index) => (
													<option key={index} value={category.id}>
														{category.ca_name}
													</option>
												))}
											</select>
										</div>
										<div className="space-y-2">
											<label className="block font-medium text-foreground text-[12px]">
												Shelves
											</label>
											<select
												value={selectedShelf}
												onChange={(e) => setSelectedShelf(e.target.value)}
												className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
											>
												<option value="All">Select Shelf</option>
												{shelves.map((shelf, index) => (
													<option key={index} value={shelf.id}>
														{shelf.sh_name}
													</option>
												))}
											</select>
										</div>

										<div className="space-y-2">
											<label className="block font-medium text-foreground text-[12px]">
												Status
											</label>
											<select
												value={selectedStatus}
												onChange={(e) => setSelectedStatus(e.target.value)}
												className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
											>
												{statuses.map((status) => (
													<option key={status} value={status}>
														{status}
													</option>
												))}
											</select>
										</div>

										<div className="space-y-2">
											<label className="block font-medium text-foreground text-[12px]">
												Copyright Year Range
											</label>
											<div className="flex space-x-2">
												<div className="flex-1">
													<Input
														placeholder="Start year..."
														value={copyrightYearStart}
														onChange={(e) =>
															setCopyrightYearStart(e.target.value)
														}
														className="h-9 bg-card text-foreground border-border"
														style={{ fontSize: "12px" }}
														type="number"
														min="1900"
														max="2030"
													/>
												</div>
												<div className="flex-1">
													<Input
														placeholder="End year..."
														value={copyrightYearEnd}
														onChange={(e) =>
															setCopyrightYearEnd(e.target.value)
														}
														className="h-9 bg-card text-foreground border-border"
														style={{ fontSize: "12px" }}
														type="number"
														min="1900"
														max="2030"
													/>
												</div>
											</div>
										</div>
									</div>

									<div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
										<div className="flex space-x-3">
											<Button
												onClick={() => {
													setPageCursors([]);
													setCurrentPage(1);
													setSelectedType("All");
													setSelectedCategory("All");
													setSelectedStatus("Active");
													setSelectedShelf("All");
													setShowAdvancedSearch(false);
													setAdvancedSearch({
														title: "",
														author: "",
														subject: "",
														callNumber: "",
														isbn: "",
														publisher: "",
													});
													setMatchType("none");
													setCopyrightYearStart("");
													setCopyrightYearEnd("");
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
						<div className="flex-1 animate-slide-up-delay-2 overflow-auto">
							{viewType === "grid" && (
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
									{renderMaterials(materialData, false, false, router)}
								</div>
							)}

							{viewType === "material-type" && (
								<div className="space-y-8">
									{Object.entries(groupMaterialsByType(materialData)).map(
										([type, materials], index) => {
											if (materials.length === 0) return null;

											return (
												<div key={index}>
													<div className="flex items-start gap-6  mb-4">
														<div className="flex flex-wrap items-center gap-2">
															<h3 className="font-semibold text-foreground text-[16px]">
																{type}
															</h3>
															<span className="text-muted-foreground text-[12px]">
																({materials.length} items)
															</span>
														</div>
														<Button
															variant="link"
															size="sm"
															className="ml-auto text-primary-custom h-6 p-0"
															style={{ fontSize: "12px" }}
														>
															See All
														</Button>
													</div>
													{renderMaterials(materials, false, true, router)}
												</div>
											);
										}
									)}
								</div>
							)}

							{viewType === "table" && (
								<>{renderMaterialsTable(materialData, false, router)}</>
							)}

							<EmptyState data={materialData} loading={loading} />

							<PaginationControls
								ctrPages={ctrPages}
								currentPage={currentPage}
								setCurrentPage={setCurrentPage}
							/>
						</div>
					</div>
					<ScannerModal
						isOpen={isScannerOpen}
						onClose={() => setIsScannerOpen(false)}
						setResult={setSearchQuery}
						allowedPrefix="MTL"
					/>

					<CodeModal
						isOpen={codeOpen}
						onClose={() => setCodeOpen(false)}
						value={
							shelves.find((shelf) => shelf.id === selectedShelf)?.sh_qr ||
							"Unknown"
						}
					/>

					{/* Excel Import Modal */}
					<ExcelImportModal
						isOpen={showExcelImportModal}
						onClose={() => setShowExcelImportModal(false)}
						li_id={userDetails?.us_liID}
						modifiedBy={userDetails?.uid}
						Alert={Alert}
					/>
				</main>
			</div>
		</ProtectedRoute>
	);
}
