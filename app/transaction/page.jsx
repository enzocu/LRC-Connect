"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmptyState from "@/components/tags/empty";

import {
	FiX,
	FiArrowLeft,
	FiSearch,
	FiGrid,
	FiList,
	FiCamera,
	FiEye,
} from "react-icons/fi";
import { ExternalLink } from "lucide-react";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import ProtectedRoute from "@/contexts/ProtectedRoute";
import { useLoading } from "@/contexts/LoadingProvider";

import { CancelTransactionModal } from "@/components/modal/cancel-transaction-modal";
import { DamageReportModal } from "@/components/modal/report-transaction-modal";
import { ViewReasonModal } from "@/components/modal/view-reason-modal";
import MarkCompletedModal from "@/components/modal/mark-completed-modal";
import MarkUtilizedModal from "@/components/modal/mark-utilized-modal";
import { PenaltyListModal } from "@/components/modal/penaltyList-modal";
import { RenewTransactionModal } from "@/components/modal/renew-transaction-modal";
import { ScannerModal } from "@/components/modal/scanner-modal";
import {
	renderLibrary,
	renderPatron,
	renderResource,
	renderSchedule,
	renderStatusBadge,
} from "@/components/tags/transaction";
import PaginationControls from "@/components/tags/pagination";

import {
	getTransactionList,
	getTransactionFilter,
} from "../../controller/firebase/get/getTransactionList";

const resourceTypes = ["Material", "Discussion Room", "Computer"];
const materialFormats = ["Hard Copy", "Soft Copy", "Audio Copy"];

