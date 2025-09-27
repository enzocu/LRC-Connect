"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Modal } from "@/components/modal";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/tags/empty";

import { FiMonitor, FiMapPin } from "react-icons/fi";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import { useLoading } from "@/contexts/LoadingProvider";

import PaginationControls from "@/components/tags/pagination";
import { getRankList } from "@/controller/firebase/get/getRankVisit";

export function VisitRankModal({ isOpen, onClose, showMode, libraryData }) {
	const pathname = usePathname();
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const { setLoading, setPath, loading } = useLoading();

	const [userData, setUserData] = useState([]);
	const [selectedLibrary, setSelectedLibrary] = useState(
		userDetails?.us_liID ? userDetails?.us_liID.id : "All"
	);
	const [selectedRole, setSelectedRole] = useState("All");
	const [showLoggedIn, setShowLoggedIn] = useState(showMode);
	const [isBelowSm, setIsBelowSm] = useState(false);

	//PAGINATION
	const pageLimit = 5;
	const [currentPage, setCurrentPage] = useState(1);
	const [ctrPages, setCtrPage] = useState(1);

	useEffect(() => {
		setPath(pathname);

		if (!isOpen || !userDetails || !userDetails?.us_liID) return;
		getRankList(
			userDetails?.us_liID,
			setUserData,
			showLoggedIn,
			selectedRole,
			selectedLibrary,

			setLoading,
			Alert,
			pageLimit,
			setCtrPage,
			currentPage
		);
	}, [
		userDetails,
		isOpen,
		currentPage,
		selectedLibrary,
		selectedRole,
		showLoggedIn,
	]);

	useEffect(() => {
		setShowLoggedIn(showMode);
	}, [showMode]);

	useEffect(() => {
		const media = window.matchMedia("(max-width: 639px)");
		setIsBelowSm(media.matches);

		const handler = (e) => setIsBelowSm(e.matches);

		media.addEventListener?.("change", handler) || media.addListener(handler);
		return () =>
			media.removeEventListener?.("change", handler) ||
			media.removeListener(handler);
	}, []);

	if (!isOpen) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Library Visit Rankings"
			size="xl"
		>
			<div className="p-6 space-y-6">
				<div className="flex sm:justify-end items-start">
					<div className="flex items-center border border-border rounded-md h-fit w-fit">
						<Button
							variant={!showLoggedIn ? "default" : "ghost"}
							size="sm"
							onClick={() => setShowLoggedIn(false)}
							className={`h-9 px-3 rounded-r-none  text-[12px] ${
								!showLoggedIn
									? "bg-primary-custom text-white hover:text-white hover:bg-primary-custom/90"
									: "hover:bg-accent"
							}`}
						>
							<FiMonitor className="w-4 h-4 mr-1" />
							OnApp
						</Button>
						<Button
							variant={showLoggedIn ? "default" : "ghost"}
							size="sm"
							onClick={() => setShowLoggedIn(true)}
							className={`h-9 px-3 rounded-l-none text-[12px] ${
								showLoggedIn
									? "bg-primary-custom text-white hover:text-white hover:bg-primary-custom/90"
									: "hover:bg-accent"
							}`}
						>
							<FiMapPin className="w-4 h-4 mr-1" />
							OnSite
						</Button>
					</div>
				</div>

				{!isBelowSm && userData.length > 0 && (
					<div className="relative hidden sm:flex justify-center items-end gap-14 pt-10  ">
						{renderRankCard(userData[1], 2, true)}
						{renderRankCard(userData[0], 1, true)}
						{renderRankCard(userData[2], 3, true)}
					</div>
				)}
				<EmptyState data={userData} loading={loading} />

				<div className="flex flex-col items-start gap-2 sm:pt-6">
					<label className="font-medium text-foreground text-[12px]">
						View rankings for:
					</label>
					{libraryData && libraryData?.length > 0 && (
						<div className="flex flex-wrap gap-4 mb-2">
							{libraryData.map((lib) => (
								<button
									key={lib.id}
									onClick={() => setSelectedLibrary(lib.id)}
									className={cn(
										"text-[12px] px-4 py-2 rounded-full transition-colors duration-200",
										selectedLibrary === lib.id
											? "bg-primary-custom text-white shadow-md"
											: "bg-muted text-muted-foreground hover:bg-muted/80"
									)}
								>
									{lib.li_name}
								</button>
							))}
						</div>
					)}
					<div className="flex  gap-4 ">
						<label className="flex items-center gap-2 text-[12px]">
							<Checkbox
								checked={selectedRole == "All"}
								onCheckedChange={() => setSelectedRole("All")}
							/>
							All User
						</label>
						<label className="flex items-center gap-2 text-[12px]">
							<Checkbox
								checked={selectedRole == "Patron"}
								onCheckedChange={() => setSelectedRole("Patron")}
							/>
							Patron
						</label>
						<label className="flex items-center gap-2 text-[12px]">
							<Checkbox
								checked={selectedRole == "Personnel"}
								onCheckedChange={() => setSelectedRole("Personnel")}
							/>
							Personnel
						</label>
					</div>
				</div>

				{/* Rank 4 and Beyond (Scrollable List) */}
				{userData.slice(!isBelowSm ? 3 : 0).length > 0 && (
					<div className="max-h-80 rounded-lg shadow-sm">
						<div className="divide-y divide-border">
							{userData.slice(!isBelowSm ? 3 : 0).map((user, index) => {
								const actualIndex = index + (!isBelowSm ? 4 : 1);
								const isCurrentUser = user.id === userDetails?.uid;

								return (
									<div
										key={user.id}
										className={cn(
											"flex items-center gap-6 p-4 transition-colors duration-200",
											isCurrentUser
												? "bg-blue-100/30 dark:bg-blue-900/30 border-l-4 border-blue-500"
												: "hover:bg-accent/20"
										)}
									>
										<span className="font-medium text-foreground w-8 text-center text-[14px]">
											{actualIndex}
										</span>

										<div className="flex items-start gap-4">
											<div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex  items-center justify-center">
												<img
													src={user.us_avatar || "/placeholder.svg"}
													alt={user.us_name}
													className="w-full h-full object-cover"
												/>
											</div>
											<div>
												<h3 className="font-medium text-foreground text-[14px]">
													{user.us_name}
												</h3>
												<p className="text-primary-custom text-[12px]">
													{user.us_type}
													<span className="text-muted-foreground">
														{" • "}
														{user.us_schoolID}
													</span>
												</p>
											</div>
										</div>

										<span className="font-medium text-foreground text-[14px] ml-auto text-center">
											{user.us_visits} visits
										</span>
									</div>
								);
							})}
						</div>
					</div>
				)}

				<PaginationControls
					ctrPages={ctrPages}
					currentPage={currentPage}
					setCurrentPage={setCurrentPage}
				/>
			</div>
		</Modal>
	);
}

