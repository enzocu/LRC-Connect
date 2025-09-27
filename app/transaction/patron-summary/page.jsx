"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import EmptyState from "@/components/tags/empty";
import {
	FiArrowLeft,
	FiSearch,
	FiGrid,
	FiList,
	FiX,
	FiCamera,
	FiAlertTriangle,
} from "react-icons/fi";
import { ExternalLink } from "lucide-react";
import { PenaltyDetailsModal } from "@/components/modal/penalty-details-modal";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import ProtectedRoute from "@/contexts/ProtectedRoute";
import { useLoading } from "@/contexts/LoadingProvider";

import { ScannerModal } from "@/components/modal/scanner-modal";
import PaginationControls from "@/components/tags/pagination";

import {
	getTransactionSummary,
	getEssentialFilter,
} from "../../../controller/firebase/get/getTransactionSummary";

const studentTypes = [
	"All",
	"Student",
	"Student Assistant",
	"Faculty",
	"Administrator",
];

export default function PatronSummaryPage() {
	const router = useRouter();
	const pathname = usePathname();
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const { setLoading, setPath, loading } = useLoading();

	const [viewType, setViewType] = useState("grid");
	const [transactionData, setTransactionData] = useState([]);
	const [libraryData, setLibraryData] = useState([]);

	//FILTER
	const [showFilters, setShowFilters] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedLibrary, setSelectedLibrary] = useState("All");
	const [selectedStudentType, setSelectedStudentType] = useState("All");
	const [showOverdueOnly, setShowOverdueOnly] = useState(false);
	const [showActivePenaltiesOnly, setShowActivePenaltiesOnly] = useState(false);
	const [sortByTransactions, setSortByTransactions] = useState("none");
	const [sortByPenalties, setSortByPenalties] = useState("none");

	//MODAL
	const [showPenaltyModal, setShowPenaltyModal] = useState(false);
	const [selectedPatronId, setSelectedPatronId] = useState(null);

	//SCANNER
	const [isScannerOpen, setIsScannerOpen] = useState(false);

	//PAGINATION
	const [pageCursors, setPageCursors] = useState([]);
	const pageLimit = 5;
	const [currentPage, setCurrentPage] = useState(1);
	const [ctrPages, setCtrPage] = useState(1);

	const handleViewPenalties = (patronId) => {
		setSelectedPatronId(patronId);
		setShowPenaltyModal(true);
	};

	useEffect(() => {
		setPath(pathname);
		if (userDetails && userDetails?.us_liID) {
			getTransactionSummary(
				userDetails?.us_liID,
				setTransactionData,
				searchQuery,

				selectedLibrary,
				selectedStudentType,
				showOverdueOnly,
				showActivePenaltiesOnly,
				sortByTransactions,
				sortByPenalties,

				setLoading,
				Alert,
				pageLimit,
				setCtrPage,
				pageCursors,
				setPageCursors,
				currentPage
			);
		}
	}, [
		userDetails,
		currentPage,
		searchQuery,
		selectedLibrary,
		selectedStudentType,
		showOverdueOnly,
		showActivePenaltiesOnly,
		sortByTransactions,
		sortByPenalties,
	]);

	useEffect(() => {
		setPath(pathname);

		if (userDetails && userDetails?.us_liID) {
			getEssentialFilter(setLibraryData, Alert);
		}
	}, [userDetails]);

	return (
		<ProtectedRoute allowedRoles={["USR-2", "USR-3", "USR-4"]}>
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

					<div className="mb-8 animate-slide-up">
						<h1 className="font-semibold text-foreground text-[20px]">
							Patron Summary
						</h1>
						<p className="text-muted-foreground text-[14px]">
							Overview of patron transaction history and current status
						</p>
					</div>

					<div className="mb-8 animate-slide-up-delay-1">
						<div className="flex items-center justify-between mb-4 gap-6">
							<div className="relative flex items-center flex-1 max-w-md">
								<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
								<Input
									placeholder="Search patron..."
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

						{(selectedLibrary !== "All" ||
							selectedStudentType !== "All" ||
							showOverdueOnly ||
							showActivePenaltiesOnly ||
							sortByTransactions !== "none" ||
							sortByPenalties !== "none") && (
							<div className="flex items-center gap-2 mb-4 flex-wrap">
								<span className="text-muted-foreground  text-[11px]">
									Active Filters:
								</span>
								{selectedLibrary !== "All" && (
									<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded  flex items-center gap-1 text-[11px]">
										Library:{" "}
										{libraryData.find((lib) => lib.id === selectedLibrary)
											?.li_name || selectedLibrary}
										<FiX
											className="w-3 h-3 cursor-pointer"
											onClick={() => setSelectedLibrary("All")}
										/>
									</span>
								)}

								{selectedStudentType !== "All" && (
									<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded  flex items-center gap-1 text-[11px]">
										Type: {selectedStudentType}
										<FiX
											className="w-3 h-3 cursor-pointer"
											onClick={() => setSelectedStudentType("All")}
										/>
									</span>
								)}
								{showOverdueOnly && (
									<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded  flex items-center gap-1 text-[11px]">
										Overdue Only
										<FiX
											className="w-3 h-3 cursor-pointer"
											onClick={() => setShowOverdueOnly(false)}
										/>
									</span>
								)}
								{showActivePenaltiesOnly && (
									<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded  flex items-center gap-1 text-[11px]">
										Active Penalties Only
										<FiX
											className="w-3 h-3 cursor-pointer"
											onClick={() => setShowActivePenaltiesOnly(false)}
										/>
									</span>
								)}
								{sortByTransactions !== "none" && (
									<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded  flex items-center gap-1 text-[11px]">
										Sort by Transactions:{" "}
										{sortByTransactions === "asc"
											? "Low to High"
											: "High to Low"}
										<FiX
											className="w-3 h-3 cursor-pointer"
											onClick={() => setSortByTransactions("none")}
										/>
									</span>
								)}
								{sortByPenalties !== "none" && (
									<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded  flex items-center gap-1 text-[11px]">
										Sort by Penalties:{" "}
										{sortByPenalties === "asc" ? "Low to High" : "High to Low"}
										<FiX
											className="w-3 h-3 cursor-pointer"
											onClick={() => setSortByPenalties("none")}
										/>
									</span>
								)}
							</div>
						)}
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

								<div className="p-4 space-y-4 overflow-y-auto h-full pb-24">
									<div className="space-y-2">
										<label className="block font-medium text-foreground text-[11px]">
											Student Library
										</label>
										<select
											value={selectedLibrary}
											onChange={(e) => setSelectedLibrary(e.target.value)}
											className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[11px]"
										>
											{libraryData.map((library) => (
												<option key={library.id} value={library.id}>
													{library.li_name}
												</option>
											))}
										</select>
									</div>

									<div className="space-y-2">
										<label className="block font-medium text-foreground text-[11px]">
											Student Type
										</label>
										<select
											value={selectedStudentType}
											onChange={(e) => setSelectedStudentType(e.target.value)}
											className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[11px]"
										>
											{studentTypes.map((type) => (
												<option key={type} value={type}>
													{type}
												</option>
											))}
										</select>
									</div>

									<div className="space-y-3">
										<label className="block font-medium text-foreground text-[11px]">
											Status Filters
										</label>
										<div className="space-y-2">
											<label className="flex items-center gap-2 cursor-pointer text-[11px]">
												<Checkbox
													checked={showOverdueOnly}
													onCheckedChange={setShowOverdueOnly}
												/>
												<span className="text-foreground text-[11px]">
													Show only patrons with overdue items
												</span>
											</label>
											<label className="flex items-center gap-2 cursor-pointer text-[11px]">
												<Checkbox
													checked={showActivePenaltiesOnly}
													onCheckedChange={setShowActivePenaltiesOnly}
												/>
												<span className="text-foreground text-[11px]">
													Show only patrons with active penalties
												</span>
											</label>
										</div>
									</div>

									<div className="space-y-3">
										<label className="block font-medium text-foreground text-[11px]">
											Sort Options
										</label>
										<div className="space-y-2">
											<div className="space-y-1">
												<label className="block text-foreground text-[11px]">
													Total Resources Transacted
												</label>
												<select
													value={sortByTransactions}
													onChange={(e) => {
														setSortByTransactions(e.target.value);
														if (e.target.value !== "none")
															setSortByPenalties("none");
													}}
													className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-8 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[11px]"
												>
													<option value="none">No sorting</option>
													<option value="asc">Low to High</option>
													<option value="desc">High to Low</option>
												</select>
											</div>
											<div className="space-y-1">
												<label className="block text-foreground text-[11px]">
													Total Active Penalties
												</label>
												<select
													value={sortByPenalties}
													onChange={(e) => {
														setSortByPenalties(e.target.value);
														if (e.target.value !== "none")
															setSortByTransactions("none");
													}}
													className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-8 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[11px]"
												>
													<option value="none">No sorting</option>
													<option value="asc">Low to High</option>
													<option value="desc">High to Low</option>
												</select>
											</div>
										</div>
									</div>
								</div>

								<div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
									<div className="flex space-x-3">
										<Button
											onClick={() => {
												setCurrentPage(1);
												setPageCursors([]);
												setSelectedLibrary("All");
												setSelectedStudentType("All");
												setShowOverdueOnly(false);
												setShowActivePenaltiesOnly(false);
												setSortByTransactions("none");
												setSortByPenalties("none");
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
					<div className="animate-slide-up-delay-3">
						{/* Grid View */}
						{viewType === "grid" && (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ">
								{transactionData?.map((patron) =>
									renderPatronCard(patron, handleViewPenalties, router)
								)}
							</div>
						)}

						{viewType === "table" &&
							renderPatronTable(transactionData, handleViewPenalties, router)}

						<EmptyState data={transactionData} loading={loading} />

						<PaginationControls
							ctrPages={ctrPages}
							currentPage={currentPage}
							setCurrentPage={setCurrentPage}
						/>
					</div>

					{/* Penalty Details Modal */}
					<PenaltyDetailsModal
						isOpen={showPenaltyModal}
						onClose={() => setShowPenaltyModal(false)}
						patronId={selectedPatronId}
					/>

					<ScannerModal
						isOpen={isScannerOpen}
						onClose={() => setIsScannerOpen(false)}
						setResult={setSearchQuery}
						allowedPrefix="USR"
					/>
				</main>
			</div>
		</ProtectedRoute>
	);
}

const getStatusColor = (count, type) => {
	if (count === 0) return "text-muted-foreground";

	switch (type) {
		case "overdue":
		case "penalties":
			return count > 0 ? "text-red-600" : "text-muted-foreground";
		default:
			return "text-foreground";
	}
};

const renderPatronCard = (patron, handleViewPenalties, router) => (
	<Card
		key={patron.id}
		className="bg-card border border-border shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary-custom/30 rounded-lg overflow-hidden h-fit"
	>
		<CardContent className="p-4 space-y-4">
			<div className="flex items-start gap-4  pb-4 border-b border-border">
				<div className="relative">
					<img
						src={patron.us_photoURL || "/placeholder.svg"}
						alt={patron.us_name}
						className="w-14 h-14 rounded-full object-cover bg-gray-100 flex-shrink-0"
					/>
					{patron.us_currentOverdue > 0 ||
						(patron.us_activePenalties > 0 && (
							<div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
								<FiAlertTriangle className="w-4 h-4 text-white" />
							</div>
						))}
				</div>
				<div className="flex-1 min-w-0">
					<h4 className="font-medium text-foreground text-[14px]">
						{patron.us_name}
					</h4>

					<p className="text-primary-custom text-[12px]">
						{patron.us_type}
						<span className="text-muted-foreground">
							{" - "}
							{patron.us_schoolID}
						</span>
					</p>
					<p className="text-muted-foreground text-[12px]">
						{patron.us_library}
					</p>
				</div>
				<Button
					variant="ghost"
					size="sm"
					className="hover:bg-accent h-8 w-8 p-0 rounded-full"
					onClick={() => router.push(`/account/details?id=${patron.id}`)}
					title="View Profile"
				>
					<ExternalLink className="w-4 h-4" />
				</Button>
			</div>

			<div>
				<h5 className="font-medium text-foreground mb-4 text-[13px]">
					Transaction Summary
				</h5>

				<div className="grid grid-cols-3 gap-3">
					{[
						["us_reserved", "Reserved"],
						["us_utilized", "Utilized"],
						["us_cancelled", "Cancelled"],
						["us_completed", "Completed"],
						["us_lateReturn", "Late Return"],
						["us_totalTransactions", "Total"],
					].map(([key, label]) => (
						<div className="text-center" key={key}>
							<p
								className={`font-semibold text-[16px] ${getStatusColor(
									patron[key],
									key
								)}`}
							>
								{patron[key]}
							</p>
							<p className="text-muted-foreground text-[11px]">{label}</p>
						</div>
					))}
				</div>
			</div>

			<div>
				<h5 className="font-medium text-foreground mb-4 text-[13px]">
					Current Status
				</h5>

				<div className="grid grid-cols-3 gap-3">
					<div className="text-center">
						<p
							className={`font-semibold text-[16px] ${getStatusColor(
								patron.us_currentOverdue,
								"overdue"
							)}`}
						>
							{patron.us_currentOverdue}
						</p>
						<p className="text-muted-foreground text-[11px]">Overdue</p>
					</div>
					<div className="text-center">
						<p
							className={`font-semibold text-[16px] ${getStatusColor(
								patron.us_activePenalties,
								"penalties"
							)}`}
						>
							{patron.us_activePenalties}
						</p>
						<p className="text-muted-foreground text-[11px]">
							Active Penalties
						</p>
					</div>
				</div>
			</div>

			<div className="pt-4 border-t border-border">
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						className="h-9 bg-transparent text-[12px]"
						onClick={() => handleViewPenalties(patron.id)}
					>
						View Penalties
					</Button>

					<Button
						className="bg-primary-custom hover:bg-secondary-custom text-white h-9 text-[12px]"
						size="sm"
						onClick={() => router.push(`/transaction?paID=${patron.id}`)}
					>
						View Transaction
					</Button>
				</div>
			</div>
		</CardContent>
	</Card>
);

const renderPatronTable = (transactionData, handleViewPenalties, router) => (
	<Card className="bg-card border-border transition-colors duration-300 animate-slide-up">
		<CardContent className="p-0 overflow-x-auto">
			<table className="w-full">
				<thead className="bg-muted/30">
					<tr className="border-b border-border">
						{[
							"Patron",
							"Library",
							"Transaction Summary",
							"Current Status",
							"Actions",
						].map((text) => (
							<th
								key={text}
								className="text-left py-4 px-6 font-semibold text-foreground text-[12px]"
							>
								{text}
							</th>
						))}
					</tr>
				</thead>
				<tbody className="align-top">
					{transactionData?.map((patron, index) => (
						<tr
							key={patron.id}
							className={`border-b border-border hover:bg-accent/30 transition-colors ${
								index % 2 === 0 ? "bg-background" : "bg-muted/10"
							}`}
						>
							<td className="py-4 px-6 min-w-[300px]">
								<div className="flex items-start gap-3">
									<div className="relative flex-shrink-0">
										<img
											src={patron.us_photoURL || "/placeholder.svg"}
											alt={patron.us_name}
											className="w-10 h-10 rounded-full object-cover bg-gray-100 flex-shrink-0"
										/>
										{patron.us_currentOverdue > 0 && (
											<div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
												<FiAlertTriangle className="w-2 h-2 text-white" />
											</div>
										)}
									</div>
									<div>
										<p className="font-medium text-foreground text-[12px]">
											{patron.us_name}
										</p>
										<p className="text-primary-custom text-[11px]">
											{patron.us_type}
											<span className="text-muted-foreground">
												{" • "}
												{patron.us_schoolID}
											</span>
										</p>
									</div>
								</div>
							</td>

							<td className="py-4 px-6 min-w-[250px]">
								<p className="text-muted-foreground text-[12px]">
									{patron.us_library}
								</p>
							</td>

							<td className="py-4 px-6 min-w-[250px]">
								<div className="flex gap-4 text-center">
									{[
										{ key: "us_reserved", label: "Reserved" },
										{ key: "us_utilized", label: "Utilized" },
										{ key: "us_completed", label: "Completed" },
										{ key: "us_totalTransactions", label: "Total" },
									].map(({ key, label }) => (
										<div key={key}>
											<p
												className={`font-semibold text-[14px] ${getStatusColor(
													patron[key],
													key
												)}`}
											>
												{patron[key]}
											</p>
											<p className="text-muted-foreground text-[11px]">
												{label}
											</p>
										</div>
									))}
								</div>
							</td>

							<td className="py-4 px-6 min-w-[250px]">
								<div className="flex gap-4 text-center">
									{[
										{ key: "us_currentOverdue", label: "Overdue" },
										{ key: "us_activePenalties", label: "Penalties" },
										{ key: "us_lateReturn", label: "Late Return" },
									].map(({ key, label }) => (
										<div key={key}>
											<p
												className={`font-semibold text-[14px] ${getStatusColor(
													patron[key],
													key
												)}`}
											>
												{patron[key]}
											</p>
											<p className="text-muted-foreground text-[11px]">
												{label}
											</p>
										</div>
									))}
								</div>
							</td>

							<td className="py-4 px-6">
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										className="h-9 bg-transparent text-[12px]"
										onClick={() => handleViewPenalties(patron.id)}
									>
										Penalties
									</Button>

									<Button
										className="bg-primary-custom hover:bg-secondary-custom text-white h-9 text-[12px]"
										size="sm"
										onClick={() =>
											router.push(`/transaction?paID=${patron.id}`)
										}
									>
										View Transaction
									</Button>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</CardContent>
	</Card>
);
