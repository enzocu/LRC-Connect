"use client";

import { useState } from "react";
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
import { AddEditCourseModal } from "@/components/modal/add-edit-course-modal";
import { DeleteCourseModal } from "@/components/modal/delete-course-modal";
import { TransferCourseModal } from "@/components/modal/transfer-course-modal";

export default function CoursesPage() {
	const [coursesData, setCoursesData] = useState([
		{
			main: "Senior High School",
			sub: [
				{
					tracks: "Academic Tracks",
					strand: [
						"Accountancy, Business and Management (ABM)",
						"General Academic Strand (GAS)",
						"Humanities and Social Sciences (HUMSS)",
						"Science, Technology, Engineering, and Mathematics (STEM)",
					],
				},
				{
					tracks: "Technical Vocational Livelihood Track",
					strand: [
						"Home Economics",
						"Industrial Arts",
						"Information and Communication Technology (Computer Hardware Servicing NC II)",
						"Computer Programming (NC IV)",
					],
				},
			],
		},
		{
			main: "College Courses",
			sub: [
				{
					institute: "Institute of Education (IE)",
					programs: [
						"Bachelor of Elementary Education (BEEd)",
						"Bachelor of Secondary Education (BSED)",
					],
				},
				{
					institute: "Institute of Hospitality and Tourism Management (IHTM)",
					programs: [
						"Bachelor of Science in Hospitality Management (BSHM)",
						"Bachelor of Science in Tourism Management (BSTM)",
					],
				},
			],
		},
	]);

	const [searchSHS, setSearchSHS] = useState("");
	const [searchCollege, setSearchCollege] = useState("");

	const [addEditModal, setAddEditModal] = useState({
		isOpen: false,
		type: null,
		mode: "add",
		data: null,
		parentIndex: null,
		itemIndex: null,
	});

	const [deleteModal, setDeleteModal] = useState({
		isOpen: false,
		itemName: "",
		itemType: "",
		onConfirm: null,
	});

	const [transferModal, setTransferModal] = useState({
		isOpen: false,
		itemName: "",
		itemType: "",
		availableTargets: [],
		onTransfer: null,
	});

	const openAddEditModal = (
		type,
		mode = "add",
		data = null,
		parentIndex = null,
		itemIndex = null
	) => {
		setAddEditModal({ isOpen: true, type, mode, data, parentIndex, itemIndex });
	};

	const closeAddEditModal = () => {
		setAddEditModal({
			isOpen: false,
			type: null,
			mode: "add",
			data: null,
			parentIndex: null,
			itemIndex: null,
		});
	};

	const openDeleteModal = (itemName, itemType, onConfirm) => {
		setDeleteModal({ isOpen: true, itemName, itemType, onConfirm });
	};

	const closeDeleteModal = () => {
		setDeleteModal({
			isOpen: false,
			itemName: "",
			itemType: "",
			onConfirm: null,
		});
	};

	const openTransferModal = (
		itemName,
		itemType,
		availableTargets,
		onTransfer
	) => {
		setTransferModal({
			isOpen: true,
			itemName,
			itemType,
			availableTargets,
			onTransfer,
		});
	};

	const closeTransferModal = () => {
		setTransferModal({
			isOpen: false,
			itemName: "",
			itemType: "",
			availableTargets: [],
			onTransfer: null,
		});
	};

	const handleSaveTrack = (formData) => {
		const newData = [...coursesData];
		if (addEditModal.mode === "add") {
			newData[0].sub.push({ tracks: formData.name, strand: [] });
		} else {
			newData[0].sub[addEditModal.parentIndex].tracks = formData.name;
		}
		setCoursesData(newData);
	};

	const handleDeleteTrack = (index) => {
		const newData = [...coursesData];
		newData[0].sub.splice(index, 1);
		setCoursesData(newData);
	};

	const handleSaveStrand = (formData) => {
		const newData = [...coursesData];
		if (addEditModal.mode === "add") {
			newData[0].sub[addEditModal.parentIndex].strand.push(formData.name);
		} else {
			newData[0].sub[addEditModal.parentIndex].strand[addEditModal.itemIndex] =
				formData.name;
		}
		setCoursesData(newData);
	};

	const handleDeleteStrand = (trackIndex, strandIndex) => {
		const newData = [...coursesData];
		newData[0].sub[trackIndex].strand.splice(strandIndex, 1);
		setCoursesData(newData);
	};

	const handleSaveInstitute = (formData) => {
		const newData = [...coursesData];
		if (addEditModal.mode === "add") {
			newData[1].sub.push({ institute: formData.name, programs: [] });
		} else {
			newData[1].sub[addEditModal.parentIndex].institute = formData.name;
		}
		setCoursesData(newData);
	};

	const handleDeleteInstitute = (index) => {
		const newData = [...coursesData];
		newData[1].sub.splice(index, 1);
		setCoursesData(newData);
	};

	const handleSaveProgram = (formData) => {
		const newData = [...coursesData];
		if (addEditModal.mode === "add") {
			newData[1].sub[addEditModal.parentIndex].programs.push(formData.name);
		} else {
			newData[1].sub[addEditModal.parentIndex].programs[
				addEditModal.itemIndex
			] = formData.name;
		}
		setCoursesData(newData);
	};

	const handleDeleteProgram = (instituteIndex, programIndex) => {
		const newData = [...coursesData];
		newData[1].sub[instituteIndex].programs.splice(programIndex, 1);
		setCoursesData(newData);
	};

	const filteredSHSTracks = coursesData[0].sub.filter((track) =>
		track.tracks.toLowerCase().includes(searchSHS.toLowerCase())
	);

	const filteredCollegeInstitutes = coursesData[1].sub.filter((institute) =>
		institute.institute.toLowerCase().includes(searchCollege.toLowerCase())
	);

	return (
		<div className="flex h-screen bg-background transition-colors duration-300">
			<Sidebar />

			<div className="flex-1 flex flex-col overflow-hidden">
				<Header />

				<main className="flex-1 overflow-auto pt-16">
					<div className="p-5">
						{/* Page Title */}
						<div className="mb-8 animate-fade-in">
							<h1
								className="font-semibold text-foreground"
								style={{ fontSize: "20px" }}
							>
								Courses
							</h1>
							<p
								className="text-muted-foreground mt-1"
								style={{ fontSize: "11px" }}
							>
								Manage academic courses and curriculum offerings
							</p>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* Senior High School Section */}
							<Card className="bg-card border-border transition-colors duration-300 h-fit">
								<CardContent className="p-4">
									<div className="flex items-center justify-between mb-4">
										<h2
											className="font-semibold text-foreground"
											style={{ fontSize: "16px" }}
										>
											Senior High School
										</h2>
										<Button
											onClick={() => openAddEditModal("track", "add")}
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
											style={{ fontSize: "11px" }}
										/>
									</div>

									<Accordion type="single" collapsible className="space-y-2">
										{filteredSHSTracks.map((track, trackIndex) => (
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
															{track.tracks}
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
																		openAddEditModal(
																			"strand",
																			"add",
																			null,
																			trackIndex
																		);
																	}}
																>
																	<FiPlus className="w-3.5 h-3.5 mr-2 text-green-600" />
																	Add Strand
																</DropdownMenuItem>
																<DropdownMenuItem
																	onClick={(e) => {
																		e.stopPropagation();
																		openAddEditModal(
																			"track",
																			"edit",
																			{ name: track.tracks },
																			trackIndex
																		);
																	}}
																>
																	<FiEdit2 className="w-3.5 h-3.5 mr-2 text-blue-600" />
																	Edit Track
																</DropdownMenuItem>
																<DropdownMenuItem
																	onClick={(e) => {
																		e.stopPropagation();
																		const targets = coursesData[0].sub
																			.filter((_, i) => i !== trackIndex)
																			.map((t) => t.tracks);
																		openTransferModal(
																			track.tracks,
																			"Track",
																			targets,
																			(target) => {
																				console.log(
																					`Transfer ${track.tracks} to ${target}`
																				);
																			}
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
																		openDeleteModal(track.tracks, "Track", () =>
																			handleDeleteTrack(trackIndex)
																		);
																	}}
																>
																	<FiTrash2 className="w-3.5 h-3.5 mr-2" />
																	Delete Track
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</div>
												</AccordionTrigger>
												<AccordionContent>
													<div className="space-y-2 pl-4">
														{track.strand.map((strand, strandIndex) => (
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
																				openAddEditModal(
																					"strand",
																					"edit",
																					{ name: strand },
																					trackIndex,
																					strandIndex
																				)
																			}
																		>
																			<FiEdit2 className="w-3 h-3 mr-2 text-blue-600" />
																			Edit Strand
																		</DropdownMenuItem>
																		<DropdownMenuItem
																			onClick={() => {
																				const targets = coursesData[0].sub
																					.filter((_, i) => i !== trackIndex)
																					.map((t) => t.tracks);
																				openTransferModal(
																					strand,
																					"Strand",
																					targets,
																					(target) => {
																						console.log(
																							`Transfer ${strand} to ${target}`
																						);
																					}
																				);
																			}}
																		>
																			<FiArrowRight className="w-3 h-3 mr-2 text-purple-600" />
																			Transfer Strand
																		</DropdownMenuItem>
																		<DropdownMenuItem
																			variant="destructive"
																			onClick={() =>
																				openDeleteModal(strand, "Strand", () =>
																					handleDeleteStrand(
																						trackIndex,
																						strandIndex
																					)
																				)
																			}
																		>
																			<FiTrash2 className="w-3 h-3 mr-2" />
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
								</CardContent>
							</Card>

							{/* College Courses Section */}
							<Card className="bg-card border-border transition-colors duration-300 h-fit">
								<CardContent className="p-4">
									<div className="flex items-center justify-between mb-4">
										<h2
											className="font-semibold text-foreground"
											style={{ fontSize: "16px" }}
										>
											College Courses
										</h2>
										<Button
											onClick={() => openAddEditModal("institute", "add")}
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
											placeholder="Search institutes..."
											className="pl-9 h-9 bg-background border-border text-foreground"
											style={{ fontSize: "11px" }}
										/>
									</div>

									<Accordion type="single" collapsible className="space-y-2">
										{filteredCollegeInstitutes.map(
											(institute, instituteIndex) => (
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
																{institute.institute}
															</span>
															<DropdownMenu>
																<DropdownMenuTrigger
																	asChild
																	onClick={(e) => e.stopPropagation()}
																>
																	<FiMoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
																</DropdownMenuTrigger>
																<DropdownMenuContent
																	align="end"
																	className="w-48"
																>
																	<DropdownMenuItem
																		onClick={(e) => {
																			e.stopPropagation();
																			openAddEditModal(
																				"program",
																				"add",
																				null,
																				instituteIndex
																			);
																		}}
																	>
																		<FiPlus className="w-3.5 h-3.5 mr-2 text-green-600" />
																		Add Program
																	</DropdownMenuItem>
																	<DropdownMenuItem
																		onClick={(e) => {
																			e.stopPropagation();
																			openAddEditModal(
																				"institute",
																				"edit",
																				{ name: institute.institute },
																				instituteIndex
																			);
																		}}
																	>
																		<FiEdit2 className="w-3.5 h-3.5 mr-2 text-blue-600" />
																		Edit Institute
																	</DropdownMenuItem>
																	<DropdownMenuItem
																		onClick={(e) => {
																			e.stopPropagation();
																			const targets = coursesData[1].sub
																				.filter((_, i) => i !== instituteIndex)
																				.map((inst) => inst.institute);
																			openTransferModal(
																				institute.institute,
																				"Institute",
																				targets,
																				(target) => {
																					console.log(
																						`Transfer ${institute.institute} to ${target}`
																					);
																				}
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
																			openDeleteModal(
																				institute.institute,
																				"Institute",
																				() =>
																					handleDeleteInstitute(instituteIndex)
																			);
																		}}
																	>
																		<FiTrash2 className="w-3.5 h-3.5 mr-2" />
																		Delete Institute
																	</DropdownMenuItem>
																</DropdownMenuContent>
															</DropdownMenu>
														</div>
													</AccordionTrigger>
													<AccordionContent>
														<div className="space-y-2 pl-4">
															{institute.programs.map(
																(program, programIndex) => (
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
																						openAddEditModal(
																							"program",
																							"edit",
																							{ name: program },
																							instituteIndex,
																							programIndex
																						)
																					}
																				>
																					<FiEdit2 className="w-3 h-3 mr-2 text-blue-600" />
																					Edit Program
																				</DropdownMenuItem>
																				<DropdownMenuItem
																					onClick={() => {
																						const targets = coursesData[1].sub
																							.filter(
																								(_, i) => i !== instituteIndex
																							)
																							.map((inst) => inst.institute);
																						openTransferModal(
																							program,
																							"Program",
																							targets,
																							(target) => {
																								console.log(
																									`Transfer ${program} to ${target}`
																								);
																							}
																						);
																					}}
																				>
																					<FiArrowRight className="w-3 h-3 mr-2 text-purple-600" />
																					Transfer Program
																				</DropdownMenuItem>
																				<DropdownMenuItem
																					variant="destructive"
																					onClick={() =>
																						openDeleteModal(
																							program,
																							"Program",
																							() =>
																								handleDeleteProgram(
																									instituteIndex,
																									programIndex
																								)
																						)
																					}
																				>
																					<FiTrash2 className="w-3 h-3 mr-2" />
																					Delete Program
																				</DropdownMenuItem>
																			</DropdownMenuContent>
																		</DropdownMenu>
																	</div>
																)
															)}
														</div>
													</AccordionContent>
												</AccordionItem>
											)
										)}
									</Accordion>
								</CardContent>
							</Card>
						</div>
					</div>
				</main>
			</div>

			<AddEditCourseModal
				isOpen={addEditModal.isOpen}
				onClose={closeAddEditModal}
				onSave={
					addEditModal.type === "track"
						? handleSaveTrack
						: addEditModal.type === "strand"
						? handleSaveStrand
						: addEditModal.type === "institute"
						? handleSaveInstitute
						: handleSaveProgram
				}
				type={addEditModal.type}
				mode={addEditModal.mode}
				initialData={addEditModal.data}
			/>

			<DeleteCourseModal
				isOpen={deleteModal.isOpen}
				onClose={closeDeleteModal}
				onConfirm={deleteModal.onConfirm}
				itemName={deleteModal.itemName}
				itemType={deleteModal.itemType}
			/>

			<TransferCourseModal
				isOpen={transferModal.isOpen}
				onClose={closeTransferModal}
				onTransfer={transferModal.onTransfer}
				itemName={transferModal.itemName}
				itemType={transferModal.itemType}
				availableTargets={transferModal.availableTargets}
			/>
		</div>
	);
}
