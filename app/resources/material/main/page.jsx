"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	FiBook,
	FiMonitor,
	FiHeadphones,
	FiDatabase,
	FiArchive,
	FiBookmark,
} from "react-icons/fi";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import ProtectedRoute from "@/contexts/ProtectedRoute";
import { useLoading } from "@/contexts/LoadingProvider";

import { getMaterialFeaturedList } from "../../../../controller/firebase/get/getMaterialFeaturedList";
import { getLibraryFeatureList } from "../../../../controller/firebase/get/getLibraryFeatureList";

const materialFormats = [
	{
		id: "hard-copy",
		name: "Hard Copy",
		icon: FiBook,
		count: 3,
		description: "Physical books and printed materials",
		color: "bg-blue-900",
	},
	{
		id: "soft-copy",
		name: "Soft Copy",
		icon: FiMonitor,
		count: 3,
		description: "Digital books and electronic resources",
		color: "bg-green-700",
	},
	{
		id: "audio-copy",
		name: "Audio Copy",
		icon: FiHeadphones,
		count: 3,
		description: "Audiobooks and audio materials",
		color: "bg-[#FF9A00]",
	},
];

export default function ResourceMaterials() {
	const router = useRouter();
	const pathname = usePathname();
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const { setLoading, setPath } = useLoading();

	const [materialData, setMaterialData] = useState([]);
	const [libraryData, setLibraryData] = useState([]);

	useEffect(() => {
		setPath(pathname);
		if (userDetails && userDetails?.us_liID) {
			getMaterialFeaturedList(
				userDetails?.us_liID,
				setMaterialData,
				setLoading,
				Alert
			);

			getLibraryFeatureList(setLibraryData, setLoading, Alert);
		}
	}, [userDetails]);

	useEffect(() => {
		getLibraryFeatureList(setLibraryData, Alert);
	}, []);

	return (
		<ProtectedRoute
			allowedRoles={["USR-2", "USR-3", "USR-4", "USR-5", "USR-6"]}
		>
			<div className="flex h-screen bg-background transition-colors duration-300">
				<Sidebar />

				<div className="flex-1 flex flex-col overflow-hidden">
					<Header />

					<main className="flex-1 overflow-auto p-6 pt-24 overflow-auto">
						<div className="mb-8 animate-fade-in">
							<h1 className="font-semibold text-foreground text-[20px]">
								Resource Materials
							</h1>
							<p className="text-muted-foreground text-[14px]">
								Manage and browse library resources and materials
							</p>
						</div>

						<div className="animate-slide-up">
							<div className="flex items-start justify-between mb-6">
								<div>
									<h2 className="font-semibold text-foreground text-[18px]">
										Main Library
									</h2>
									<p className="text-muted-foreground text-[12px]">
										Central Hub of Learning and Discovery
									</p>
								</div>
								<Button
									variant="link"
									size="sm"
									className="text-primary-custom hover:text-secondary-custom text-[12px] px-0"
									onClick={() => router.push("/resources/material/main/all")}
								>
									See All
								</Button>
							</div>

							<div className="flex items-center justify-start gap-6 mb-8">
								{materialFormats.map((format) => (
									<div
										key={format.id}
										className="flex flex-col items-center group cursor-pointer"
									>
										<div
											className={`w-16 h-16 rounded-full flex items-center justify-center ${format.color} text-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105`}
										>
											<format.icon className="w-6 h-6" />
										</div>
										<h4 className="font-medium text-foreground text-center mt-3 text-[14px]">
											{format.name}
										</h4>
										<p className="text-muted-foreground text-center  text-[12px]">
											{format.count.toLocaleString()} items
										</p>
									</div>
								))}
							</div>

							<div className="overflow-x-auto pb-2">
								<div className="flex gap-6 min-w-max">
									{materialData.map((material, index) => (
										<Card
											key={index}
											className="w-[450px] bg-card  border-none shadow-sm transition-colors duration-300 hover:shadow-md rounded-lg flex-shrink-0 max-w-lg h-fit"
										>
											<CardContent className="flex gap-4 p-4">
												<img
													src={material?.ma_coverURL || "/placeholder.svg"}
													alt={material?.ma_title}
													className={`h-28 w-20 object-cover rounded-lg bg-gray-100 flex-shrink-0`}
												/>
												<div className="flex-1  space-y-2">
													<div>
														<h4 className="font-medium text-foreground text-[14px]">
															{material?.ma_title}
														</h4>
														<p className="text-primary-custom text-[12px]">
															{material.ma_copyright}
															<span className="text-muted-foreground">
																{" • "}
																{material.ma_libraryCall}
															</span>
														</p>
													</div>

													<div>
														<p className="text-[12px]">Author</p>
														<p className="text-muted-foreground  text-[12px]">
															{material.ma_author}
														</p>
													</div>

													<div>
														<p className="text-[12px]">Description</p>
														<p className="text-muted-foreground  text-[12px] line-clamp-2">
															{material.ma_description}
														</p>
													</div>

													<Button
														variant="link"
														size="sm"
														className="text-primary-custom hover:text-secondary-custom text-[12px] px-0 "
														onClick={() =>
															router.push(
																`/resources/material/details?id=${material.id}`
															)
														}
													>
														View details
													</Button>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</div>
						</div>

						<div className="animate-slide-up-delay-1 mt-8">
							<div className="flex items-start justify-between mb-6">
								<div>
									<h2 className="font-semibold text-foreground text-[18px]">
										Library Branches
									</h2>
									<p className="text-muted-foreground text-[12px]">
										Extending Knowledge Across Campuses
									</p>
								</div>

								<Button
									variant="link"
									size="sm"
									className="text-primary-custom hover:text-secondary-custom text-[12px] px-0"
									onClick={() =>
										router.push("/resources/material/branches/all")
									}
								>
									See All
								</Button>
							</div>

							<div className="overflow-x-auto pb-2">
								<div className="flex gap-6 min-w-max">
									{libraryData.map((branch, index) => (
										<Card
											key={index}
											className="hover:shadow-md transition-all  border-l-primary-custom bg-card border-border duration-300 flex-shrink-0 w-64"
										>
											<CardContent className="p-0">
												<div className="h-32 bg-muted rounded-t-lg w-full overflow-hidden">
													<img
														src={
															branch.li_photoURL ||
															"/placeholder.svg?height=128&width=256"
														}
														alt="libray"
														className="w-full h-full object-cover"
													/>
												</div>
												<div className="p-4">
													<h4 className="font-medium text-foreground text-[14px]">
														{branch.li_name}
													</h4>
													<p className="text-muted-foreground text-[12px]">
														{branch.li_address}
													</p>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</div>
						</div>

						<div className="animate-slide-up-delay-2 mt-8">
							<div className="flex items-start justify-between mb-6">
								<div>
									<h2 className="font-semibold text-foreground text-[18px]">
										Library of Congress Integration
									</h2>
									<p className="text-muted-foreground text-[12px]">
										Access World-Class Catalogs and Resources
									</p>
								</div>
								<Button
									variant="link"
									size="sm"
									className="text-primary-custom hover:text-secondary-custom text-[12px] px-0"
									onClick={() =>
										router.push("/resources/material/congress/all")
									}
								>
									See All
								</Button>
							</div>

							<Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl transition-shadow duration-300">
								<CardContent className="p-6">
									<div className="flex items-start gap-6">
										<div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
											<FiBookmark className="w-10 h-10 text-white" />
										</div>
										<div className="flex-1">
											<h3 className="font-medium text-[16px]">
												Library of Congress Resources
											</h3>
											<p className="text-blue-100 mb-6 leading-relaxed text-[12px]">
												Access the world's largest library collection with over
												170 million items including books, recordings,
												photographs, newspapers, maps, and manuscripts in
												various formats and languages.
											</p>
											<div
												className="flex flex-wrap items-center gap-6 text-blue-100"
												style={{ fontSize: "11px" }}
											>
												<div className="flex items-center gap-2">
													<FiBook className="w-5 h-5" />
													<span>17+ Million Books</span>
												</div>
												<div className="flex items-center gap-2">
													<FiDatabase className="w-5 h-5" />
													<span>170+ Million Items</span>
												</div>
												<div className="flex items-center gap-2">
													<FiArchive className="w-5 h-5" />
													<span>470+ Languages</span>
												</div>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</main>
				</div>
			</div>
		</ProtectedRoute>
	);
}
