"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	FiBook,
	FiUsers,
	FiClock,
	FiSearch,
	FiChevronLeft,
	FiChevronRight,
} from "react-icons/fi";

export default function Dashboard() {
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [filterLibrary, setFilterLibrary] = useState("all");
	const [filterStatus, setFilterStatus] = useState("all");
	const itemsPerPage = 5;

	const stats = {
		activeLibraries: 12,
		inactiveLibraries: 3,
		activeAccounts: 1247,
		inactiveAccounts: 89,
		todayAuditTrails: 342,
		lastUpdate: "2024-12-30 14:30:25",
	};

	const feedbackItems = [
		{
			id: 1,
			sender: "Alice Johnson",
			avatar: "/placeholder.svg?height=40&width=40",
			library: "LRC NU Baliwag",
			type: "Bug Report",
			content:
				"The search function on the main library page is not returning correct results for specific keywords.",
			screenshot: "/dashboard-image.png",
			isRead: false,
			date: "2024-07-28",
		},
		{
			id: 2,
			sender: "Bob Smith",
			avatar: "/placeholder.svg?height=40&width=40",
			library: "LRC NU Manila",
			type: "Feature Request",
			content:
				"It would be great to have a 'dark mode' option for the entire application interface.",
			screenshot: null,
			isRead: true,
			date: "2024-07-27",
		},
		{
			id: 3,
			sender: "Charlie Brown",
			avatar: "/placeholder.svg?height=40&width=40",
			library: "LRC NU Baliwag",
			type: "General Inquiry",
			content:
				"I'm having trouble reserving a discussion room. The calendar seems to be unresponsive.",
			screenshot: "/calendar-light.png",
			isRead: false,
			date: "2024-07-26",
		},
		{
			id: 4,
			sender: "Diana Prince",
			avatar: "/placeholder.svg?height=40&width=40",
			library: "LRC NU Laguna",
			type: "Suggestion",
			content:
				"Consider adding a 'recently viewed' section for materials on the patron dashboard.",
			screenshot: null,
			isRead: true,
			date: "2024-07-25",
		},
		{
			id: 5,
			sender: "Eve Adams",
			avatar: "/placeholder.svg?height=40&width=40",
			library: "LRC NU Manila",
			type: "Bug Report",
			content:
				"The 'borrowing limits' modal is not displaying correctly on mobile devices.",
			screenshot: "/borrowing-limits-modal.png",
			isRead: false,
			date: "2024-07-24",
		},
		{
			id: 6,
			sender: "Frank Green",
			avatar: "/placeholder.svg?height=40&width=40",
			library: "LRC NU Baliwag",
			type: "Feature Request",
			content: "Can we have an option to export transaction history to CSV?",
			screenshot: null,
			isRead: false,
			date: "2024-07-23",
		},
		{
			id: 7,
			sender: "Grace Hall",
			avatar: "/placeholder.svg?height=40&width=40",
			library: "LRC NU Laguna",
			type: "General Inquiry",
			content: "What are the new policies regarding overdue books?",
			screenshot: null,
			isRead: true,
			date: "2024-07-22",
		},
	];

	const libraries = [
		"all",
		...new Set(feedbackItems.map((item) => item.library)),
	];

	const filteredFeedback = feedbackItems.filter((item) => {
		const matchesSearch =
			searchQuery === "" ||
			item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
			item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
			item.sender.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesLibrary =
			filterLibrary === "all" || item.library === filterLibrary;

		const matchesStatus =
			filterStatus === "all" ||
			(filterStatus === "read" ? item.isRead : !item.isRead);

		return matchesSearch && matchesLibrary && matchesStatus;
	});

	const totalPages = Math.ceil(filteredFeedback.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const currentFeedback = filteredFeedback.slice(startIndex, endIndex);

	const handlePageChange = (page) => {
		if (page > 0 && page <= totalPages) {
			setCurrentPage(page);
		}
	};

	const handleCheckboxChange = (id, checked) => {
		console.log(`Feedback ${id} marked as read: ${checked}`);
	};

	const handleSearchChange = (e) => {
		setSearchQuery(e.target.value);
		setCurrentPage(1);
	};

	return (
		<div className="flex h-screen bg-background transition-colors duration-300">
			<Sidebar />

			<div className="flex-1 flex flex-col overflow-hidden">
				<Header />

				<main className="flex-1 overflow-auto pt-20">
					<div className="p-6">
						{/* Page Title */}
						<div className="mb-8 animate-fade-in">
							<h1
								className="font-semibold text-foreground"
								style={{ fontSize: "20px" }}
							>
								Dashboard
							</h1>
							<p
								className="text-muted-foreground mt-1"
								style={{ fontSize: "11px" }}
							>
								Overview of library system statistics and key metrics
							</p>
						</div>

						<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
							{/* Active Libraries */}
							<Card className="bg-card border-border transition-colors duration-300">
								<CardContent className="p-3">
									<div className="flex items-center justify-between mb-2">
										<p
											className="text-muted-foreground"
											style={{ fontSize: "10px" }}
										>
											Active Libraries
										</p>
										<FiBook className="w-4 h-4 text-green-500" />
									</div>
									<p
										className="font-bold text-green-600 mb-1"
										style={{ fontSize: "18px" }}
									>
										{stats.activeLibraries}
									</p>
								</CardContent>
							</Card>

							{/* Inactive Libraries */}
							<Card className="bg-card border-border transition-colors duration-300">
								<CardContent className="p-3">
									<div className="flex items-center justify-between mb-2">
										<p
											className="text-muted-foreground"
											style={{ fontSize: "10px" }}
										>
											Inactive Libraries
										</p>
										<FiBook className="w-4 h-4 text-red-500" />
									</div>
									<p
										className="font-bold text-red-600 mb-1"
										style={{ fontSize: "18px" }}
									>
										{stats.inactiveLibraries}
									</p>
								</CardContent>
							</Card>

							{/* Active Accounts */}
							<Card className="bg-card border-border transition-colors duration-300">
								<CardContent className="p-3">
									<div className="flex items-center justify-between mb-2">
										<p
											className="text-muted-foreground"
											style={{ fontSize: "10px" }}
										>
											Active Accounts
										</p>
										<FiUsers className="w-4 h-4 text-green-500" />
									</div>
									<p
										className="font-bold text-green-600 mb-1"
										style={{ fontSize: "18px" }}
									>
										{stats.activeAccounts}
									</p>
								</CardContent>
							</Card>

							{/* Inactive Accounts */}
							<Card className="bg-card border-border transition-colors duration-300">
								<CardContent className="p-3">
									<div className="flex items-center justify-between mb-2">
										<p
											className="text-muted-foreground"
											style={{ fontSize: "10px" }}
										>
											Inactive Accounts
										</p>
										<FiUsers className="w-4 h-4 text-red-500" />
									</div>
									<p
										className="font-bold text-red-600 mb-1"
										style={{ fontSize: "18px" }}
									>
										{stats.inactiveAccounts}
									</p>
								</CardContent>
							</Card>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up-delay-1">
							{/* Feedback Section - Left Side (2/3 width) with max-height and scrollable */}
							<div className="lg:col-span-2">
								<Card className="bg-card border-border transition-colors duration-300 max-h-[800px] flex flex-col">
									<CardContent className="p-6 flex flex-col overflow-hidden">
										<div className="flex-shrink-0">
											<h3
												className="font-semibold text-foreground mb-1"
												style={{ fontSize: "14px" }}
											>
												Feedback Management
											</h3>
											<p
												className="text-muted-foreground mb-6"
												style={{ fontSize: "11px" }}
											>
												Review and manage feedback submitted by users across all
												libraries
											</p>

											<div className="flex flex-col md:flex-row gap-3 mb-4">
												<div className="relative flex-1">
													<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
													<Input
														type="text"
														placeholder="Search feedback..."
														value={searchQuery}
														onChange={handleSearchChange}
														className="pl-10 bg-card border-border text-foreground h-9"
														style={{ fontSize: "11px" }}
													/>
												</div>

												<div className="flex items-center gap-3">
													<select
														value={filterLibrary}
														onChange={(e) => {
															setFilterLibrary(e.target.value);
															setCurrentPage(1);
														}}
														className="border border-border bg-card text-foreground rounded-md px-3 py-1.5 h-9 flex-1"
														style={{ fontSize: "11px" }}
													>
														{libraries.map((lib) => (
															<option key={lib} value={lib}>
																{lib === "all" ? "All Libraries" : lib}
															</option>
														))}
													</select>

													<select
														value={filterStatus}
														onChange={(e) => {
															setFilterStatus(e.target.value);
															setCurrentPage(1);
														}}
														className="border border-border bg-card text-foreground rounded-md px-3 py-1.5 h-9 flex-1"
														style={{ fontSize: "11px" }}
													>
														<option value="all">All Status</option>
														<option value="unread">Unread</option>
														<option value="read">Read</option>
													</select>
												</div>
											</div>
										</div>

										<div className="flex-1 overflow-y-auto space-y-4 pr-2">
											{currentFeedback.length > 0 ? (
												currentFeedback.map((feedback) => (
													<div
														key={feedback.id}
														className={`flex items-start gap-4 p-4 rounded-lg border ${
															feedback.isRead
																? "bg-muted/20 border-border"
																: "bg-card border-primary/20 shadow-sm"
														}`}
													>
														<Checkbox
															id={`feedback-${feedback.id}`}
															checked={feedback.isRead}
															onCheckedChange={(checked) =>
																handleCheckboxChange(feedback.id, checked)
															}
															className="mt-1"
														/>
														<Avatar className="h-10 w-10">
															<AvatarImage
																src={feedback.avatar || "/placeholder.svg"}
																alt={feedback.sender}
															/>
															<AvatarFallback>
																{feedback.sender.charAt(0)}
															</AvatarFallback>
														</Avatar>
														<div className="flex-1">
															<div className="flex items-center justify-between mb-1">
																<div>
																	<p
																		className="font-medium text-foreground"
																		style={{ fontSize: "12px" }}
																	>
																		{feedback.sender}
																	</p>
																	<p
																		className="text-muted-foreground"
																		style={{ fontSize: "10px" }}
																	>
																		{feedback.library}
																	</p>
																</div>
																<span
																	className="text-muted-foreground"
																	style={{ fontSize: "10px" }}
																>
																	{new Date(feedback.date).toLocaleDateString()}
																</span>
															</div>
															<span
																className="inline-block px-2 py-0.5 bg-primary/10 text-primary rounded-full mb-2"
																style={{ fontSize: "9px" }}
															>
																{feedback.type}
															</span>
															<p
																className="text-muted-foreground mb-2"
																style={{ fontSize: "11px" }}
															>
																{feedback.content}
															</p>
															{feedback.screenshot && (
																<div className="mt-2">
																	<p
																		className="text-foreground font-medium mb-1"
																		style={{ fontSize: "10px" }}
																	>
																		Screenshot:
																	</p>
																	<img
																		src={
																			feedback.screenshot || "/placeholder.svg"
																		}
																		alt="Feedback screenshot"
																		className="w-full max-h-40 object-cover rounded-md border border-border"
																	/>
																</div>
															)}
														</div>
													</div>
												))
											) : (
												<div
													className="text-center py-8 text-muted-foreground"
													style={{ fontSize: "11px" }}
												>
													No feedback found matching your filters.
												</div>
											)}
										</div>

										{filteredFeedback.length > itemsPerPage && (
											<div className="mt-6 flex-shrink-0 flex items-center justify-between pt-4 border-t border-border">
												<p
													className="text-muted-foreground"
													style={{ fontSize: "11px" }}
												>
													Showing {startIndex + 1}-
													{Math.min(endIndex, filteredFeedback.length)} of{" "}
													{filteredFeedback.length} feedback
												</p>
												<div className="flex items-center gap-2">
													<Button
														variant="outline"
														className="h-8 border-border text-foreground hover:bg-accent bg-transparent"
														onClick={() => handlePageChange(currentPage - 1)}
														disabled={currentPage === 1}
														style={{ fontSize: "11px" }}
													>
														<FiChevronLeft className="w-4 h-4" />
													</Button>
													<span
														className="text-muted-foreground"
														style={{ fontSize: "11px" }}
													>
														Page {currentPage} of {totalPages}
													</span>
													<Button
														variant="outline"
														className="h-8 border-border text-foreground hover:bg-accent bg-transparent"
														onClick={() => handlePageChange(currentPage + 1)}
														disabled={currentPage === totalPages}
														style={{ fontSize: "11px" }}
													>
														<FiChevronRight className="w-4 h-4" />
													</Button>
												</div>
											</div>
										)}
									</CardContent>
								</Card>
							</div>

							<div className="lg:col-span-1">
								<Card className="bg-card border-border transition-colors duration-300 h-fit">
									<CardContent className="p-6 flex flex-col items-center justify-center text-center">
										<h3
											className="font-bold text-foreground mb-2"
											style={{ fontSize: "18px" }}
										>
											Today's Audits
										</h3>
										<p
											className="text-muted-foreground mb-6"
											style={{ fontSize: "12px" }}
										>
											Total audit trail entries recorded today
										</p>

										<div className="mb-6">
											<div className="w-40 h-40 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
												<p
													className="font-bold text-primary"
													style={{ fontSize: "40px", lineHeight: "1" }}
												>
													{stats.todayAuditTrails}
												</p>
											</div>
										</div>

										<div className="w-full pt-6 border-t border-border">
											<div className="flex items-center justify-center gap-2 mb-2">
												<FiClock className="w-5 h-5 text-muted-foreground" />
												<h4
													className="font-semibold text-foreground"
													style={{ fontSize: "14px" }}
												>
													Last Update
												</h4>
											</div>
											<p
												className="text-muted-foreground mb-1"
												style={{ fontSize: "11px" }}
											>
												Most recent system activity
											</p>
											<p
												className="font-bold text-foreground bg-muted rounded-lg px-4 py-2 inline-block"
												style={{ fontSize: "13px" }}
											>
												{stats.lastUpdate}
											</p>
										</div>
									</CardContent>
								</Card>
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
