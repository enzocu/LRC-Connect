"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
	FiFilter,
	FiSearch,
	FiChevronLeft,
	FiChevronRight,
	FiMoon,
	FiSun,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useColor } from "@/contexts/ColorContext";
import { useAlertActions } from "@/contexts/AlertContext";
import ProtectedRoute from "@/contexts/ProtectedRoute";
import { useLoading } from "@/contexts/LoadingProvider";

import { getLibraryByIDs } from "@/controller/firebase/get/getLibrarybyIDs";
import { getMaterialFeaturedList } from "@/controller/firebase/get/getMaterialFeaturedList";

export default function AdminWelcomePage() {
	const pathname = usePathname();
	const { currentPalette, isDarkMode, toggleDarkMode } = useColor();
	const { userDetails, libraryAssociated } = useUserAuth();
	const Alert = useAlertActions();
	const router = useRouter();
	const { setLoading, setPath } = useLoading();

	const [currentBookIndex, setCurrentBookIndex] = useState(0);

	const [materialData, setMaterialData] = useState([]);
	const [libraries, setLibrary] = useState([]);

	const nextBook = () => {
		setCurrentBookIndex((prev) => (prev + 1) % materialData.length);
	};

	const prevBook = () => {
		setCurrentBookIndex(
			(prev) => (prev - 1 + materialData.length) % materialData.length
		);
	};

	const getVisibleBooks = () => {
		const books = [];
		for (let i = 0; i < 5; i++) {
			const index = (currentBookIndex + i) % materialData.length;
			books.push(materialData[index]);
		}
		return books;
	};

	useEffect(() => {
		setPath(pathname);
		if (userDetails) {
			getMaterialFeaturedList(null, setMaterialData, setLoading, Alert);

			getLibraryByIDs(userDetails, setLibrary, setLoading, Alert);
		}
	}, [userDetails]);

	return (
		<ProtectedRoute allowedRoles={["USR-2", "USR-3", "USR-4"]}>
			<div className="min-h-screen bg-background transition-colors duration-300">
				<div className="fixed top-4 right-4 z-40 flex items-center space-x-3">
					<button
						onClick={toggleDarkMode}
						className="flex items-center gap-2 px-3 py-2 bg-card text-foreground rounded-lg hover:bg-accent transition-colors shadow-sm border border-border text-[12px]"
					>
						{isDarkMode ? (
							<FiSun className="w-4 h-4" />
						) : (
							<FiMoon className="w-4 h-4" />
						)}
						{isDarkMode ? "Light Mode" : "Dark Mode"}
					</button>
				</div>

				{/* Main Content */}
				<div className="flex flex-col items-center justify-center min-h-screen px-6 py-16  overflow-x-hidden">
					<div className="text-center mb-16 max-w-4xl animate-fade-in">
						<p className="text-muted-foreground mb-3 text-[14px]">
							Library Management System
						</p>
						<h1 className="font-bold mb-12 leading-tight text-foreground transition-colors duration-300 text-[36px]">
							Manage Your Library{" "}
							<span style={{ color: currentPalette.primary }}>
								Resources Efficiently
							</span>
						</h1>

						<div
							className="flex items-center justify-center mb-16 max-w-2xl mx-auto animate-slide-up"
							onClick={() => router.push("/resources/material/branches/all")}
						>
							<div className="flex w-full bg-card rounded-lg shadow-sm border border-border overflow-hidden">
								<button className="flex items-center space-x-2 px-4 py-3 bg-muted hover:bg-accent border-r border-border transition-colors">
									<FiFilter className="w-4 h-4 text-muted-foreground" />
									<span
										style={{ fontSize: "14px" }}
										className="font-medium text-foreground"
									>
										Filter
									</span>
								</button>

								<div className="flex-1 relative">
									<Input
										placeholder="Search through library collections and resources"
										className="border-0 rounded-none h-12 focus:ring-0 focus:border-0 bg-transparent"
										style={{ fontSize: "14px" }}
									/>
								</div>

								<Button
									className="rounded-none h-12 px-6 text-white hover:opacity-90 transition-all duration-200"
									style={{ backgroundColor: currentPalette.primary }}
								>
									<FiSearch className="w-4 h-4" />
								</Button>
							</div>
						</div>
					</div>

					<div
						className="mb-24 w-full max-w-6xl animate-slide-up "
						style={{ animationDelay: "0.2s" }}
					>
						<div className="relative flex items-center justify-center">
							<button
								onClick={prevBook}
								className="absolute left-0 z-10 p-3 rounded-full bg-card shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border border-border"
							>
								<FiChevronLeft className="w-6 h-6 text-foreground" />
							</button>

							<div className="flex space-x-8 items-center justify-center">
								{getVisibleBooks().map((material, index) => (
									<div
										key={index}
										className={`flex flex-col items-center transition-all duration-500 hover:scale-105 ${
											index === 2
												? "scale-110 z-10"
												: index === 1 || index === 3
												? "scale-100"
												: "scale-90 opacity-60"
										}`}
									>
										<div className="w-40 h-60 rounded-lg mb-3 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-gray-100">
											<img
												src={material?.ma_coverURL || "/placeholder.svg"}
												alt={material?.ma_title}
												className="w-full h-full object-cover"
												onError={(e) => {
													e.target.src =
														"/placeholder.svg?height=240&width=160";
												}}
											/>
										</div>

										{/* Only show text if this is the focused item */}
										{index === 2 && (
											<div
												className="text-center animate-fade-in"
												style={{ animationDelay: "0.5s" }}
											>
												<p className="font-semibold text-foreground mb-1 text-[16px]">
													{material?.ma_title}
												</p>
												<p className="text-muted-foreground text-[14px]">
													{material?.ma_author}
												</p>
											</div>
										)}
									</div>
								))}
							</div>

							<button
								onClick={nextBook}
								className="absolute right-0 z-10 p-3 rounded-full bg-card shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border border-border"
							>
								<FiChevronRight className="w-6 h-6 text-foreground" />
							</button>
						</div>
					</div>

					{libraries.length > 0 && (
						<>
							<div
								className="text-center mb-6 animate-fade-in"
								style={{ animationDelay: "0.4s" }}
							>
								<h2 className="font-semibold text-foreground text-[18px]">
									Associated Library
								</h2>
								<p className="text-muted-foreground text-[14px]">
									Choose a library to access management features
								</p>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full">
								{libraries.map((library, index) => (
									<div
										key={library.id}
										className="hover:shadow-md transition-all duration-300 overflow-hidden animate-slide-up bg-card border border-border border-l-border rounded-lg"
									>
										<div className="h-32 bg-card overflow-hidden ">
											<img
												src={library.li_photoURL || "/placeholder.svg"}
												alt={library.li_name}
												className="w-full h-full object-cover rounded-t-lg transition-transform duration-300 bg-gray-100"
												onError={(e) => {
													e.target.src =
														"/placeholder.svg?height=128&width=200";
												}}
											/>
										</div>
										<div className="p-4">
											<h4 className="font-medium text-foreground text-[14px]">
												{library.li_name}
											</h4>
											<p className="text-muted-foreground mb-2 text-[12px]">
												{library.li_address}
											</p>

											<Button
												variant="link"
												size="sm"
												className="text-primary-custom hover:text-secondary-custom text-[12px] p-0 h-0"
												onClick={() => libraryAssociated(library, router)}
											>
												View Details
											</Button>
										</div>
									</div>
								))}
							</div>
						</>
					)}
				</div>
			</div>
		</ProtectedRoute>
	);
}
