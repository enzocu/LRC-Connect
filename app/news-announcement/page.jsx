"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";
import {
	FiPlus,
	FiClock,
	FiEye,
	FiUsers,
	FiUser,
	FiGlobe,
	FiSearch,
	FiFileText,
	FiBell,
	FiEdit2,
	FiTrash2,
} from "react-icons/fi";
import EmptyState from "@/components/tags/empty";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import ProtectedRoute from "@/contexts/ProtectedRoute";
import { useLoading } from "@/contexts/LoadingProvider";

import DeleteConfirmationModal from "@/components/modal/delete-confirmation-modal";
import { AddNewsAnnouncementModal } from "@/components/modal/news-announcement-modal";
import PaginationControls from "@/components/tags/pagination";

import { getNewsAnnouncementList } from "../../controller/firebase/get/getNewsAnnouncementList";

export default function NewsAnnouncementPage() {
	const pathname = usePathname();
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const { setLoading, setPath, loading } = useLoading();

	const [focusMode, setFocusMode] = useState("News");
	const [searchQuery, setSearchQuery] = useState("");
	const [newsData, setNewsData] = useState([]);
	const [announcementsData, setAnnouncementsData] = useState([]);

	const [mainSeeAll, setMainSeeAll] = useState(null);
	const [subSeeAll, setSubSeeAll] = useState(null);

	//MODAL
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedNewsAnnouncements, setSelectedNewsAnnouncements] =
		useState(null);

	const getvisibilityIcon = (visibility) => {
		switch (visibility) {
			case "Patron":
				return <FiUser className="w-3.5 h-3.5" />;
			case "Personnel":
				return <FiUsers className="w-3.5 h-3.5" />;
			case "General":
				return <FiGlobe className="w-3.5 h-3.5" />;
			default:
				return <FiGlobe className="w-3.5 h-3.5" />;
		}
	};

	const getvisibilityColor = (visibility) => {
		switch (visibility) {
			case "Patron":
				return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
			case "Personnel":
				return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
			case "General":
				return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
			default:
				return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
		}
	};

	//PAGINATION
	const pageLimit = 5;
	const [pagination, setPagination] = useState({
		News: {
			currentPage: 1,
			pageCursors: [],
			ctrPages: 1,
		},
		Announcements: {
			currentPage: 1,
			pageCursors: [],
			ctrPages: 1,
		},
	});

	useEffect(() => {
		let unsubscribe;
		setPath(pathname);

		if (focusMode !== "News" && searchQuery !== "") return;

		if (userDetails?.us_liID) {
			unsubscribe = getNewsAnnouncementList(
				userDetails?.us_level != "USR-6",
				userDetails?.us_liID,
				setNewsData,
				"News",
				searchQuery,
				setLoading,
				Alert,
				pageLimit,
				pagination,
				setPagination
			);
		}

		return () => {
			if (unsubscribe) unsubscribe();
		};
	}, [userDetails?.us_liID, searchQuery, pagination.News.currentPage]);

	useEffect(() => {
		let unsubscribe;

		if (focusMode !== "Announcements" && searchQuery !== "") return;

		if (userDetails?.us_liID) {
			unsubscribe = getNewsAnnouncementList(
				userDetails?.us_level != "USR-6",
				userDetails?.us_liID,
				setAnnouncementsData,
				"Announcements",
				searchQuery,
				setLoading,
				Alert,
				pageLimit,
				pagination,
				setPagination
			);
		}

		return () => {
			if (unsubscribe) unsubscribe();
		};
	}, [userDetails?.us_liID, searchQuery, pagination.News.currentPage]);

	const mainData = focusMode === "News" ? newsData : announcementsData;
	const sideData = focusMode === "News" ? announcementsData : newsData;

	return (
		<ProtectedRoute
			allowedRoles={["USR-2", "USR-3", "USR-4", "USR-5", "USR-6"]}
		>
			<div className="flex h-screen bg-background transition-colors duration-300">
				<Sidebar />
				<div className="flex-1 flex flex-col overflow-hidden">
					<Header />

					<main className="flex-1 overflow-auto p-6 pt-24 overflow-auto">
						<div className="flex flex-col gap-4 md:gap-6  md:flex-col lg:flex-row sm:items-left justify-between mb-8 animate-slide-up">
							<div>
								<h1 className="font-semibold text-foreground text-[20px]">
									News & Announcements
								</h1>
								<p className="text-muted-foreground text-[14px]">
									Stay updated with the latest library news and important
									announcements
								</p>
							</div>

							<div className="flex flex-wrap items-center gap-4">
								<div className="flex items-center border border-border rounded-md">
									<Button
										variant={focusMode === "News" ? "default" : "ghost"}
										size="sm"
										onClick={() => setFocusMode("News")}
										className={`h-9 px-3 rounded-r-none  text-[12px] ${
											focusMode === "News"
												? "bg-primary-custom text-white hover:text-white hover:bg-primary-custom/90"
												: "hover:bg-accent"
										}`}
									>
										<FiFileText className="w-4 h-4 mr-1" />
										News
									</Button>
									<Button
										variant={
											focusMode === "Announcements" ? "default" : "ghost"
										}
										size="sm"
										onClick={() => setFocusMode("Announcements")}
										className={`h-9 px-3 rounded-l-none text-[12px] ${
											focusMode === "Announcements"
												? "bg-primary-custom text-white hover:text-white hover:bg-primary-custom/90"
												: "hover:bg-accent"
										}`}
									>
										<FiBell className="w-4 h-4 mr-1" />
										Announcements
									</Button>
								</div>

								{userDetails &&
									["USR-2", "USR-3", "USR-4"].includes(
										userDetails?.us_level
									) && (
										<Button
											onClick={() => {
												setSelectedNewsAnnouncements({});
												setIsModalOpen(true);
											}}
											className="bg-primary-custom hover:bg-secondary-custom text-white h-9 px-4 text-[12px]"
										>
											<FiPlus className="mr-1 h-4 w-4" />
											Add New {focusMode}
										</Button>
									)}
							</div>
						</div>

						{/* Main Content Layout */}
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-14 animate-slide-up-delay-1">
							<div className="lg:col-span-2">
								<div className="flex items-center justify-between mb-3">
									<h2 className="font-semibold text-foreground leading-none m-0 p-0 align-baseline text-[18px]">
										{focusMode === "News"
											? "Latest News"
											: "Current Announcements"}
									</h2>

									<Badge
										variant="secondary"
										className="text-muted-foreground text-[12px] font-normal"
									>
										{mainData?.length} items
									</Badge>
								</div>

								<div className="relative mb-6">
									<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
									<Input
										placeholder={`Search ${focusMode}...`}
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-10 h-9 bg-background border-border"
										style={{ fontSize: "12px" }}
									/>
								</div>

								<div className="space-y-6">
									{mainData?.map((item, index) => (
										<Card
											key={index}
											className="bg-card border-border hover:border-primary/50 transition-colors"
										>
											<CardContent className="p-6">
												<div className="mb-4">
													<img
														src={item.na_photoURL || "/placeholder.svg"}
														alt={item.na_title}
														className="w-full h-48 object-cover rounded-lg bg-gray-100 "
													/>
												</div>

												<div className="flex flex-wrap items-start justify-between mb-3">
													<div className="flex items-center gap-2">
														<Badge
															variant="outline"
															className="text-primary border-primary/20 text-[11px]"
														>
															{item.na_category}
														</Badge>
														<Badge
															className={`text-[12px] ${getvisibilityColor(
																item.na_visibility
															)}`}
														>
															<div className="flex items-center gap-1 text-[11px]">
																{getvisibilityIcon(item.na_visibility)}
																{item.na_visibility}
															</div>
														</Badge>
														{focusMode === "Announcements" &&
															item.na_urgent && (
																<Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-[11px]">
																	Urgent
																</Badge>
															)}
													</div>
													<div className="flex items-center gap-2 text-muted-foreground text-[11px]">
														<FiClock className="w-3 h-3" />
														{item.na_createdAtFormatted}
													</div>
												</div>

												<h3 className="font-semibold text-foreground mb-1 text-[16px]">
													{item.na_title}
												</h3>

												<div className="text-muted-foreground mb-4 text-[12px] whitespace-pre-wrap">
													<span
														className={
															mainSeeAll === index ? "mr-1" : "line-clamp-3 "
														}
													>
														{item.na_content}
													</span>

													<span
														onClick={() =>
															setMainSeeAll(mainSeeAll === index ? null : index)
														}
														className="text-primary text-[12px] hover:underline cursor-pointer"
													>
														{mainSeeAll === index ? "See less" : "See all"}
													</span>
												</div>

												<div className="flex flex-wrap items-center justify-between gap-4">
													<div className="flex items-center gap-4 text-muted-foreground text-[11px]">
														<span>By {item.na_author}</span>
														<div className="flex items-center gap-1">
															<FiClock className="w-3 h-3" />
															{item.na_readTime}
														</div>
														<div className="flex items-center gap-1">
															<FiEye className="w-3 h-3" />
															{item.na_views} views
														</div>
													</div>
													<div className="flex items-center gap-1">
														{userDetails &&
															["USR-2", "USR-3", "USR-4"].includes(
																userDetails?.us_level
															) && (
																<>
																	<Button
																		variant="ghost"
																		size="icon"
																		className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
																		title={`Edit ${focusMode}`}
																		onClick={() => {
																			setSelectedNewsAnnouncements(item);
																			setIsModalOpen(true);
																		}}
																	>
																		<FiEdit2 className="w-4 h-4" />
																	</Button>
																	<Button
																		variant="ghost"
																		size="icon"
																		className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
																		title={`Delete ${focusMode}`}
																		onClick={() => {
																			setSelectedNewsAnnouncements(item);
																			setDeleteOpen(true);
																		}}
																	>
																		<FiTrash2 className="w-4 h-4" />
																	</Button>{" "}
																</>
															)}
													</div>
												</div>
											</CardContent>
										</Card>
									))}

									<EmptyState data={mainData} loading={loading} />
									{(() => {
										const key = focusMode === "News" ? "News" : "Announcements";
										return (
											<PaginationControls
												ctrPages={pagination[key].ctrPages}
												currentPage={pagination[key].currentPage}
												setCurrentPage={(val) =>
													setPagination((prev) => ({
														...prev,
														[key]: {
															...prev[key],
															currentPage:
																typeof val === "function"
																	? val(prev[key].currentPage)
																	: val,
														},
													}))
												}
											/>
										);
									})()}
								</div>
							</div>

							<div className="lg:col-span-1">
								<div className="flex items-center justify-between mb-3">
									<h2 className="font-semibold text-foreground leading-none m-0 p-0 align-baseline text-[18px] lg:text-[14px]">
										{focusMode === "News"
											? "Recent Announcements"
											: "Recent News"}
									</h2>
									<Badge
										variant="secondary"
										className="text-muted-foreground text-[12px] lg:text-[11px] font-normal"
									>
										{sideData?.length} items
									</Badge>
								</div>

								<div className="space-y-4">
									{sideData?.slice(0, 4).map((item, index) => (
										<Card
											key={item.id}
											className="bg-card border-border hover:border-primary/50 transition-colors"
										>
											<CardContent className="p-6 lg:p-4">
												<div className="mb-4 lg:mb-3">
													<img
														src={item.na_photoURL || "/placeholder.svg"}
														alt={item.na_title}
														className="w-full h-48 lg:h-24 object-cover rounded-md bg-gray-100 "
													/>
												</div>

												<div className="flex flex-wrap items-center gap-2 mb-3 lg:mb-2">
													<Badge
														variant="outline"
														className="text-primary border-primary/20 text-[11px]"
													>
														{item.na_category}
													</Badge>

													<Badge
														className={`${getvisibilityColor(
															item.na_visibility
														)} text-[11px]`}
													>
														<div className="flex items-center gap-1 text-[11px]">
															{getvisibilityIcon(item.na_visibility)}
															{item.na_visibility}
														</div>
													</Badge>
													{focusMode !== "Announcements" && item.na_urgent && (
														<Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-[11px]">
															Urgent
														</Badge>
													)}
												</div>

												<h3 className="font-semibold text-foreground mb-1 text-[16px] lg:text-[12px]">
													{item.na_title}
												</h3>

												<div className="text-muted-foreground mb-4 lg:mb-3 text-[12px] whitespace-pre-wrap">
													<span
														className={
															subSeeAll === index ? "mr-1" : "line-clamp-2"
														}
													>
														{item.na_content}
													</span>

													<span
														onClick={() =>
															setSubSeeAll(subSeeAll === index ? null : index)
														}
														className="text-primary text-[12px] hover:underline cursor-pointer"
													>
														{subSeeAll === index ? "See less" : "See all"}
													</span>
												</div>

												<div className="flex items-center gap-4 text-muted-foreground text-[11px]">
													<span>By {item.na_author}</span>
													<div className="flex items-center gap-2 text-muted-foreground text-[11px]">
														<FiClock className="w-3 h-3" />
														{item.na_createdAtFormatted}
													</div>
												</div>
											</CardContent>
										</Card>
									))}

									<EmptyState data={sideData} loading={loading} />

									{(() => {
										const key = focusMode === "News" ? "Announcements" : "News";
										return (
											<PaginationControls
												ctrPages={pagination[key].ctrPages}
												currentPage={pagination[key].currentPage}
												setCurrentPage={(val) =>
													setPagination((prev) => ({
														...prev,
														[key]: {
															...prev[key],
															currentPage:
																typeof val === "function"
																	? val(prev[key].currentPage)
																	: val,
														},
													}))
												}
											/>
										);
									})()}
								</div>
							</div>
						</div>
					</main>

					<AddNewsAnnouncementModal
						isOpen={isModalOpen}
						onClose={() => setIsModalOpen(false)}
						entryType={focusMode}
						selectedNewsAnnouncements={selectedNewsAnnouncements}
						userDetails={userDetails}
						Alert={Alert}
					/>

					<DeleteConfirmationModal
						isOpen={deleteOpen}
						onClose={() => setDeleteOpen(false)}
						type={focusMode}
						title={`Delete ${focusMode}`}
						description={`Are you sure you want to delete this ${focusMode}? This action cannot be undone.`}
						id={selectedNewsAnnouncements?.id}
						userDetails={userDetails}
						Alert={Alert}
					/>
				</div>
			</div>
		</ProtectedRoute>
	);
}