export default function TransactionPage() {
	const router = useRouter();
	const pathname = usePathname();
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const { setLoading, setPath, loading } = useLoading();

	const searchParams = useSearchParams();
	const paID = searchParams.get("paID") || "All";
	const maID = searchParams.get("maID") || "All";
	const drID = searchParams.get("drID") || "All";
	const coID = searchParams.get("coID") || "All";

	const [viewType, setViewType] = useState("grid");
	const [transactionData, setTransactionData] = useState([]);
	const [activeTab, setActiveTab] = useState("Reserved");

	//LEVEL
	const [isPersonnel, setIsPersonnel] = useState(false);

	//FILTER
	const [showFilters, setShowFilters] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const [selectedLibrary, setSelectedLibrary] = useState("All");
	const [selectedResourceType, setSelectedResourceType] = useState(
		getFirstSelectedResourceType(maID, drID, coID)
	);
	const [selectedMaterialList, setSelectedMaterialList] = useState(maID);
	const [selectedMaterialFormat, setSelectedMaterialFormat] = useState("All");
	const [selectedMaterialType, setSelectedMaterialType] = useState("All");
	const [selectedMaterialCategory, setSelectedMaterialCategory] =
		useState("All");
	const [selectedDiscussionRoomList, setSelectedDiscussionRoomList] =
		useState(drID);
	const [selectedComputerList, setSelectedComputerList] = useState(coID);
	const [showOverdueOnly, setShowOverdueOnly] = useState(false);
	const [showLateOnly, setShowLateOnly] = useState(false);

	const [libraries, setLibraries] = useState([]);
	const [materialTypes, setMaterialTypes] = useState([]);
	const [materialCategories, setMaterialCategories] = useState([]);
	const [materialList, setMaterialList] = useState([]);
	const [discussionRoomList, setDiscussionRoomList] = useState([]);
	const [computerList, setComputerList] = useState([]);

	const [showCancelModal, setShowCancelModal] = useState(false);
	const [showViewReasonModal, setShowViewReasonModal] = useState(false);
	const [showDamageReportModal, setShowDamageReportModal] = useState(false);
	const [showMarkCompletedModal, setShowMarkCompletedModal] = useState(false);
	const [showMarkUtilizedModal, setShowMarkUtilizedModal] = useState(false);
	const [showRenewModal, setShowRenewModal] = useState(false);

	//SCANNER
	const [isScannerOpen, setIsScannerOpen] = useState(false);

	//MODAL
	const [transactionID, setTransactionID] = useState(null);
	const [transactionDetails, setTransactionDetails] = useState(null);
	const [showPenaltyModal, setShowPenaltyModal] = useState(false);

	//PAGINATION
	const [pageCursors, setPageCursors] = useState([]);
	const pageLimit = 3;
	const [currentPage, setCurrentPage] = useState(1);
	const [ctrPages, setCtrPage] = useState(1);

	useEffect(() => {
		setIsPersonnel(!["USR-5", "USR-6"].includes(userDetails?.us_level));
	}, [userDetails]);

	useEffect(() => {
		setCurrentPage(1);
		setPageCursors([]);
	}, [activeTab]);

	useEffect(() => {
		setPath(pathname);

		let unsubscribe;

		if (userDetails && userDetails?.us_liID) {
			unsubscribe = getTransactionList(
				!["USR-5", "USR-6"].includes(userDetails?.us_level),
				userDetails?.us_liID,
				setTransactionData,
				activeTab,
				searchQuery,
				selectedLibrary,
				!["USR-5", "USR-6"].includes(userDetails?.us_level)
					? paID
					: userDetails?.uid,
				selectedResourceType,
				selectedMaterialList,
				selectedMaterialFormat,
				selectedMaterialType,
				selectedMaterialCategory,
				selectedDiscussionRoomList,
				selectedComputerList,
				showOverdueOnly,
				showLateOnly,
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
		currentPage,
		activeTab,
		searchQuery,
		selectedLibrary,
		paID,
		selectedResourceType,
		selectedMaterialList,
		selectedMaterialFormat,
		selectedMaterialType,
		selectedMaterialCategory,
		selectedDiscussionRoomList,
		selectedComputerList,
		showOverdueOnly,
		showLateOnly,
	]);

	useEffect(() => {
		if (userDetails && userDetails?.us_liID) {
			getTransactionFilter(
				selectedLibrary == "All" ? userDetails?.us_liID : selectedLibrary,
				selectedResourceType,
				setLibraries,
				setMaterialTypes,
				setMaterialCategories,
				setMaterialList,
				setDiscussionRoomList,
				setComputerList,
				Alert
			);
		}
	}, [userDetails, selectedResourceType]);

	//BUTTON
	const getActionButtons = (transaction, isPersonnel) => {
		switch (transaction?.tr_status) {
			case "Reserved":
				return (
					<div className="flex gap-2">
						<Button
							variant="destructive"
							size="sm"
							className="h-9 text-[12px]"
							onClick={() => {
								setTransactionDetails(transaction);
								setShowCancelModal(true);
							}}
						>
							Cancel
						</Button>

						{isPersonnel && (
							<Button
								className="bg-[#02CA79] hover:bg-[#029E61] text-white h-9 text-[12px]"
								size="sm"
								onClick={() => {
									setTransactionDetails(transaction);
									setShowMarkUtilizedModal(true);
								}}
							>
								Mark as Utilized
							</Button>
						)}
					</div>
				);
			case "Utilized":
				return (
					<div className="flex gap-2">
						{isPersonnel && (
							<Button
								variant="outline"
								size="sm"
								className="h-9 text-[12px]"
								onClick={() => {
									setTransactionDetails(transaction);
									setShowDamageReportModal(true);
								}}
							>
								Report
							</Button>
						)}

						{isPersonnel &&
							transaction?.tr_type == "Material" &&
							(!transaction?.tr_pastDueDate ||
								transaction?.tr_pastDueDate?.length < 2) && (
								<Button
									size="sm"
									className="bg-orange-500 hover:bg-orange-600 text-white h-9 text-[12px]"
									onClick={() => {
										setTransactionDetails(transaction);
										setShowRenewModal(true);
									}}
								>
									Renew
								</Button>
							)}

						{(isPersonnel ||
							(transaction?.tr_type == "Material" &&
								transaction?.tr_format != "Hard Copy")) && (
							<Button
								className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-9 text-[12px]"
								size="sm"
								onClick={() => {
									setTransactionDetails(transaction);
									setShowMarkCompletedModal(true);
								}}
							>
								Mark as Completed
							</Button>
						)}
					</div>
				);
			case "Cancelled":
				return (
					<Button
						size="sm"
						className="h-9 text-[12px] bg-[#FF9A00] hover:bg-[#e68900] text-white"
						onClick={() => {
							setTransactionDetails(transaction);
							setShowViewReasonModal(true);
						}}
					>
						<FiEye className="w-3 h-3 mr-1" />
						View Reason
					</Button>
				);
			default:
				return null;
		}
	};

	return (
		<ProtectedRoute
			allowedRoles={["USR-2", "USR-3", "USR-4", "USR-5", "USR-6"]}
		>
			<div className="min-h-screen bg-background transition-colors duration-300">
				<Header />

				<main className="pt-28 pb-6 px-6 sm:px-6 md:px-16 lg:px-[100px] xl:px-[150px]">
					<div className="mb-6 animate-fade-in">
						<button
							onClick={() => router.push(`/users/home`)}
							className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit text-[11px]"
						>
							<FiArrowLeft className="w-4 h-4" />
							Back to Previous page
						</button>
					</div>

					<div className="mb-8 animate-slide-up">
						<h1 className="font-semibold text-foreground text-[20px]">
							Transaction Management
						</h1>
						<p className="text-muted-foreground text-[14px]">
							Monitor and manage all library resource transactions and
							reservations
						</p>
					</div>

					<div className="mb-8 animate-slide-up-delay-1">
						<div className="flex items-left justify-between flex-col sm:flex-row gap-4 mb-4">
							<div className="relative flex items-center flex-1 max-w-md">
								<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
								<Input
									placeholder="Search transactions by QR..."
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
								{isPersonnel ? (
									<Button
										onClick={() => router.push("/transaction/patron-summary")}
										className="h-9 bg-primary-custom hover:bg-secondary-custom text-white border-none text-[12px]"
									>
										View Patron Summary
									</Button>
								) : (
									<Button
										onClick={() => setShowPenaltyModal(true)}
										variant="destructive"
										className="h-9 text-white border-none shimmer text-[12px]"
									>
										View Penalties
									</Button>
								)}
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
							selectedResourceType !== "All" ||
							selectedMaterialList !== "All" ||
							selectedMaterialFormat !== "All" ||
							selectedMaterialType !== "All" ||
							selectedMaterialCategory !== "All" ||
							selectedDiscussionRoomList !== "All" ||
							selectedComputerList !== "All" ||
							showOverdueOnly ||
							showLateOnly) && (
							<div className="flex items-center gap-2 mb-4 flex-wrap">
								<span className="text-muted-foreground text-[11px]">
									Active Filters:
								</span>
								{selectedLibrary !== "All" && (
									<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded  flex items-center gap-1  text-[11px]">
										Library:{" "}
										{libraries.find((lib) => lib.id === selectedLibrary)
											?.li_name || "Unknown"}
										<FiX
											className="w-3 h-3 cursor-pointer"
											onClick={() => setSelectedLibrary("All")}
										/>
									</span>
								)}

								{selectedResourceType !== "All" && (
									<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded  flex items-center gap-1  text-[11px]">
										Resource: {selectedResourceType}
										<FiX
											className="w-3 h-3 cursor-pointer"
											onClick={() => setSelectedResourceType("All")}
										/>
									</span>
								)}
								{selectedMaterialList !== "All" && (
									<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded  flex items-center gap-1  text-[11px]">
										Material:{" "}
										{materialList.find((m) => m.id === selectedMaterialList)
											?.ma_qr || "Unknown"}
										<FiX
											className="w-3 h-3 cursor-pointer"
											onClick={() => setSelectedMaterialList("All")}
										/>
									</span>
								)}

								{selectedMaterialFormat !== "All" && (
									<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded  flex items-center gap-1  text-[11px]">
										Format: {selectedMaterialFormat}
										<FiX
											className="w-3 h-3 cursor-pointer"
											onClick={() => setSelectedMaterialFormat("All")}
										/>
									</span>
								)}
								{selectedMaterialType !== "All" && (
									<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded  flex items-center gap-1  text-[11px]">
										Type:{" "}
										{materialTypes.find((t) => t.id === selectedMaterialType)
											?.mt_name || "Unknown"}
										<FiX
											className="w-3 h-3 cursor-pointer"
											onClick={() => setSelectedMaterialType("All")}
										/>
									</span>
								)}

								{selectedMaterialCategory !== "All" && (
									<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded  flex items-center gap-1  text-[11px]">
										Category:{" "}
										{materialCategories.find(
											(c) => c.id === selectedMaterialCategory
										)?.ca_name || "Unknown"}
										<FiX
											className="w-3 h-3 cursor-pointer"
											onClick={() => setSelectedMaterialCategory("All")}
										/>
									</span>
								)}

								{selectedDiscussionRoomList !== "All" && (
									<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded  flex items-center gap-1  text-[11px]">
										Room:{" "}
										{discussionRoomList.find(
											(r) => r.id === selectedDiscussionRoomList
										)?.dr_qr || "Unknown"}
										<FiX
											className="w-3 h-3 cursor-pointer"
											onClick={() => setSelectedDiscussionRoomList("All")}
										/>
									</span>
								)}

								{selectedComputerList !== "All" && (
									<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded  flex items-center gap-1  text-[11px]">
										Computer:{" "}
										{computerList.find((c) => c.id === selectedComputerList)
											?.co_qr || "Unknown"}
										<FiX
											className="w-3 h-3 cursor-pointer"
											onClick={() => setSelectedComputerList("All")}
										/>
									</span>
								)}
								{showOverdueOnly && (
									<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded  flex items-center gap-1  text-[11px]">
										Overdue Only
										<FiX
											className="w-3 h-3 cursor-pointer"
											onClick={() => setShowOverdueOnly(false)}
										/>
									</span>
								)}

								{showLateOnly && (
									<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded  flex items-center gap-1  text-[11px]">
										Late Return Only
										<FiX
											className="w-3 h-3 cursor-pointer"
											onClick={() => setShowLateOnly(false)}
										/>
									</span>
								)}
							</div>
						)}
					</div>

					{showFilters && (
						<div className="fixed inset-0 z-50 transition-opacity duration-300 opacity-100">
							<div
								className="fixed inset-0 bg-black/50"
								onClick={() => setShowFilters(false)}
							/>
							<div className="relative bg-card w-80 h-full shadow-lg transform transition-transform duration-300 translate-x-0 animate-slide-in-left flex flex-col">
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

								<div className="p-4 space-y-4 overflow-y-auto flex-1 pb-4">
									<div className="space-y-2">
										<label className="block font-medium text-foreground text-[12px]">
											Select a Library
										</label>
										<select
											value={selectedLibrary}
											onChange={(e) => setSelectedLibrary(e.target.value)}
											className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
										>
											<option value="All">All Libraries</option>
											{libraries.map((library) => (
												<option key={library.id} value={library.id}>
													{library.li_name}
												</option>
											))}
										</select>
									</div>

									<div className="space-y-2">
										<label className="block font-medium text-foreground text-[12px]">
											Select a Resource Type
										</label>
										<select
											value={selectedResourceType}
											onChange={(e) => {
												setSelectedResourceType(e.target.value);
												setSelectedMaterialList("All");
												setSelectedMaterialFormat("All");
												setSelectedMaterialType("All");
												setSelectedMaterialCategory("All");
												setSelectedDiscussionRoomList("All");
												setSelectedComputerList("All");
											}}
											className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
										>
											<option value="All">All Resource Types</option>
											{resourceTypes.map((type) => (
												<option key={type} value={type}>
													{type}
												</option>
											))}
										</select>
									</div>

									{selectedResourceType == "Material" && (
										<>
											<div className="space-y-2">
												<label className="block font-medium text-foreground text-[12px]">
													Select a Material
												</label>
												<select
													value={selectedMaterialList}
													onChange={(e) =>
														setSelectedMaterialList(e.target.value)
													}
													className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
												>
													<option value="All">All Materials</option>
													{materialList.map((material) => (
														<option key={material.id} value={material.id}>
															{material.ma_qr}
														</option>
													))}
												</select>
											</div>

											<div className="space-y-2">
												<label className="block font-medium text-foreground text-[12px]">
													Select a Material Format
												</label>
												<select
													value={selectedMaterialFormat}
													onChange={(e) =>
														setSelectedMaterialFormat(e.target.value)
													}
													className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
												>
													<option value="All">All Formats</option>
													{materialFormats.map((format) => (
														<option key={format} value={format}>
															{format}
														</option>
													))}
												</select>
											</div>

											<div className="space-y-2">
												<label className="block font-medium text-foreground text-[12px]">
													Select a Material Type
												</label>
												<select
													value={selectedMaterialType}
													onChange={(e) =>
														setSelectedMaterialType(e.target.value)
													}
													className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
												>
													<option value="All">All Material Types</option>
													{materialTypes.map((type) => (
														<option key={type.id} value={type.id}>
															{type.mt_name}
														</option>
													))}
												</select>
											</div>

											<div className="space-y-2">
												<label className="block font-medium text-foreground text-[12px]">
													Select Category
												</label>
												<select
													value={selectedMaterialCategory}
													onChange={(e) =>
														setSelectedMaterialCategory(e.target.value)
													}
													className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
												>
													<option value="All">All Categories</option>
													{materialCategories.map((category) => (
														<option key={category.id} value={category.id}>
															{category.ca_name}
														</option>
													))}
												</select>
											</div>
										</>
									)}

									{selectedResourceType == "Discussion Room" && (
										<>
											<div className="space-y-2">
												<label className="block font-medium text-foreground text-[12px]">
													Select a Discussion Room
												</label>
												<select
													value={selectedDiscussionRoomList}
													onChange={(e) =>
														setSelectedDiscussionRoomList(e.target.value)
													}
													className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
												>
													<option value="All">All Discussion Rooms</option>
													{discussionRoomList.map((room) => (
														<option key={room.id} value={room.id}>
															{room.dr_qr}
														</option>
													))}
												</select>
											</div>
										</>
									)}

									{selectedResourceType == "Computer" && (
										<div className="space-y-2">
											<label className="block font-medium text-foreground text-[12px]">
												Select a Computer
											</label>
											<select
												value={selectedComputerList}
												onChange={(e) =>
													setSelectedComputerList(e.target.value)
												}
												className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
											>
												<option value="All">All Computers</option>
												{computerList.map((computer) => (
													<option key={computer.id} value={computer.id}>
														{computer.co_qr}
													</option>
												))}
											</select>
										</div>
									)}

									<div className="space-y-3">
										<label className="block font-medium text-foreground text-[12px]">
											Status Filters
										</label>
										<div className="space-y-2">
											<label className="flex items-center gap-2 cursor-pointer">
												<Checkbox
													checked={showOverdueOnly}
													onCheckedChange={setShowOverdueOnly}
												/>
												<span className="text-foreground text-[12px]">
													Show only transactions that are currently overdue
												</span>
											</label>

											<label className="flex items-center gap-2 cursor-pointer">
												<Checkbox
													checked={showLateOnly}
													onCheckedChange={setShowLateOnly}
												/>
												<span className="text-foreground text-[12px]">
													Show only transactions with late returns
												</span>
											</label>
										</div>
									</div>
								</div>

								<div className="p-4 bg-card border-t border-border flex-shrink-0">
									<div className="flex space-x-3">
										<Button
											onClick={() => {
												setPageCursors([]);
												setCurrentPage(1);
												setSelectedLibrary("All");
												setSelectedResourceType("All");
												setSelectedMaterialList("All");
												setSelectedMaterialFormat("All");
												setSelectedMaterialType("All");
												setSelectedMaterialCategory("All");
												setSelectedDiscussionRoomList("All");
												setSelectedComputerList("All");
												setShowOverdueOnly(false);
												setShowLateOnly(false);
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

					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className="w-full animate-slide-up-delay-2"
					>
						<TabsList className="grid w-full grid-cols-4 mb-6 bg-muted">
							<TabsTrigger value="Reserved" className="text-[12px]">
								Reserved
							</TabsTrigger>
							<TabsTrigger value="Utilized" className="text-[12px]">
								Utilized
							</TabsTrigger>
							<TabsTrigger value="Cancelled" className="text-[12px]">
								Cancelled
							</TabsTrigger>
							<TabsTrigger value="Completed" className="text-[12px]">
								Completed
							</TabsTrigger>
						</TabsList>

						<TabsContent value={activeTab}>
							<div className="animate-slide-up-delay-3 overflow-x-auto">
								{viewType === "grid" && (
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ">
										{transactionData?.map((transaction, index) => (
											<Card
												key={index}
												className="bg-card border-none shadow-sm transition-colors duration-300 hover:shadow-md rounded-lg h-fit"
											>
												<CardContent className="p-4 space-y-6">
													<div className="flex items-start justify-between pb-4 border-b border-border">
														<div>
															<h4 className="font-medium text-foreground text-[14px]">
																{transaction?.tr_qr}
															</h4>
															<p className="text-muted-foreground text-[12px]">
																{transaction?.tr_createdAt}
															</p>
														</div>
														<div className="flex items-center gap-2">
															<Button
																variant="ghost"
																size="sm"
																className="hover:bg-accent h-8 w-8 p-0 rounded-full"
																onClick={() =>
																	router.push(
																		`/transaction/details?id=${transaction?.id}`
																	)
																}
																title="View Transaction Details"
															>
																<ExternalLink className="w-4 h-4" />
															</Button>
															{renderStatusBadge(transaction)}
														</div>
													</div>

													<div>
														<h5 className="font-medium text-foreground mb-4 text-[13px]">
															Resources Details
														</h5>
														{renderResource(transaction)}
													</div>

													{isPersonnel && (
														<div>
															<h5 className="font-medium text-foreground mb-4 text-[13px]">
																Patron Details
															</h5>
															{renderPatron(transaction?.tr_patron)}
														</div>
													)}

													<div>
														<h5 className="font-medium text-foreground mb-4 text-[13px]">
															Schedule
														</h5>
														{renderSchedule(transaction)}
													</div>

													{!isPersonnel && renderLibrary(transaction)}

													<div className="pt-4 border-t border-border">
														{getActionButtons(transaction, isPersonnel)}
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								)}

								{/* Table View */}
								{viewType === "table" && (
									<Card className="bg-card border-border transition-colors duration-300 shadow-sm">
										<CardContent className="p-0 overflow-x-auto">
											<table className="w-full">
												<thead className="bg-muted/30">
													<tr className="border-b border-border">
														{userDetails &&
															[
																"Transaction",
																"Resource Details",
																...(isPersonnel ? ["Patron"] : []),
																"Schedule",
																...(!isPersonnel ? ["Library"] : []),
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
													{transactionData?.map((transaction, index) => (
														<tr
															key={index}
															className={`border-b border-border hover:bg-accent/30 transition-colors ${
																index % 2 === 0
																	? "bg-background"
																	: "bg-muted/10"
															}`}
														>
															<td className="py-4 px-6 min-w-[250px]">
																<p className="font-medium text-foreground text-[12px]">
																	{transaction?.tr_qr}
																</p>
																<p
																	className="text-muted-foreground mb-2"
																	style={{ fontSize: "11px" }}
																>
																	{transaction?.tr_createdAt}
																</p>
																{renderStatusBadge(transaction, "left")}
															</td>

															<td className="py-4 px-6 min-w-[310px]">
																{renderResource(transaction, true)}
															</td>

															{isPersonnel && (
																<td className="py-4 px-6 min-w-[250px]">
																	{renderPatron(transaction?.tr_patron, true)}
																</td>
															)}

															<td className="py-4 px-6 min-w-[300px]">
																{renderSchedule(transaction)}
															</td>

															{!isPersonnel && (
																<td className="py-4 px-6 min-w-[300px]">
																	{renderLibrary(transaction)}
																</td>
															)}

															<td className="py-4 px-6">
																<div className="flex items-center gap-2">
																	<Button
																		variant="ghost"
																		size="sm"
																		className="hover:bg-accent h-7 w-7 p-0"
																		onClick={() =>
																			router.push(
																				`/transaction/details?id=${transaction?.id}`
																			)
																		}
																		title="View Trasanction Details"
																	>
																		<ExternalLink className="w-3 h-3" />
																	</Button>
																	{getActionButtons(transaction, isPersonnel)}
																</div>
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</CardContent>
									</Card>
								)}
								<EmptyState data={transactionData} loading={loading} />

								<PaginationControls
									ctrPages={ctrPages}
									currentPage={currentPage}
									setCurrentPage={setCurrentPage}
								/>
							</div>
						</TabsContent>
					</Tabs>

					{/* Cancel Transaction Modal */}
					<CancelTransactionModal
						isOpen={showCancelModal}
						onClose={() => setShowCancelModal(false)}
						transaction={transactionDetails}
						setActiveTab={setActiveTab}
						userDetails={userDetails}
						Alert={Alert}
					/>

					{/* Mark Completed Modal */}
					<MarkCompletedModal
						isOpen={showMarkCompletedModal}
						onClose={() => setShowMarkCompletedModal(false)}
						transaction={transactionDetails}
						setActiveTab={setActiveTab}
						userDetails={userDetails}
						Alert={Alert}
					/>

					{isPersonnel && (
						<>
							{/* Damage Report Modal*/}
							<DamageReportModal
								isOpen={showDamageReportModal}
								onClose={() => setShowDamageReportModal(false)}
								transaction={transactionDetails}
								setActiveTab={setActiveTab}
								userDetails={userDetails}
								Alert={Alert}
							/>

							{/* Mark Utilized Modal */}
							<MarkUtilizedModal
								isOpen={showMarkUtilizedModal}
								onClose={() => setShowMarkUtilizedModal(false)}
								transaction={transactionDetails}
								setActiveTab={setActiveTab}
								userDetails={userDetails}
								Alert={Alert}
							/>

							<RenewTransactionModal
								isOpen={showRenewModal}
								onClose={() => setShowRenewModal(false)}
								transaction={transactionDetails}
								userDetails={userDetails}
								Alert={Alert}
							/>
						</>
					)}

					<ViewReasonModal
						isOpen={showViewReasonModal}
						onClose={() => setShowViewReasonModal(false)}
						transaction={transactionDetails}
					/>

					{!isPersonnel && (
						<PenaltyListModal
							isOpen={showPenaltyModal}
							onClose={() => setShowPenaltyModal(false)}
							patronId={userDetails?.uid}
							userDetails={userDetails}
							Alert={Alert}
						/>
					)}
					{/* {Scanner} */}
					<ScannerModal
						isOpen={isScannerOpen}
						onClose={() => setIsScannerOpen(false)}
						setResult={setSearchQuery}
						allowedPrefix="TRN|USR"
					/>
				</main>
			</div>
		</ProtectedRoute>
	);
}

const getFirstSelectedResourceType = (m, d, c) =>
	m && m !== "All"
		? "Material"
		: d && d !== "All"
		? "Discussion Room"
		: c && c !== "All"
		? "Computer"
		: "All";
