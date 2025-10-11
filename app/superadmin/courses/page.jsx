"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	FiPlus,
	FiEdit2,
	FiTrash2,
	FiArrowRight,
	FiSearch,
	FiMoreVertical,
} from "react-icons/fi";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import EmptyState from "@/components/tags/empty";
import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import ProtectedRoute from "@/contexts/ProtectedRoute";
import { useLoading } from "@/contexts/LoadingProvider";

//modal
import { AddEditCourseModal } from "@/components/modal/add-edit-course-modal";
import { DeleteCourseModal } from "@/components/modal/delete-course-modal";
import { TransferCourseModal } from "@/components/modal/transfer-course-modal";

import { getCoursesRealtime } from "@/controller/firebase/get/getCourses";

export default function CoursesPage() {
	const pathname = usePathname();
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const { setLoading, setPath, loading } = useLoading();

	const [coursesData, setCoursesData] = useState([
		{
			main: "Senior High School",
			sub: [],
		},
		{
			main: "College Courses",
			sub: [],
		},
	]);

	const [searchSHS, setSearchSHS] = useState("");
	const [searchCollege, setSearchCollege] = useState("");

	const [actionModal, setActionModal] = useState({
		isOpen: false,
		type: null,
		mode: "add",
		id: null,
		title: "",
		parentIndex: null,
		itemIndex: null,
	});

	const openActionModal = (
		type,
		mode = "add",
		id = null,
		title = null,
		parentIndex = null,
		itemIndex = null
	) => {
		setActionModal({
			isOpen: true,
			type: type,
			mode: mode,
			id: id,
			title: title,
			parentIndex: parentIndex,
			itemIndex: itemIndex,
		});
	};

	useEffect(() => {
		setPath(pathname);
		setLoading(true);

		const unsubscribeSHS = getCoursesRealtime(
			"Senior High School",
			searchSHS,
			setCoursesData,
			setLoading,
			Alert
		);

		const unsubscribeCollege = getCoursesRealtime(
			"College Courses",
			searchCollege,
			setCoursesData,
			setLoading,
			Alert
		);

		return () => {
			if (unsubscribeSHS) unsubscribeSHS();
			if (unsubscribeCollege) unsubscribeCollege();
		};
	}, [searchSHS, searchCollege]);

	return (
		<ProtectedRoute allowedRoles={["USR-1"]}>
			<div className="flex h-screen bg-background transition-colors duration-300">
				<Sidebar />

				<div className="flex-1 flex flex-col overflow-hidden">
					<Header />

					<main className="flex-1 overflow-auto p-6 pt-24 overflow-auto">
						<div className="mb-8 animate-fade-in">
							<h1 className="font-semibold text-foreground text-[20px]">
								Courses
							</h1>
							<p className="text-muted-foreground text-[14px]">
								Manage academic courses and curriculum offerings
							</p>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
							{/* Senior High School Section */}
							<Card className="bg-card border-border transition-colors duration-300 h-fit">
								<CardContent className="p-6">
									<div className="flex items-center justify-between mb-4">
										<h2
											className="font-semibold text-foreground"
											style={{ fontSize: "16px" }}
										>
											Senior High School
										</h2>
										<Button
											onClick={() =>
												openActionModal("track", "add", null, null, null, null)
											}
											size="sm"
											className="h-8 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
											style={{ fontSize: "11px" }}
										>
											<FiPlus className="w-3.5 h-3.5" />
											Add Track
										</Button>
									</div>

									<div className="relative mb-4">
										<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
										<Input
											value={searchSHS}
											onChange={(e) => setSearchSHS(e.target.value)}
											placeholder="Search tracks..."
											className="pl-9 h-9 bg-background border-border text-foreground"
											style={{ fontSize: "12px" }}
										/>
									</div>

									<Accordion type="single" collapsible className="space-y-2">
										{coursesData[0]?.sub?.map((track, trackIndex) => (
											<AccordionItem
												key={trackIndex}
												value={`track-${trackIndex}`}
												className="border-border"
											>
												<AccordionTrigger className="hover:no-underline">
													<div className="flex items-center justify-between w-full pr-4">
														<span
															className="text-foreground font-medium"
															style={{ fontSize: "12px" }}
														>
															{track.cs_title}
														</span>
														<DropdownMenu>
															<DropdownMenuTrigger
																asChild
																onClick={(e) => e.stopPropagation()}
															>
																<FiMoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end" className="w-40">
																<DropdownMenuItem
																	onClick={(e) => {
																		e.stopPropagation();
																		openActionModal(
																			"strand",
																			"add",
																			track.id,
																			null,
																			null,
																			null
																		);
																	}}
																>
																	<FiPlus className="w-3.5 h-3.5 mr-2 text-green-600" />
																	Add Strand
																</DropdownMenuItem>
																<DropdownMenuItem
																	onClick={(e) => {
																		e.stopPropagation();
																		openActionModal(
																			"track",
																			"edit",
																			track.id,
																			track.cs_title,
																			null,
																			null
																		);
																	}}
																>
																	<FiEdit2 className="w-3.5 h-3.5 mr-2 text-blue-600" />
																	Edit Track
																</DropdownMenuItem>

																<DropdownMenuItem
																	onClick={(e) => {
																		e.stopPropagation();
																		openActionModal(
																			"track",
																			"transfer",
																			track.id,
																			track.cs_title,
																			trackIndex,
																			null
																		);
																	}}
																>
																	<FiArrowRight className="w-3.5 h-3.5 mr-2 text-purple-600" />
																	Transfer Track
																</DropdownMenuItem>

																<DropdownMenuItem
																	variant="destructive"
																	onClick={(e) => {
																		e.stopPropagation();
																		openActionModal(
																			"track",
																			"delete",
																			track.id,
																			track.cs_title,
																			null,
																			null
																		);
																	}}
																>
																	<FiTrash2 className="w-3.5 h-3.5 mr-2 text-red-600" />
																	Delete Track
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</div>
												</AccordionTrigger>
												<AccordionContent>
													<div className="space-y-2 pl-4">
														{track.cs_sub.map((strand, strandIndex) => (
															<div
																key={strandIndex}
																className="flex items-center justify-between p-2 rounded hover:bg-accent/50 transition-colors"
															>
																<div className="flex items-center gap-2">
																	<span className="text-muted-foreground">
																		•
																	</span>
																	<span
																		className="text-foreground"
																		style={{ fontSize: "11px" }}
																	>
																		{strand}
																	</span>
																</div>
																<DropdownMenu>
																	<DropdownMenuTrigger asChild>
																		<button
																			className="p-1 hover:bg-accent rounded transition-colors"
																			title="More actions"
																		>
																			<FiMoreVertical className="w-3 h-3 text-muted-foreground" />
																		</button>
																	</DropdownMenuTrigger>
																	<DropdownMenuContent
																		align="end"
																		className="w-40"
																	>
																		<DropdownMenuItem
																			onClick={() =>
																				openActionModal(
																					"strand",
																					"edit",
																					track.id,
																					strand,
																					trackIndex,
																					strandIndex
																				)
																			}
																		>
																			<FiEdit2 className="w-3 h-3 mr-2 text-blue-600" />
																			Edit Strand
																		</DropdownMenuItem>

																		<DropdownMenuItem
																			onClick={(e) => {
																				e.stopPropagation();
																				openActionModal(
																					"strand",
																					"transfer",
																					track.id,
																					strand,
																					trackIndex,
																					strandIndex
																				);
																			}}
																		>
																			<FiArrowRight className="w-3.5 h-3.5 mr-2 text-purple-600" />
																			Transfer Strand
																		</DropdownMenuItem>

																		<DropdownMenuItem
																			variant="destructive"
																			onClick={(e) => {
																				e.stopPropagation();
																				openActionModal(
																					"strand",
																					"delete",
																					track.id,
																					strand,
																					trackIndex,
																					strandIndex
																				);
																			}}
																		>
																			<FiTrash2 className="w-3.5 h-3.5 mr-2 text-red-600" />
																			Delete Strand
																		</DropdownMenuItem>
																	</DropdownMenuContent>
																</DropdownMenu>
															</div>
														))}
													</div>
												</AccordionContent>
											</AccordionItem>
										))}
									</Accordion>

									<EmptyState data={coursesData[0].sub} loading={loading} />
								</CardContent>
							</Card>

							{/* College Section */}
							<Card className="bg-card border-border transition-colors duration-300 h-fit">
								<CardContent className="p-6">
									<div className="flex items-center justify-between mb-4">
										<h2
											className="font-semibold text-foreground"
											style={{ fontSize: "16px" }}
										>
											College Courses
										</h2>
										<Button
											onClick={() =>
												openActionModal(
													"institute",
													"add",
													null,
													null,
													null,
													null
												)
											}
											size="sm"
											className="h-8 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
											style={{ fontSize: "11px" }}
										>
											<FiPlus className="w-3.5 h-3.5" />
											Add Institute
										</Button>
									</div>

									<div className="relative mb-4">
										<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
										<Input
											value={searchCollege}
											onChange={(e) => setSearchCollege(e.target.value)}
											placeholder="Search institute..."
											className="pl-9 h-9 bg-background border-border text-foreground"
											style={{ fontSize: "12px" }}
										/>
									</div>

									<Accordion type="single" collapsible className="space-y-2">
										{coursesData[1]?.sub?.map((institute, instituteIndex) => (
											<AccordionItem
												key={instituteIndex}
												value={`institute-${instituteIndex}`}
												className="border-border"
											>
												<AccordionTrigger className="hover:no-underline">
													<div className="flex items-center justify-between w-full pr-4">
														<span
															className="text-foreground font-medium"
															style={{ fontSize: "12px" }}
														>
															{institute.cs_title}
														</span>
														<DropdownMenu>
															<DropdownMenuTrigger
																asChild
																onClick={(e) => e.stopPropagation()}
															>
																<FiMoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end" className="w-40">
																<DropdownMenuItem
																	onClick={(e) => {
																		e.stopPropagation();
																		openActionModal(
																			"program",
																			"add",
																			institute.id,
																			null,
																			null,
																			null
																		);
																	}}
																>
																	<FiPlus className="w-3.5 h-3.5 mr-2 text-green-600" />
																	Add Program
																</DropdownMenuItem>
																<DropdownMenuItem
																	onClick={(e) => {
																		e.stopPropagation();
																		openActionModal(
																			"institute",
																			"edit",
																			institute.id,
																			institute.cs_title,
																			null,
																			null
																		);
																	}}
																>
																	<FiEdit2 className="w-3.5 h-3.5 mr-2 text-blue-600" />
																	Edit Institute
																</DropdownMenuItem>

																<DropdownMenuItem
																	onClick={(e) => {
																		e.stopPropagation();
																		openActionModal(
																			"institute",
																			"transfer",
																			institute.id,
																			institute.cs_title,
																			instituteIndex,
																			null
																		);
																	}}
																>
																	<FiArrowRight className="w-3.5 h-3.5 mr-2 text-purple-600" />
																	Transfer Institute
																</DropdownMenuItem>

																<DropdownMenuItem
																	variant="destructive"
																	onClick={(e) => {
																		e.stopPropagation();
																		openActionModal(
																			"institute",
																			"delete",
																			institute.id,
																			institute.cs_title,
																			null,
																			null
																		);
																	}}
																>
																	<FiTrash2 className="w-3.5 h-3.5 mr-2 text-red-600" />
																	Delete Institute
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</div>
												</AccordionTrigger>
												<AccordionContent>
													<div className="space-y-2 pl-4">
														{institute.cs_sub.map((program, programIndex) => (
															<div
																key={programIndex}
																className="flex items-center justify-between p-2 rounded hover:bg-accent/50 transition-colors"
															>
																<div className="flex items-center gap-2">
																	<span className="text-muted-foreground">
																		•
																	</span>
																	<span
																		className="text-foreground"
																		style={{ fontSize: "11px" }}
																	>
																		{program}
																	</span>
																</div>
																<DropdownMenu>
																	<DropdownMenuTrigger asChild>
																		<button
																			className="p-1 hover:bg-accent rounded transition-colors"
																			title="More actions"
																		>
																			<FiMoreVertical className="w-3 h-3 text-muted-foreground" />
																		</button>
																	</DropdownMenuTrigger>
																	<DropdownMenuContent
																		align="end"
																		className="w-40"
																	>
																		<DropdownMenuItem
																			onClick={() =>
																				openActionModal(
																					"program",
																					"edit",
																					institute.id,
																					program,
																					instituteIndex,
																					programIndex
																				)
																			}
																		>
																			<FiEdit2 className="w-3 h-3 mr-2 text-blue-600" />
																			Edit Program
																		</DropdownMenuItem>

																		<DropdownMenuItem
																			onClick={(e) => {
																				e.stopPropagation();
																				openActionModal(
																					"program",
																					"transfer",
																					institute.id,
																					program,
																					instituteIndex,
																					programIndex
																				);
																			}}
																		>
																			<FiArrowRight className="w-3.5 h-3.5 mr-2 text-purple-600" />
																			Transfer Program
																		</DropdownMenuItem>

																		<DropdownMenuItem
																			variant="destructive"
																			onClick={(e) => {
																				e.stopPropagation();
																				openActionModal(
																					"program",
																					"delete",
																					institute.id,
																					program,
																					instituteIndex,
																					programIndex
																				);
																			}}
																		>
																			<FiTrash2 className="w-3.5 h-3.5 mr-2 text-red-600" />
																			Delete Program
																		</DropdownMenuItem>
																	</DropdownMenuContent>
																</DropdownMenu>
															</div>
														))}
													</div>
												</AccordionContent>
											</AccordionItem>
										))}
									</Accordion>

									<EmptyState data={coursesData[1].sub} loading={loading} />
								</CardContent>
							</Card>
						</div>
					</main>
				</div>

				<AddEditCourseModal
					isOpen={
						actionModal?.isOpen && ["add", "edit"].includes(actionModal?.mode)
					}
					onClose={() => setActionModal({ ...actionModal, isOpen: false })}
					type={actionModal?.type}
					mode={actionModal?.mode}
					actionData={actionModal}
					coursesData={coursesData}
				/>
				<DeleteCourseModal
					isOpen={actionModal?.isOpen && actionModal?.mode === "delete"}
					onClose={() => setActionModal({ ...actionModal, isOpen: false })}
					actionData={actionModal}
					coursesData={coursesData}
				/>
				<TransferCourseModal
					isOpen={actionModal?.isOpen && actionModal?.mode === "transfer"}
					onClose={() => setActionModal({ ...actionModal, isOpen: false })}
					actionData={actionModal}
					coursesData={
						coursesData[["track", "strand"].includes(actionModal?.type) ? 0 : 1]
							?.sub || []
					}
				/>
			</div>
		</ProtectedRoute>
	);
}
