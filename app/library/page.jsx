"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import EmptyState from "@/components/tags/empty";
import { FiSearch, FiPlus, FiChevronDown, FiCamera } from "react-icons/fi";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import ProtectedRoute from "@/contexts/ProtectedRoute";
import { useLoading } from "@/contexts/LoadingProvider";
import { ScannerModal } from "@/components/modal/scanner-modal";
import PaginationControls from "@/components/tags/pagination";

import { getLibraryList } from "@/controller/firebase/get/getLibraryList";

export default function LibraryList() {
	const router = useRouter();
	const pathname = usePathname();
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const { setLoading, setPath, loading } = useLoading();

	const [libraryData, setLibraryData] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedStatus, setSelectedStatus] = useState("Active");

	//SCANNER
	const [isScannerOpen, setIsScannerOpen] = useState(false);

	//PAGINATION
	const [pageCursors, setPageCursors] = useState([]);
	const pageLimit = 5;
	const [currentPage, setCurrentPage] = useState(1);
	const [ctrPages, setCtrPage] = useState(1);

	useEffect(() => {
		setPath(pathname);
		if (userDetails) {
			getLibraryList(
				setLibraryData,
				selectedStatus,
				searchQuery,
				setLoading,
				Alert,
				setCtrPage,
				pageLimit,
				pageCursors,
				setPageCursors,
				currentPage
			);
		}
	}, [userDetails, currentPage, selectedStatus, searchQuery]);

	return (
		<ProtectedRoute allowedRoles={["USR-1"]}>
			<div className="flex h-screen bg-background transition-colors duration-300">
				<Sidebar />

				<div className="flex-1 flex flex-col overflow-hidden">
					<Header />

					<main className="flex-1 overflow-auto p-6 pt-24 overflow-auto">
						<div className="mb-8 animate-fade-in">
							<h1 className="font-semibold text-foreground text-[20px]">
								Library Management
							</h1>
							<p className="text-muted-foreground text-[14px]">
								Manage library registrations, locations, and institutional
								details
							</p>
						</div>

						<div className="flex items-left justify-between flex-col sm:flex-row gap-4 mb-8 animate-slide-up">
							<div className="relative flex items-center flex-1 max-w-md">
								<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
								<Input
									placeholder="Search library..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10 pr-24 h-9 bg-background border-none text-foreground rounded-md shadow-sm"
									style={{ fontSize: "12px" }}
								/>

								<div className="absolute right-[87px] top-1/2 transform -translate-y-1/2">
									<FiCamera
										onClick={() => setIsScannerOpen(true)}
										className="w-4 h-4 text-muted-foreground"
									/>
								</div>

								<div className="absolute right-0 top-0 h-full flex items-center gap-5">
									<select
										value={selectedStatus}
										onChange={(e) => setSelectedStatus(e.target.value)}
										className="h-full pl-2 pr-6 text-xs rounded-l-none border-l border-border focus:outline-none bg-background appearance-none text-[12px]"
									>
										<option disabled>Filter</option>
										<option value="Active">Active</option>
										<option value="Inactive">Inactive</option>
									</select>

									<FiChevronDown className="absolute right-2 pointer-events-none text-muted-foreground w-4 h-4" />
								</div>
							</div>

							<Button
								onClick={() => router.push(`/library/register`)}
								className="bg-primary-custom hover:bg-secondary-custom text-white h-9 px-4 w-fit text-[12px]"
							>
								<FiPlus className="w-4 h-4 mr-1" />
								Register Library
							</Button>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 animate-slide-up-delay-1">
							{libraryData.map((library, index) => (
								<Card
									key={library.id}
									className="hover:shadow-md transition-all  border-l-primary-custom bg-card border-border duration-300 animate-slide-up-delay-2 h-fit"
									style={{ animationDelay: `${0.2 + index * 0.1}s` }}
								>
									<CardContent className="p-0">
										<div className="h-32 w-full bg-muted rounded-t-lg  overflow-hidden">
											<img
												src={library.li_photoURL}
												alt={library.li_name}
												className="w-full h-full object-cover"
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
												onClick={() =>
													router.push(`/library/details?id=${library.id}`)
												}
											>
												View Details
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>

						<EmptyState data={libraryData} loading={loading} />

						<PaginationControls
							ctrPages={ctrPages}
							currentPage={currentPage}
							setCurrentPage={setCurrentPage}
						/>
					</main>
				</div>

				{/* {Scanner} */}
				<ScannerModal
					isOpen={isScannerOpen}
					onClose={() => setIsScannerOpen(false)}
					setResult={setSearchQuery}
					allowedPrefix="LIB"
				/>
			</div>
		</ProtectedRoute>
	);
}
