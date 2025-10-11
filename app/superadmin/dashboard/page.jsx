"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FiBook, FiUsers, FiClock, FiSearch } from "react-icons/fi";

import EmptyState from "@/components/tags/empty";
import { useAlertActions } from "@/contexts/AlertContext";
import ProtectedRoute from "@/contexts/ProtectedRoute";
import { useLoading } from "@/contexts/LoadingProvider";

import { getDashboardStats } from "@/controller/firebase/get/getDashboardStats";
export default function Dashboard() {
	const pathname = usePathname();
	const Alert = useAlertActions();
	const { setLoading, setPath, loading } = useLoading();

	const [searchQuery, setSearchQuery] = useState("");
	const [filterLibrary, setFilterLibrary] = useState("All");
	const [filterStatus, setFilterStatus] = useState("All");

	const [statistics, setStatistics] = useState({
		activeLibraries: 0,
		inactiveLibraries: 0,
		activeAccounts: 0,
		inactiveAccounts: 0,
		todayAuditTrails: 0,
		lastUpdate: 0,
	});

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
	];

	useEffect(() => {
		let unsubscribe;
		setPath(pathname);
		const fetchData = async () => {
			unsubscribe = await getDashboardStats(setStatistics, setLoading, Alert);
		};

		fetchData();

		return () => {
			if (typeof unsubscribe === "function") {
				unsubscribe();
			}
		};
	}, []);

	return (
		<div className="flex h-screen bg-background transition-colors duration-300">
			<Sidebar />

			<div className="flex-1 flex flex-col overflow-hidden">
				<Header />

				<main className="flex-1 overflow-auto p-6 pt-24 overflow-auto">
					<div className="mb-8 animate-fade-in">
						<h1 className="font-semibold text-foreground text-[20px]">
							Dashboard
						</h1>
						<p className="text-muted-foreground text-[14px]">
							Overview of library system statistics and key metrics
						</p>
					</div>

					<div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-14 animate-slide-up">
						<Card className="bg-card border-border transition-colors duration-300">
							<CardContent className="p-6">
								<div className="flex items-center justify-between mb-2">
									<p className="text-muted-foreground text-[12px]">
										Active Libraries
									</p>
									<FiBook className="w-4 h-4 text-green-500" />
								</div>
								<p className="font-bold text-green-600 text-[18px]">
									{statistics.activeLibraries}
								</p>
							</CardContent>
						</Card>

						{/* Inactive Libraries */}
						<Card className="bg-card border-border transition-colors duration-300">
							<CardContent className="p-6">
								<div className="flex items-center justify-between mb-2">
									<p className="text-muted-foreground text-[12px]">
										Inactive Libraries
									</p>
									<FiBook className="w-4 h-4 text-red-500" />
								</div>
								<p className="font-bold text-red-600 text-[18px]">
									{statistics.inactiveLibraries}
								</p>
							</CardContent>
						</Card>

						{/* Active Accounts */}
						<Card className="bg-card border-border transition-colors duration-300">
							<CardContent className="p-6">
								<div className="flex items-center justify-between mb-2">
									<p className="text-muted-foreground text-[12px]">
										Active Accounts
									</p>
									<FiUsers className="w-4 h-4 text-green-500" />
								</div>
								<p className="font-bold text-green-600 text-[18px]">
									{statistics.activeAccounts}
								</p>
							</CardContent>
						</Card>

						{/* Inactive Accounts */}
						<Card className="bg-card border-border transition-colors duration-300">
							<CardContent className="p-6">
								<div className="flex items-center justify-between mb-2">
									<p className="text-muted-foreground text-[12px]">
										Inactive Accounts
									</p>
									<FiUsers className="w-4 h-4 text-red-500" />
								</div>
								<p className="font-bold text-red-600 text-[18px]">
									{statistics.inactiveAccounts}
								</p>
							</CardContent>
						</Card>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-14 animate-slide-up-delay-1">
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

										<div className="flex flex-col md:flex-row gap-3 mb-6">
											<div className="relative flex-1">
												<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
												<Input
													type="text"
													placeholder="Search feedback..."
													value={searchQuery}
													onChange={(e) => setSearchQuery(e.target.value)}
													className="pl-10 bg-card border-border text-foreground h-9"
													style={{ fontSize: "11px" }}
												/>
											</div>

											<div className="flex items-center gap-3">
												<select
													value={filterLibrary}
													onChange={(e) => setFilterLibrary(e.target.value)}
													className="border border-border bg-card text-foreground rounded-md px-3 py-1.5 h-9 flex-1"
													style={{ fontSize: "11px" }}
												>
													<option value="All">All Libraries</option>
													<option value="lrc-nu-baliwag">LRC NU Baliwag</option>
													<option value="lrc-nu-malolos">LRC NU</option>
												</select>

												<select
													value={filterStatus}
													onChange={(e) => setFilterStatus(e.target.value)}
													className="border border-border bg-card text-foreground rounded-md px-3 py-1.5 h-9 flex-1"
													style={{ fontSize: "11px" }}
												>
													<option value="All">All Status</option>
													<option value="unread">Unread</option>
													<option value="read">Read</option>
												</select>
											</div>
										</div>
									</div>

									<div className="flex-1 overflow-y-auto space-y-4 pr-2">
										{feedbackItems?.map((feedback) => (
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
																src={feedback.screenshot || "/placeholder.svg"}
																alt="Feedback screenshot"
																className="w-full max-h-40 object-cover rounded-md border border-border"
															/>
														</div>
													)}
												</div>
											</div>
										))}
									</div>
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
												{statistics.todayAuditTrails}
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
											className="text-muted-foreground mb-4"
											style={{ fontSize: "11px" }}
										>
											Most recent system activity
										</p>
										<p className="font-semibold text-foreground bg-muted rounded-lg px-4 py-2 inline-block text-[14px]">
											{statistics.lastUpdate}
										</p>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
