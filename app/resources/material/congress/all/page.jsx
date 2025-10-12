"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiArrowLeft, FiSearch, FiGrid, FiList, FiX } from "react-icons/fi";
import EmptyState from "@/components/tags/empty";

const languages = [
	"All",
	"English",
	"Spanish",
	"French",
	"German",
	"Multiple",
	"Other",
];
const subjects = [
	"All",
	"Literature",
	"History",
	"Science",
	"Music",
	"Art",
	"Politics",
	"Geography",
	"Philosophy",
];

const collections = [
	"All",
	"Books",
	"Audio",
	"Video",
	"Photographs",
	"Maps",
	"Manuscripts",
	"Newspapers",
	"Posters",
	"Web Archives",
];

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import { useLoading } from "@/contexts/LoadingProvider";

import { fetchLOC } from "../../../../../controller/api/getLibraryOfCongress";
import PaginationControls from "@/components/tags/pagination";

export default function CongresssPage() {
	const router = useRouter();
	const pathname = usePathname();
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const { setLoading, setPath, loading } = useLoading();

	const [viewType, setViewType] = useState("grid");
	const [congressData, setCongressData] = useState([]);

	const [showFilters, setShowFilters] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedLanguage, setSelectedLanguage] = useState("All");
	const [selectedSubject, setSelectedSubject] = useState("All");
	const [selectedCollection, setSelectedCollection] = useState("All");

	//PAGINATION
	const [currentPage, setCurrentPage] = useState(1);
	const [ctrPages, setCtrPage] = useState(1);

	useEffect(() => {
		setPath(pathname);
		if (userDetails) {
			fetchLOC(
				setCongressData,
				searchQuery,
				selectedLanguage,
				selectedSubject,
				selectedCollection,
				currentPage,
				setCtrPage,
				setLoading,
				Alert
			);
		}
	}, [
		userDetails,
		currentPage,
		searchQuery,
		selectedLanguage,
		selectedSubject,
		selectedCollection,
	]);

	return (
		<div className="min-h-screen bg-background transition-colors duration-300">
			<Header />

			<main className="pt-28 pb-6 px-6 sm:px-6 md:px-16 lg:px-[100px] xl:px-[150px]">
				<div className="mb-6 animate-fade-in">
					<button
						onClick={() => router.back()}
						className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit"
						style={{ fontSize: "11px" }}
					>
						<FiArrowLeft className="w-4 h-4" />
						Back to Previous page
					</button>
				</div>

				<div className="w-fit mb-8 animate-slide-up">
					<h1 className="font-semibold text-foreground text-[20px]">
						Library Of Congress
					</h1>
					<p className="text-muted-foreground text-[14px]">
						Browse and manage all available library resources and congresss
					</p>
				</div>

				<div className="mb-8 animate-slide-up-delay-1">
					<div className="flex items-center justify-between mb-4 gap-6">
						<div className="relative flex items-center flex-1 max-w-md">
							<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
							<Input
								placeholder="Search materials..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10 pr-24 h-9 bg-background border-none text-foreground rounded-md shadow-sm"
								style={{ fontSize: "12px" }}
							/>

							<Button
								onClick={() => setShowFilters(!showFilters)}
								variant="ghost"
								className="h-8 px-3 border-l border-border text-foreground hover:bg-accent rounded-l-none text-[12px]"
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

					{(selectedLanguage !== "All" ||
						selectedSubject !== "All" ||
						selectedCollection !== "All") && (
						<div className="flex items-center gap-2 mb-4 flex-wrap">
							<span className="text-muted-foreground text-[11px]">
								Active Filters:
							</span>
							{selectedLanguage !== "All" && (
								<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded  flex items-center gap-1 text-[11px]">
									Language: {selectedLanguage}
									<FiX
										className="w-3 h-3 cursor-pointer"
										onClick={() => setSelectedLanguage("All")}
									/>
								</span>
							)}
							{selectedSubject !== "All" && (
								<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded  flex items-center gap-1 text-[11px]">
									Subject: {selectedSubject}
									<FiX
										className="w-3 h-3 cursor-pointer"
										onClick={() => setSelectedSubject("All")}
									/>
								</span>
							)}
							{selectedCollection !== "All" && (
								<span className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded  flex items-center gap-1 text-[11px]">
									Collection: {selectedCollection}
									<FiX
										className="w-3 h-3 cursor-pointer"
										onClick={() => setSelectedCollection("All")}
									/>
								</span>
							)}
						</div>
					)}
				</div>

				<div className="flex gap-6">
					{showFilters && (
						<div className="fixed inset-0 z-50 transition-opacity duration-300 opacity-100">
							<div
								className="fixed inset-0 bg-black/50"
								onClick={() => setShowFilters(false)}
							/>
							<div className="relative bg-card w-80 h-full shadow-lg transform transition-transform duration-300 translate-x-0 animate-slide-in-left">
								<div className="flex items-center justify-between p-4 border-b border-border text-white bg-primary">
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
										<label className="block font-medium text-foreground text-[12px]">
											Select a Language
										</label>
										<select
											value={selectedLanguage}
											onChange={(e) => setSelectedLanguage(e.target.value)}
											className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
										>
											{languages.map((language) => (
												<option key={language} value={language}>
													{language}
												</option>
											))}
										</select>
									</div>

									<div className="space-y-2">
										<label className="block font-medium text-foreground text-[12px]">
											Select a Subject
										</label>
										<select
											value={selectedSubject}
											onChange={(e) => setSelectedSubject(e.target.value)}
											className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
										>
											{subjects.map((subject) => (
												<option key={subject} value={subject}>
													{subject}
												</option>
											))}
										</select>
									</div>

									<div className="space-y-2">
										<label className="block font-medium text-foreground text-[12px]">
											Select a Collection
										</label>
										<select
											value={selectedCollection}
											onChange={(e) => setSelectedCollection(e.target.value)}
											className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
										>
											{collections.map((collection) => (
												<option key={collection} value={collection}>
													{collection}
												</option>
											))}
										</select>
									</div>
								</div>

								<div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
									<div className="flex space-x-3">
										<Button
											onClick={() => {
												setSelectedLanguage("All");
												setSelectedSubject("All");
												setSelectedCollection("All");
												setSelectedAccess("All");
											}}
											variant="outline"
											className="flex-1 h-9 border-border text-[12px]"
										>
											Clear All
										</Button>
										<Button
											onClick={() => setShowFilters(false)}
											className="flex-1 text-white hover:opacity-90 h-9 bg-primary text-[12px]"
										>
											Apply Filters
										</Button>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Main Content */}
					<div className="flex-1 animate-slide-up-delay-2 overflow-auto">
						{viewType === "grid" && (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ">
								{congressData.map((congress, index) => (
									<Card
										key={index}
										className="bg-card border-none shadow-sm transition-colors duration-300 hover:shadow-md rounded-lg h-fit"
									>
										<CardContent className="p-4 flex gap-4">
											<img
												src={congress.co_photoURL || "/placeholder.svg"}
												alt="congress"
												className={`h-28 w-20 object-cover rounded-lg bg-gray-100 flex-shrink-0 `}
											/>
											<div className="flex-1 min-w-0 space-y-2 whitespace-normal break-words">
												<div>
													<h4 className="font-medium text-foreground text-[14px]">
														{congress.co_title}
													</h4>
													<p className="text-muted-foreground text-[12px]">
														{congress.co_date}
													</p>
												</div>

												<div>
													<p className="text-[12px]">Contributor</p>
													<p className="text-muted-foreground text-[12px]">
														{congress.co_author}
													</p>
												</div>

												<div>
													<p className="text-[12px]">Subject</p>
													<p className="text-muted-foreground text-[12px]">
														{congress.co_subject}
													</p>
												</div>

												<div>
													<p className="text-[12px]">Format</p>
													<p className="text-muted-foreground text-[12px]">
														{congress.co_format}
													</p>
												</div>
												<div>
													<p className="text-[12px]">Description</p>
													<p className="text-muted-foreground text-[12px] line-clamp-3">
														{congress.co_description}
													</p>
												</div>

												<Button
													variant="link"
													size="sm"
													className="text-primary-custom hover:text-secondary-custom text-[12px] p-0"
													onClick={() =>
														router.push(
															`/resources/material/congress/details?co_id=${encodeURIComponent(
																congress.co_id
															)}&co_title=${encodeURIComponent(
																congress.co_title
															)}`
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
						)}

						{viewType === "table" && (
							<Card className="bg-card border-border transition-colors duration-300 animate-slide-up">
								<CardContent className="p-0 overflow-x-auto">
									<table className="w-full">
										<thead className="bg-muted/30">
											<tr className="border-b border-border">
												{[
													"Material Cover",
													"Title",
													"Contributor",
													"Description",
													"Subject",
													"Format",
													"Language",
													"Location",
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
											{congressData.map((congress, index) => (
												<tr
													key={index}
													className={`border-b border-border hover:bg-accent/30 transition-colors ${
														index % 2 === 0 ? "bg-background" : "bg-muted/10"
													}`}
												>
													<td className="py-4 px-6 text-foreground break-words whitespace-normal">
														<img
															src={congress.co_photoURL || "/placeholder.svg"}
															alt="congress"
															className={`h-28 w-20 object-cover rounded-lg bg-gray-100 flex-shrink-0 `}
														/>
													</td>

													<td className=" flex flex-col  py-4 px-6 text-foreground break-words whitespace-normal min-w-[250px]">
														<span className="text-foreground font-medium text-[12px]">
															{congress.co_title}
														</span>
														<span className="text-muted-foreground text-[12px]">
															{congress.co_date}
														</span>
													</td>

													<td className="py-4 px-6 text-foreground min-w-[150px] text-[12px]">
														{congress.co_author}
													</td>

													<td className="py-4 px-6 text-foreground min-w-[350px] text-[12px]">
														<div className="line-clamp-3">
															{congress.co_description}
														</div>
													</td>
													<td className="py-4 px-6 text-foreground min-w-[150px] text-[12px]">
														{congress.co_subject}
													</td>
													<td className="py-4 px-6 text-foreground min-w-[150px] text-[12px]">
														{congress.co_format}
													</td>

													<td className="py-4 px-6 text-foreground min-w-[150px] text-[12px]">
														{congress.co_language}
													</td>
													<td className="py-4 px-6 text-foreground min-w-[150px] text-[12px]">
														{congress.co_location}
													</td>
													<td className="py-4 px-6">
														<Button
															variant="link"
															size="sm"
															className="text-primary-custom hover:text-secondary-custom text-[12px] p-0"
															onClick={() =>
																router.push(
																	`/resources/material/congress/details?co_id=${encodeURIComponent(
																		congress.co_id
																	)}&co_title=${encodeURIComponent(
																		congress.co_title
																	)}`
																)
															}
														>
															View details
														</Button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</CardContent>
							</Card>
						)}

						<EmptyState data={congressData} loading={loading} />

						<PaginationControls
							ctrPages={ctrPages}
							currentPage={currentPage}
							setCurrentPage={setCurrentPage}
						/>
					</div>
				</div>
			</main>
		</div>
	);
}