const renderRankCard = (user, rank, isTop3 = false) => {
	const rankBadge =
		rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

	const top3BgColor =
		rank === 1
			? "bg-green-50 dark:bg-green-950/30"
			: rank === 2
			? "bg-gray-50 dark:bg-gray-900/30"
			: rank === 3
			? "bg-amber-50 dark:bg-amber-950/30"
			: "";

	const top3BorderColor =
		rank === 1
			? "border-green-300 dark:border-green-700"
			: rank === 2
			? "border-gray-300 dark:border-gray-700"
			: rank === 3
			? "border-amber-300 dark:border-amber-700"
			: "";

	const top3AvatarBorder =
		rank === 1
			? "border-green-400"
			: rank === 2
			? "border-gray-400"
			: rank === 3
			? "border-amber-700"
			: "";

	return (
		<div
			key={rank}
			className={cn(
				"w-[190px] flex flex-col items-center text-center p-4 rounded-lg transition-all duration-300",
				isTop3
					? `${top3BgColor} ${top3BorderColor} border shadow-lg relative`
					: "bg-card border border-border hover:bg-accent/20",

				isTop3 &&
					rank === 1 &&
					"scale-105 -translate-y-4 md:-translate-y-8 z-10",
				isTop3 && rank === 2 && "translate-x-2 md:translate-x-4",
				isTop3 && rank === 3 && "-translate-x-2 md:-translate-x-4"
			)}
		>
			<div
				className={cn(
					"w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center mb-3 border-2",
					isTop3 ? top3AvatarBorder : "border-muted-foreground/20"
				)}
			>
				<img
					src={user?.us_avatar || "/placeholder.svg"}
					alt={user?.us_name}
					className="w-full h-full object-cover"
				/>
			</div>

			<h2 className="font-medium text-primary-custom text-[18px]">
				{rankBadge} Rank {rank}
			</h2>

			<p className="text-muted-foreground  mb-2 text-[12px]">
				{user?.us_visits || 0} visits
			</p>

			<h3 className="font-medium text-foreground text-[14px]">
				{user?.us_name || "No ranking yet"}
			</h3>
			<p className="text-primary-custom text-[12px]">
				{user?.us_type || "Type"}
				<span className="text-muted-foreground">
					{" • "}
					{user?.us_schoolID || "ID"}
				</span>
			</p>
		</div>
	);
};
