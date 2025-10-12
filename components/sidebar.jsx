"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
	FiHome,
	FiUsers,
	FiSettings,
	FiMoon,
	FiSun,
	FiChevronDown,
	FiChevronRight,
	FiLogOut,
	FiFileText,
	FiRepeat,
	FiUser,
	FiBell,
	FiArrowLeft,
	FiCpu,
	FiBook,
	FiLogIn,
	FiZap,
	FiMessageSquare,
	FiDroplet,
	FiInfo,
	Fi,
} from "react-icons/fi";
import { SiGoogleclassroom } from "react-icons/si";

import { cn } from "@/lib/utils";
import { useColor } from "@/contexts/ColorContext";
import { useUserAuth } from "@/contexts/UserContextAuth";
import LogoutConfirmationModal from "@/components/modal/logout-confirmation-modal";
import { PiStudent } from "react-icons/pi";
import { MdOutlinePerson3 } from "react-icons/md";
import { useEffect } from "react";

export function Sidebar({ isOpen: propIsOpen, setIsOpen: propSetIsOpen }) {
	const router = useRouter();
	const { userDetails } = useUserAuth();
	const { toggleDarkMode, isDarkMode } = useColor();
	const [showLogoutModal, setShowLogoutModal] = useState(false);
	const users = ["USR-2", "USR-3", "USR-4", "USR-5", "USR-6"].includes(
		userDetails?.us_level
	);

	const superadmin = userDetails?.us_level === "USR-1";
	const [internalOpen, setInternalOpen] = useState(false);
	const isControlled = typeof propIsOpen !== "undefined" && propSetIsOpen;
	const isOpen = isControlled ? propIsOpen : internalOpen;
	const setIsOpen = isControlled ? propSetIsOpen : setInternalOpen;

	useEffect(() => {
		const handler = () => setIsOpen((v) => !v);
		if (typeof window !== "undefined")
			window.addEventListener("sidebar-toggle", handler);
		return () => {
			if (typeof window !== "undefined")
				window.removeEventListener("sidebar-toggle", handler);
		};
	}, [setIsOpen]);

	useEffect(() => {
		const closeHandler = () => setIsOpen(false);
		if (typeof window !== "undefined")
			window.addEventListener("sidebar-close", closeHandler);
		return () => {
			if (typeof window !== "undefined")
				window.removeEventListener("sidebar-close", closeHandler);
		};
	}, [setIsOpen]);

	return (
		<>
			<div
				className={cn(
					"fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300",
					isOpen
						? "opacity-100 pointer-events-auto"
						: "opacity-0 pointer-events-none"
				)}
				onClick={() => setIsOpen(false)}
			/>

			<div
				className={cn(
					"fixed top-0 left-0 h-screen z-50 bg-card border-r border-border transition-all duration-300 overflow-y-auto flex flex-col",
					"md:relative md:top-0 md:left-0 md:block md:w-64 w-64",
					isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
				)}
				style={{ width: "16rem" }}
			>
				<div className="flex-1 px-3 py-4 mt-[75px] md:mt-[75px] ">
					{users && !["USR-5", "USR-6"].includes(userDetails?.us_level) && (
						<button
							onClick={() => router.push("/users")}
							className="flex items-center gap-3 px-3 py-2 text-foreground rounded-lg hover:bg-accent transition-colors w-full text-left text-xs mb-4"
						>
							<FiArrowLeft className="w-4 h-4" />
							Back
						</button>
					)}

					<div className="space-y-1">
						<p className="px-3 text-muted-foreground uppercase tracking-wider mb-2 text-[8px]">
							General
						</p>

						{superadmin && (
							<>
								<SidebarItem
									href="/superadmin/dashboard"
									icon={FiHome}
									label="Dashboard"
								/>
								<SidebarItem
									href="/library"
									icon={FiBook}
									label="Library Management"
								/>
								<SidebarCollapse
									label="Account Management"
									icon={FiUsers}
									name="/account"
								>
									<SidebarItem
										href="/account?type=patron"
										icon={PiStudent}
										label="Patrons"
									/>
									<SidebarItem
										href="/account?type=personnel"
										icon={MdOutlinePerson3}
										label="Personnel"
									/>
								</SidebarCollapse>
								<SidebarItem
									href="/superadmin/courses"
									icon={FiBook}
									label="Courses"
								/>
								<SidebarItem
									href="/audit"
									icon={FiSettings}
									label="Audit Trail"
								/>
							</>
						)}

						{users && (
							<>
								<SidebarItem href="/users/home" icon={FiHome} label="Home" />
								<SidebarCollapse
									label="Resources"
									icon={FiFileText}
									name="/resources"
								>
									<SidebarItem
										href="/resources/material/main"
										icon={FiBook}
										label="Materials"
									/>
									<SidebarItem
										href="/resources/discussion"
										icon={SiGoogleclassroom}
										label="Discussion Rooms"
									/>
									<SidebarItem
										href="/resources/computer"
										icon={FiCpu}
										label="Computers"
									/>
								</SidebarCollapse>
								<SidebarItem
									href="/transaction"
									icon={FiRepeat}
									label="Transactions"
								/>
								{!["USR-5", "USR-6"].includes(userDetails?.us_level) && (
									<SidebarCollapse
										label="Library Users"
										icon={FiUser}
										name="/account"
									>
										<SidebarItem
											href="/account?type=patron"
											icon={PiStudent}
											label="Patrons"
										/>

										<SidebarItem
											href="/account?type=personnel"
											icon={MdOutlinePerson3}
											label="Personnel"
										/>
									</SidebarCollapse>
								)}

								{["USR-5", "USR-6"].includes(userDetails?.us_level) && (
									<SidebarItem
										href="/account?type=personnel"
										icon={MdOutlinePerson3}
										label="Personnel"
									/>
								)}

								<SidebarItem
									href="/entry-exit"
									icon={FiLogIn}
									label="Entry & Exit"
								/>

								<SidebarItem
									href="/news-announcement"
									icon={FiBell}
									label="News & Announcement"
								/>

								{["USR-2", "USR-3"].includes(userDetails?.us_level) && (
									<SidebarItem
										href="/feedback"
										icon={FiMessageSquare}
										label="Feedback & FAQS"
									/>
								)}

								{["USR-2", "USR-3"].includes(userDetails?.us_level) && (
									<SidebarItem
										href="/audit"
										icon={FiSettings}
										label="Audit Trail"
									/>
								)}

								{!["USR-4", "USR-5", "USR-6"].includes(
									userDetails?.us_level
								) && (
									<SidebarCollapse
										label="Essential Report"
										icon={FiZap}
										name="/essential-report"
									>
										<SidebarItem
											href="/essential-report/material-statistics"
											icon={FiBook}
											label="Material Statistics"
										/>
										<SidebarItem
											href="/essential-report/dr-statistics"
											icon={FiCpu}
											label="Discussion Room Statistics"
										/>

										<SidebarItem
											href="/essential-report/computer-statistics"
											icon={SiGoogleclassroom}
											label="Computer Statistics"
										/>

										<SidebarItem
											href="/essential-report/users-statistics"
											icon={FiUsers}
											label="Users Statistics"
										/>

										<SidebarItem
											href="/essential-report/entry-exit-statistics"
											icon={FiLogIn}
											label="Entry & Exit Statistics"
										/>
									</SidebarCollapse>
								)}
							</>
						)}

						<SidebarItem
							href={`/account/details?id=${userDetails?.uid}`}
							icon={FiUser}
							label="My Profile"
						/>
					</div>

					<div className="mt-6 space-y-1">
						<p className="px-3 text-muted-foreground uppercase tracking-wider mb-2 text-[8px]">
							Tools
						</p>

						<SidebarItem
							href="/appearance"
							icon={FiDroplet}
							label="System Appearance"
						/>

						{users && (
							<SidebarItem href="/users/about" icon={FiInfo} label="About" />
						)}

						<button
							onClick={toggleDarkMode}
							className="flex items-center gap-3 px-3 py-2 text-foreground rounded-lg hover:bg-accent transition-colors w-full text-left text-xs"
						>
							{isDarkMode ? (
								<FiSun className="w-4 h-4" />
							) : (
								<FiMoon className="w-4 h-4" />
							)}
							{isDarkMode ? "Light Mode" : "Dark Mode"}
						</button>

						<button
							onClick={() => setShowLogoutModal(true)}
							className="flex items-center gap-3 px-3 py-2 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left text-xs"
						>
							<FiLogOut className="w-4 h-4" />
							Logout
						</button>
					</div>
				</div>
			</div>

			<LogoutConfirmationModal
				isOpen={showLogoutModal}
				onClose={() => setShowLogoutModal(false)}
			/>
		</>
	);
}

const SidebarItem = ({
	href,
	icon: Icon,
	label,
	iconWidth = 4,
	iconHeight = 4,
}) => {
	const pathname = usePathname();
	const isActive =
		pathname === href || (href !== "/" && pathname.startsWith(href));

	return (
		<Link
			href={href}
			className={cn(
				"flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-[12px]",
				isActive ? "text-white font-medium" : "text-foreground hover:bg-accent"
			)}
			style={{
				backgroundColor: isActive ? "var(--color-primary)" : undefined,
			}}
			onClick={() => {
				if (typeof window !== "undefined") {
					window.dispatchEvent(new CustomEvent("sidebar-close"));
				}
			}}
		>
			<Icon className={`w-${iconWidth} h-${iconHeight} flex-shrink-0`} />
			{label}
		</Link>
	);
};

const SidebarCollapse = ({ label, icon: Icon, name, children }) => {
	const pathname = usePathname();
	const [expanded, setExpanded] = useState(false);
	const isActive = pathname.startsWith(name);
	return (
		<div>
			<div
				onClick={() => setExpanded(!expanded)}
				className={cn(
					"flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors text-[12px]",
					isActive
						? "text-white font-medium"
						: "text-foreground hover:bg-accent"
				)}
				style={{
					backgroundColor: isActive ? "var(--color-primary)" : undefined,
				}}
			>
				<Icon className="w-4 h-4" />
				{label}
				<span className="ml-auto">
					{expanded ? <FiChevronDown /> : <FiChevronRight />}
				</span>
			</div>
			{expanded && <div className="ml-6 space-y-1 mt-1">{children}</div>}
		</div>
	);
};
