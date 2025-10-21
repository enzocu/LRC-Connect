"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	FiArrowLeft,
	FiUpload,
	FiRotateCcw,
	FiImage,
	FiFile,
	FiMusic,
	FiPlus,
	FiEdit,
	FiX,
} from "react-icons/fi";

import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { FiTrash2 } from "react-icons/fi";

import { DeactivateResourceModal } from "@/components/modal/deactivate-resource-modal";
import { ShelfRegistrationModal } from "@/components/modal/shelf-registration-modal";
import { AddDonorModal } from "@/components/modal/add-donor-modal";
import { DeactivateAccessionModal } from "@/components/modal/deactivate-accession-modal";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import ProtectedRoute from "@/contexts/ProtectedRoute";
import { useLoading } from "@/contexts/LoadingProvider";

import { LoadingSpinner } from "@/components/loading";

import { insertMaterial } from "@/controller/firebase/insert/insertMaterial";
import { updateMaterial } from "@/controller/firebase/update/updateMaterial";
import { getMaterial } from "@/controller/firebase/get/getMaterial";
import { getMaterialtypelistRealtime } from "@/controller/firebase/get/getMaterialtypelist";
import { getCategoryListRealtime } from "@/controller/firebase/get/getCategoryListRealtime";
import { getShelfListRealtime } from "@/controller/firebase/get/getShelfRealtime";
import { getDonorListRealtime } from "@/controller/firebase/get/getDonorListRealtime";
import { getAccession } from "@/controller/firebase/get/getAccessionNumber";

const defaultSection = [
	{
		mt_section: "Holdings",
	},
	{
		mt_section: "Subject",
	},
];

export default function MaterialRegistrationPage() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const type = searchParams.get("type");
	const id = searchParams.get("id");

	const { userDetails, loading } = useUserAuth();
	const Alert = useAlertActions();
	const { setLoading, setPath } = useLoading();
	const [btnLoading, setBtnLoading] = useState(false);

	const [accessionCount, setAccessionCount] = useState(0);
	const [formData, setFormData] = useState({
		ma_status: "Active",
		ma_materialType: "",
		ma_materialCategory: "",
		ma_shelf: "",
		ma_acquisitionType: "Donated",
		ma_donor: "",
		ma_pricePerItem: 0,
	});
	const [selectedMaterialType, setSelectedMaterialType] = useState(null);
	const [holdings, setHoldings] = useState([]);
	const [subjects, setSubjects] = useState([]);
	const [files, setFiles] = useState({
		ma_coverURL: null,
		ma_coverDeleteURL: null,
		ma_coverQty: 0,

		ma_softURL: null,
		ma_softDeleteURL: null,
		ma_softQty: 0,

		ma_audioURL: null,
		ma_audioDeleteURL: null,
		ma_audioQty: 0,
	});

	const [materialTypes, setMaterialTypes] = useState([]);
	const [categories, setCategory] = useState([]);
	const [shelves, setShelves] = useState([]);
	const [donors, setDonors] = useState([]);
	const [holdingData, setHoldingData] = useState({
		ho_action: "Insert",
		ho_index: null,
		ho_access: "",
		ho_volume: "",
		ho_copy: "",
		ho_status: "Active",
		ho_reason: "",
	});

	const [subjectData, setSubjectData] = useState({
		su_action: "Insert",
		su_index: null,
		su_subject: "",
	});

	//MODAL
	const [showShelfModal, setShowShelfModal] = useState(false);
	const [showAddDonorModal, setShowAddDonorModal] = useState(false);
	const [showDeactivateModal, setShowDeactivateModal] = useState(false);
	const [showDeactivateAccessionModal, setShowDeactivateAccessionModal] =
		useState(false);
	const [accessionToDeactivate, setAccessionToDeactivate] = useState(null);

	const handleInputChange = (setField, field, value) => {
		setField((prev) => ({ ...prev, [field]: value }));
	};

	const handleFieldChange = (sectionName, fieldTitle, value) => {
		let formattedValue = value;

		setSelectedMaterialType((prev) => {
			if (!prev || !prev.mt_section) return prev;

			return {
				...prev,
				mt_section: prev.mt_section.map((section) =>
					section.mt_section === sectionName
						? {
								...section,
								mt_fields: section.mt_fields.map((field) =>
									field.mt_title === fieldTitle
										? { ...field, mt_value: formattedValue }
										: field
								),
						  }
						: section
				),
			};
		});
	};

	// Holdings handler
	const handleHoldings = async (
		holdingData,
		setHoldingData = null,
		holdings,
		setHoldings
	) => {
		if (holdingData.ho_action === "Insert") {
			let nextAccession = accessionCount;

			if (accessionCount === 0) {
				const count = await getAccession(setAccessionCount, Alert);
				nextAccession = count;
			}

			const newAccession = nextAccession + 1;

			setHoldings([
				...holdings,
				{
					ho_access: newAccession,
					ho_volume: holdingData.ho_volume,
					ho_copy: holdingData.ho_copy,
					ho_status: "Active",
				},
			]);

			setAccessionCount(newAccession);
		} else if (holdingData.ho_action === "Update") {
			const updated = holdings.map((h, idx) =>
				idx === holdingData.ho_index
					? {
							ho_access: holdingData.ho_access,
							ho_volume: holdingData.ho_volume,
							ho_copy: holdingData.ho_copy,
							ho_status: h.ho_status || "Active",
					  }
					: h
			);
			setHoldings(updated);
		} else if (holdingData.ho_action === "Status") {
			const updated = holdings.map((h, idx) =>
				idx === holdingData.ho_index
					? {
							...h,
							ho_status: holdingData.ho_status,
							ho_reason: holdingData.ho_reason,
					  }
					: h
			);
			setHoldings(updated);
		} else if (holdingData.ho_action === "Delete") {
			const filtered = holdings.filter(
				(_, idx) => idx !== holdingData.ho_index
			);
			setHoldings(filtered);
		}

		// Reset form
		if (["Insert", "Update"].includes(holdingData.ho_action)) {
			setHoldingData({
				ho_action: "Insert",
				ho_index: null,
				ho_access: "",
				ho_volume: "",
				ho_copy: "",
				ho_status: "Active",
			});
		}
	};

	// Subjects handler
	const handleSubjects = (
		subjectData,
		setSubjectData,
		subjects,
		setSubjects
	) => {
		if (subjectData.su_action === "Insert") {
			setSubjects([...subjects, subjectData.su_subject]);
		} else if (subjectData.su_action === "Update") {
			const updated = subjects.map((s, idx) =>
				idx === subjectData.su_index ? subjectData.su_subject : s
			);
			setSubjects(updated);
		} else if (subjectData.su_action === "Delete") {
			const filtered = subjects.filter(
				(_, idx) => idx !== subjectData.su_index
			);
			setSubjects(filtered);
		}

		// Reset form
		setSubjectData({ su_action: "Insert", su_index: null, su_subject: "" });
	};

	const handleSave = async () => {
		if (!userDetails || !userDetails?.us_liID || !userDetails?.uid || !type)
			return;

		if (type == "register") {
			await insertMaterial(
				userDetails?.us_liID,
				userDetails?.uid,
				formData,
				selectedMaterialType,
				holdings,
				subjects,
				files,
				setBtnLoading,
				Alert
			);
			setAccessionCount(0);
			handleDiscard();
		} else if (type == "edit" && id) {
			await updateMaterial(
				id,
				userDetails?.us_liID,
				userDetails?.uid,
				formData,
				selectedMaterialType,
				holdings,
				subjects,
				files,
				setBtnLoading,
				Alert
			);
			router.back();
		}
	};

	const handleDiscard = () => {
		if (type == "register") {
			setSelectedMaterialType(null);
			setFormData({
				ma_status: "Active",
				ma_materialType: "",
				ma_materialCategory: "",
				ma_shelf: "",
			});
			setFiles({
				ma_coverURL: null,
				ma_coverQty: 0,
				ma_softURL: null,
				ma_softQty: 0,
				ma_audioURL: null,
				ma_audioQty: 0,
			});
			setHoldings([]);
			setSubjects([]);
		} else if (type == "edit") {
			getMaterial(
				id,
				setMaterialTypes,
				setFormData,
				setSelectedMaterialType,
				setSubjects,
				setHoldings,
				setFiles,
				setLoading,
				Alert
			);
		}
	};

	useEffect(() => {
		if (formData.ma_materialType == "") {
			setSelectedMaterialType(null);
			setFiles({
				ma_coverURL: null,
				ma_coverQty: 0,
				ma_softURL: null,
				ma_softQty: 0,
				ma_audioURL: null,
				ma_audioQty: 0,
			});
			setHoldings([]);
			setSubjects([]);
			return;
		}
		const selected = materialTypes.find(
			(type) => type.mt_id === formData.ma_materialType
		);

		setSelectedMaterialType(selected);
	}, [formData.ma_materialType]);

	useEffect(() => {
		setPath(pathname);

		const unsubscribers = [];

		if (userDetails?.us_liID) {
			if (type === "register") {
				const unsubscribeMaterialTypes = getMaterialtypelistRealtime(
					userDetails?.us_liID,
					setMaterialTypes,
					setLoading,
					Alert
				);
				unsubscribers.push(unsubscribeMaterialTypes);
			} else if (type === "edit" && id) {
				getMaterial(
					id,
					setMaterialTypes,
					setFormData,
					setSelectedMaterialType,
					setSubjects,
					setHoldings,
					setFiles,
					setLoading,
					Alert
				);
			}

			const unsubscribeCategory = getCategoryListRealtime(
				userDetails?.us_liID,
				setCategory,
				setLoading,
				Alert
			);
			unsubscribers.push(unsubscribeCategory);

			const unsubscribeShelf = getShelfListRealtime(
				userDetails?.us_liID,
				setShelves,
				setLoading,
				Alert
			);
			unsubscribers.push(unsubscribeShelf);

			const unsubscribeDonor = getDonorListRealtime(
				userDetails.us_liID,
				setDonors,
				setLoading,
				Alert
			);

			unsubscribers.push(unsubscribeDonor);
		}

		return () => {
			unsubscribers.forEach((unsub) => unsub && unsub());
		};
	}, [userDetails, showDeactivateModal]);

	return (
		<ProtectedRoute allowedRoles={["USR-2", "USR-3", "USR-4"]}>
			<div className="min-h-screen bg-background transition-colors duration-300">
				<Header />

				<main className="pt-28 pb-6 px-6 sm:px-6 md:px-16 lg:px-[100px] xl:px-[150px]">
					<div className="mb-6 animate-fade-in">
						<button
							onClick={() => router.back()}
							className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit text-[11px]"
						>
							<FiArrowLeft className="w-4 h-4" />
							Back to Previous page
						</button>
					</div>

					<div className="animate-slide-up mb-8">
						<h1 className="font-semibold text-foreground text-[20px]">
							{type && type === "register"
								? "Add New Material to Library"
								: "Edit Material Information"}
						</h1>
						<p className="text-muted-foreground text-[14px]">
							{type && type === "register"
								? "Add a new material to the library collection"
								: "Update the existing material information"}
						</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
						<div className="lg:col-span-2 space-y-8">
							<Card className="bg-card border-border shadow-sm animate-slide-up-delay-1 w-full ">
								<CardContent className="p-6">
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div>
											<Label className="text-foreground font-medium text-[12px] ">
												Material Type
											</Label>
											<select
												value={formData.ma_materialType}
												onChange={(e) =>
													handleInputChange(
														setFormData,
														"ma_materialType",
														e.target.value
													)
												}
												className="mt-1 h-9 w-full bg-background border border-border text-foreground rounded-md px-3 text-[12px]"
												disabled={type && type == "edit"}
											>
												<option value="">Select material type</option>
												{materialTypes.map((type) => (
													<option key={type.mt_id} value={type.mt_id}>
														{type.mt_name}
													</option>
												))}
											</select>
										</div>
										<div>
											<Label className="text-foreground font-medium text-[12px]">
												Material Category
											</Label>
											<select
												value={formData.ma_materialCategory}
												onChange={(e) =>
													handleInputChange(
														setFormData,
														"ma_materialCategory",
														e.target.value
													)
												}
												className="mt-1 h-9 w-full bg-background border border-border text-foreground rounded-md px-3 text-[12px]"
											>
												<option value="">Select material category</option>
												{categories.map((category, index) => (
													<option key={index} value={category.ca_id}>
														{category.ca_name}
													</option>
												))}
											</select>
										</div>
										<div>
											<Label className="text-foreground font-medium text-[12px]">
												Shelf
												<button
													onClick={() => setShowShelfModal(true)}
													className="text-primary-custom hover:underline transition-colors ml-2 text-[12px]"
												>
													Register Shelf
												</button>
											</Label>
											<select
												value={formData.ma_shelf}
												onChange={(e) =>
													handleInputChange(
														setFormData,
														"ma_shelf",
														e.target.value
													)
												}
												className="mt-1 h-9 w-full bg-background border border-border text-foreground rounded-md px-3 text-[12px]"
											>
												<option value="">Select shelf location</option>
												{shelves.map((shelf, index) => (
													<option key={index} value={shelf.sh_id}>
														{shelf.sh_name}
													</option>
												))}
											</select>
										</div>
									</div>
								</CardContent>
							</Card>

							{selectedMaterialType && (
								<Card className="bg-card border-border shadow-sm animate-slide-up-delay-2">
									<CardHeader className="pb-2">
										<CardTitle className="text-foreground text-[16px]">
											{selectedMaterialType.mt_name} Details
										</CardTitle>
									</CardHeader>
									<CardContent className="pt-0">
										<Tabs
											className="w-full"
											defaultValue={defaultSection[0].mt_section + "0"}
										>
											<TabsList
												className="w-full bg-background border-b border-border flex justify-start overflow-x-auto whitespace-nowrap mb-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
												style={{ scrollbarWidth: "thin" }}
											>
												{[
													...defaultSection,
													...selectedMaterialType.mt_section,
												].map((section, index) => (
													<TabsTrigger
														key={section.mt_section + index}
														value={section.mt_section + index}
														className="min-w-[120px] data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent hover:text-primary-600 transition-colors text-[12px] px-3 flex-shrink-0"
													>
														{section.mt_section}
													</TabsTrigger>
												))}
											</TabsList>

											{[
												...defaultSection,
												...selectedMaterialType.mt_section,
											].map((section, index) => (
												<div key={index}>
													<TabsContent
														key={section.mt_section + "-content"}
														value={section.mt_section + index}
													>
														{index == 0 && (
															<div>
																<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-6 border-b border-border">
																	<div>
																		<Label className="text-foreground font-medium text-[12px]">
																			Type
																		</Label>
																		<select
																			value={formData.ma_acquisitionType}
																			onChange={(e) =>
																				handleInputChange(
																					setFormData,
																					"ma_acquisitionType",
																					e.target.value
																				)
																			}
																			className="mt-1 h-9 w-full bg-background border border-border text-foreground rounded-md px-3"
																			style={{ fontSize: "11px" }}
																		>
																			<option value="Donated">Donated</option>
																			<option value="Bought">Bought</option>
																		</select>
																	</div>

																	{formData.ma_acquisitionType === "Donated" ? (
																		<div>
																			<Label className="text-foreground font-medium text-[12px]">
																				Donor
																				<button
																					onClick={() =>
																						setShowAddDonorModal(true)
																					}
																					className="text-primary-custom hover:underline transition-colors ml-2 text-[12px]"
																				>
																					Register Donor
																				</button>
																			</Label>
																			<select
																				value={formData.ma_donor}
																				onChange={(e) =>
																					handleInputChange(
																						setFormData,
																						"ma_donor",
																						e.target.value
																					)
																				}
																				className="mt-1 h-9 w-full bg-background border border-border text-foreground rounded-md px-3"
																				style={{ fontSize: "12px" }}
																			>
																				<option value="">Select Donor</option>
																				{donors.map((donor, index) => (
																					<option
																						key={index}
																						value={donor.do_id}
																					>
																						{donor.do_name}
																					</option>
																				))}
																			</select>
																		</div>
																	) : (
																		<div>
																			<Label className="text-foreground font-medium text-[12px]">
																				Price per Item
																			</Label>
																			<Input
																				type="number"
																				placeholder="e.g., 25.99"
																				value={formData.ma_pricePerItem}
																				onChange={(e) =>
																					handleInputChange(
																						setFormData,
																						"ma_pricePerItem",
																						e.target.value
																					)
																				}
																				className="mt-1 h-9 bg-background border-border text-foreground w-full"
																				style={{ fontSize: "12px" }}
																				step="0.01"
																				min="0"
																			/>
																		</div>
																	)}
																</div>

																<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6 mb-6">
																	<div>
																		<Label className="text-foreground font-medium text-[12px]">
																			Soft Copy
																		</Label>
																		<Input
																			placeholder="e.g., 5 copies"
																			className="mt-1 h-9 bg-background border-border text-foreground"
																			style={{ fontSize: "12px" }}
																			type="number"
																			min={1}
																			value={files.ma_softQty || ""}
																			onChange={(e) =>
																				handleInputChange(
																					setFiles,
																					"ma_softQty",
																					e.target.value
																				)
																			}
																		/>
																	</div>
																	<div>
																		<Label className="text-foreground font-medium text-[12px]">
																			Audio Copy
																		</Label>
																		<Input
																			placeholder="e.g., 3 copies"
																			className="mt-1 h-9 bg-background border-border text-foreground"
																			style={{ fontSize: "12px" }}
																			type="number"
																			min={1}
																			value={files.ma_audioQty || ""}
																			onChange={(e) =>
																				handleInputChange(
																					setFiles,
																					"ma_audioQty",
																					e.target.value
																				)
																			}
																		/>
																	</div>
																</div>

																<h3 className="font-semibold text-[14px] mb-2">
																	Accession Details
																</h3>
																<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full justify-items-start ">
																	<Input
																		placeholder="Accession No."
																		className=" h-9 bg-background border-border text-foreground w-full"
																		style={{ fontSize: "12px" }}
																		value={"Auto-generated"}
																		readOnly
																	/>
																	<Input
																		placeholder="Volume/Part"
																		className=" h-9 bg-background border-border text-foreground w-full"
																		style={{ fontSize: "12px" }}
																		value={holdingData.ho_volume || ""}
																		onChange={(e) =>
																			handleInputChange(
																				setHoldingData,
																				"ho_volume",
																				e.target.value
																			)
																		}
																	/>
																	<Input
																		placeholder="Copy#"
																		className=" h-9 bg-background border-border text-foreground w-full"
																		style={{ fontSize: "12px" }}
																		value={holdingData.ho_copy || ""}
																		onChange={(e) =>
																			handleInputChange(
																				setHoldingData,
																				"ho_copy",
																				e.target.value
																			)
																		}
																	/>
																	<Button
																		className="bg-primary text-white hover:opacity-90 h-9 px-4 flex items-center  w-full gap-2 text-[12px]"
																		disabled={
																			holdingData.ho_volume == "" ||
																			holdingData.ho_copy == ""
																		}
																		onClick={() =>
																			handleHoldings(
																				{
																					...holdingData,
																					ho_action:
																						holdingData.ho_action == "Insert"
																							? "Insert"
																							: "Update",
																				},
																				setHoldingData,
																				holdings,
																				setHoldings
																			)
																		}
																	>
																		<FiPlus className="w-3 h-3" />
																		{holdingData.ho_action == "Insert"
																			? "Add Holding"
																			: "Update Holding"}
																	</Button>
																</div>
																{holdings.length > 0 && (
																	<div className="overflow-x-auto mt-4">
																		<table className="w-full">
																			<thead>
																				<tr className="border-b border-border">
																					<th className="text-left py-3 text-foreground font-medium text-[12px]">
																						Accession No.
																					</th>

																					<th className="text-left py-3 text-foreground font-medium text-[12px]">
																						Volume/Part
																					</th>
																					<th className="text-left py-3 text-foreground font-medium text-[12px]">
																						Copy #
																					</th>
																					<th className="text-left py-3 text-foreground font-medium text-[12px]">
																						Status
																					</th>
																					<th className="text-left py-3 text-foreground font-medium text-[12px]">
																						Action
																					</th>
																				</tr>
																			</thead>
																			<tbody>
																				{holdings.map((holding, idx) => (
																					<tr
																						key={idx}
																						className="border-b border-border/50 hover:bg-muted/20 transition-colors duration-200 cursor-pointer"
																					>
																						<td className="py-3 text-foreground text-[12px]">
																							{holding.ho_access}
																						</td>

																						<td className="py-3 text-foreground text-[12px]">
																							{holding.ho_volume}
																						</td>

																						<td className="py-3 text-foreground text-[12px]">
																							{holding.ho_copy}
																						</td>
																						<td className="py-3 text-foreground text-[12px]">
																							<span
																								className={`px-2 py-1 rounded-full text-xs font-medium ${
																									holding.ho_status === "Active"
																										? "bg-green-100 text-green-800"
																										: "bg-red-100 text-red-800"
																								}`}
																							>
																								{holding.ho_status || "Active"}
																							</span>
																						</td>

																						<td
																							className="py-3 text-foreground text-[12px]"
																							style={{ width: "50px" }}
																						>
																							<span className="flex items-center ml-auto gap-1">
																								<Button
																									variant="ghost"
																									size="sm"
																									className="text-primary-custom hover:text-secondary-custom h-6 w-6 p-0"
																									onClick={() =>
																										setHoldingData({
																											ho_access:
																												holding.ho_access,
																											ho_volume:
																												holding.ho_volume,
																											ho_copy: holding.ho_copy,
																											ho_action: "Update",
																											ho_index: idx,
																											ho_status:
																												holding.ho_status,
																										})
																									}
																									title="Edit Accession"
																								>
																									<FiEdit className="w-3 h-3" />
																								</Button>

																								<Button
																									variant="ghost"
																									size="sm"
																									className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
																									onClick={() => {
																										if (type === "edit") {
																											setAccessionToDeactivate({
																												...holding,
																												ho_action: "Status",
																												ho_index: idx,
																											});

																											setShowDeactivateAccessionModal(
																												true
																											);
																										} else {
																											handleHoldings(
																												{
																													...holding,
																													ho_action: "Delete",
																													ho_index: idx,
																												},
																												null,
																												holdings,
																												setHoldings
																											);
																										}
																									}}
																									title="Delete Accession"
																								>
																									<FiX className="w-3 h-3" />
																								</Button>
																							</span>
																						</td>
																					</tr>
																				))}
																			</tbody>
																		</table>
																	</div>
																)}
															</div>
														)}

														{index == 1 && (
															<div>
																<div className="flex gap-4 ">
																	<div className="flex-1">
																		<Input
																			placeholder="Material Subject"
																			className=" h-9 bg-background border-border text-foreground w-full"
																			style={{ fontSize: "12px" }}
																			value={subjectData.su_subject || ""}
																			onChange={(e) =>
																				handleInputChange(
																					setSubjectData,
																					"su_subject",
																					e.target.value
																				)
																			}
																		/>
																	</div>

																	<div className="flex items-end">
																		<Button
																			className="bg-primary text-white hover:opacity-90 h-9 px-4 flex items-center gap-2 w-fit text-[12px]"
																			disabled={subjectData.su_subject == ""}
																			onClick={() =>
																				handleSubjects(
																					{
																						...subjectData,
																						su_action:
																							subjectData.su_action == "Insert"
																								? "Insert"
																								: "Update",
																					},
																					setSubjectData,
																					subjects,
																					setSubjects
																				)
																			}
																		>
																			<FiPlus className="w-3 h-3" />
																			{subjectData.su_action == "Insert"
																				? "Add Subject"
																				: "Update Update"}
																		</Button>
																	</div>
																</div>
																{subjects.length > 0 && (
																	<div className="overflow-x-auto  mt-4">
																		<table className="w-full">
																			<thead>
																				<tr className="border-b border-border">
																					<th className="text-left py-3 text-foreground font-medium text-[12px]">
																						Subject
																					</th>

																					<th className="text-left py-3 text-foreground font-medium text-[12px]">
																						Action
																					</th>
																				</tr>
																			</thead>
																			<tbody>
																				{subjects.map((subject, idx) => (
																					<tr
																						key={idx}
																						className="border-b border-border/50 hover:bg-muted/20 transition-colors duration-200 cursor-pointer"
																					>
																						<td
																							className="py-3 text-foreground text-[12px]"
																							style={{ width: "100%" }}
																						>
																							{subject}
																						</td>

																						<td
																							className="py-3 text-foreground text-[12px]"
																							style={{ width: "auto" }}
																						>
																							<span className="flex items-center ml-auto gap-1">
																								{/* EDIT BUTTON */}
																								<Button
																									variant="ghost"
																									size="sm"
																									className="text-primary-custom hover:text-secondary-custom h-6 w-6 p-0"
																									onClick={() =>
																										setSubjectData({
																											su_subject: subject,
																											su_action: "Update",
																											su_index: idx,
																										})
																									}
																									title="Edit Subject"
																								>
																									<FiEdit className="w-3 h-3" />
																								</Button>

																								<Button
																									variant="ghost"
																									size="sm"
																									className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
																									onClick={() =>
																										handleSubjects(
																											{
																												...subject,
																												su_action: "Delete",
																												su_index: idx,
																											},
																											setSubjectData,
																											subjects,
																											setSubjects
																										)
																									}
																									title="Delete Subject"
																								>
																									<FiX className="w-3 h-3" />
																								</Button>
																							</span>
																						</td>
																					</tr>
																				))}
																			</tbody>
																		</table>
																	</div>
																)}
															</div>
														)}

														{index > 1 && (
															<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
																{Array.isArray(section.mt_fields) &&
																section.mt_fields.length > 0 ? (
																	section.mt_fields.map((field, idx) => {
																		const value = field?.mt_value || "";

																		return (
																			field.mt_title != "Subject" && (
																				<div key={idx} className="space-y-1">
																					<Label className="text-foreground font-medium text-[12px]">
																						{field.mt_title}{" "}
																						<span className="text-muted-foreground">
																							({field.mt_marcTag})
																						</span>
																					</Label>

																					{field.mt_type === "Text" && (
																						<Input
																							value={value}
																							onChange={(e) =>
																								handleFieldChange(
																									section.mt_section,
																									field.mt_title,
																									e.target.value
																								)
																							}
																							placeholder={`Enter ${field.mt_title.toLowerCase()}`}
																							className="h-9 bg-background border-border text-foreground"
																							style={{ fontSize: "12px" }}
																						/>
																					)}

																					{field.mt_type === "Textarea" && (
																						<Textarea
																							value={value}
																							onChange={(e) =>
																								handleFieldChange(
																									section.mt_section,
																									field.mt_title,
																									e.target.value
																								)
																							}
																							placeholder={`Enter ${field.mt_title.toLowerCase()}`}
																							className="h-24 bg-background border-border text-foreground resize-none"
																							style={{ fontSize: "12px" }}
																						/>
																					)}

																					{field.mt_type === "Year" && (
																						<Input
																							type="number"
																							min="1900"
																							max={new Date().getFullYear()}
																							value={value || ""}
																							onChange={(e) =>
																								handleFieldChange(
																									section.mt_section,
																									field.mt_title,
																									e.target.value
																								)
																							}
																							className="h-9 bg-background border-border text-foreground"
																							style={{ fontSize: "12px" }}
																							placeholder="YYYY"
																						/>
																					)}

																					{field.mt_type === "Date" && (
																						<Input
																							type="date"
																							value={value || ""}
																							onChange={(e) => {
																								handleFieldChange(
																									section.mt_section,
																									field.mt_title,
																									e.target.value
																								);
																							}}
																							className="h-9 bg-background border-border text-foreground"
																							style={{ fontSize: "12px" }}
																						/>
																					)}

																					{field.mt_type === "Number" && (
																						<Input
																							type="number"
																							value={value}
																							onChange={(e) =>
																								handleFieldChange(
																									section.mt_section,
																									field.mt_title,
																									e.target.value
																								)
																							}
																							className="h-9 bg-background border-border text-foreground"
																							style={{ fontSize: "12px" }}
																							placeholder={`Enter ${field.mt_title.toLowerCase()}`}
																						/>
																					)}

																					{field.mt_type === "Double" && (
																						<Input
																							type="number"
																							step="any"
																							value={value}
																							onChange={(e) =>
																								handleFieldChange(
																									section.mt_section,
																									field.mt_title,
																									e.target.value === ""
																										? ""
																										: parseFloat(e.target.value)
																								)
																							}
																							className="h-9 bg-background border-border text-foreground"
																							style={{ fontSize: "12px" }}
																							placeholder={`Enter ${field.mt_title.toLowerCase()}`}
																						/>
																					)}
																				</div>
																			)
																		);
																	})
																) : (
																	<p className="text-muted-foreground text-[12px]">
																		No fields available for this section.
																	</p>
																)}
															</div>
														)}
													</TabsContent>
												</div>
											))}
										</Tabs>
									</CardContent>
								</Card>
							)}

							{/* Action Buttons */}
							<div className="flex gap-3 animate-slide-up-delay-4">
								<Button
									onClick={handleSave}
									className="bg-primary-custom text-white hover:opacity-90 h-10 px-6 flex items-center gap-2 text-[12px]"
									disabled={
										formData?.ma_materialType.trim() === "" ||
										formData?.ma_materialCategory.trim() === "" ||
										formData?.ma_shelf.trim() === "" ||
										(formData?.ma_pricePerItem === 0 &&
											formData?.ma_donor?.trim() === "") ||
										selectedMaterialType?.mt_section?.every((section) =>
											section?.mt_fields.every(
												(field) => (field?.mt_value ?? "").trim() === ""
											)
										) ||
										(holdings.length < 1 &&
											(files.ma_softQty == 0 || !files.ma_softURL) &&
											(files.ma_audioQty == 0 || !files.ma_audioURL)) ||
										(files.ma_softQty > 0 && !files.ma_softURL) ||
										(files.ma_audioQty > 0 && !files.ma_audioURL)
									}
								>
									<LoadingSpinner loading={btnLoading} />
									{type === "register"
										? "Register Material"
										: "Update Material"}
								</Button>

								<Button
									onClick={handleDiscard}
									variant="outline"
									className="h-11 px-6 border-border text-foreground hover:bg-accent flex items-center gap-2 text-[12px]"
									disabled={
										formData?.ma_materialType.trim() === "" &&
										formData?.ma_materialCategory.trim() === "" &&
										formData?.ma_shelf.trim() === "" &&
										holdings?.length < 1 &&
										(files.ma_softQty == 0 || !files.ma_softURL) &&
										(files.ma_audioQty == 0 || !files.ma_audioURL) &&
										subjects.length < 1
									}
								>
									<FiRotateCcw className="w-4 h-4" />
									Discard Changes
								</Button>
							</div>
						</div>

						{/* File Uploads Sidebar */}
						<div className="space-y-8">
							<Card className="bg-card border-border shadow-sm animate-slide-up-delay-2">
								<CardHeader className="pb-4">
									<CardTitle className="text-foreground flex items-center  gap-2 text-[16px]">
										<FiImage className="w-4 h-4" />
										Book Cover
									</CardTitle>
									<p className="text-muted-foreground text-[12px]">
										Upload cover image (.jpg, .png)
									</p>
								</CardHeader>
								<CardContent className="pt-0">
									<label
										htmlFor="cover-image-upload"
										className="border-2 border-dashed border-border rounded-lg text-center hover:border-primary-custom/50 transition-colors cursor-pointer block w-fit mx-auto"
									>
										<input
											type="file"
											accept=".jpg, .jpeg, .png"
											className="hidden"
											onChange={(e) =>
												handleInputChange(
													setFiles,
													"ma_coverURL",
													e.target.files?.[0]
												)
											}
											id="cover-image-upload"
										/>
										{files.ma_coverURL ? (
											<div className="space-y-2">
												<div className="w-[140px] h-[190px] bg-muted/30 rounded-md flex items-center justify-center overflow-hidden shadow-md">
													<img
														src={
															files.ma_coverURL instanceof File
																? URL.createObjectURL(files.ma_coverURL)
																: files.ma_coverURL
														}
														alt="Book preview"
														className="w-full h-full object-cover rounded-md"
													/>
												</div>
											</div>
										) : (
											<div className="space-y-2 p-6 w-[140px] h-[190px] flex flex-col items-center justify-center">
												<FiUpload className="w-6 h-6 text-muted-foreground" />
												<p className="text-muted-foreground text-xs text-center">
													Click to upload
												</p>
											</div>
										)}
									</label>

									{files.ma_coverURL && (
										<p
											onClick={(e) =>
												handleInputChange(setFiles, "ma_coverURL", null)
											}
											className="text-red-500 text-xs mt-3 hover:underline cursor-pointer"
										>
											Remove this cover picture
										</p>
									)}
								</CardContent>
							</Card>

							{files.ma_softQty > 0 && (
								<Card className="bg-card border-border shadow-sm animate-slide-up-delay-3">
									<CardHeader className="pb-4">
										<CardTitle className="text-foreground flex items-center gap-2 text-[16px]">
											<FiFile className="w-4 h-4" />
											Soft Copy
										</CardTitle>
										<p className="text-muted-foreground text-[12px]">
											Upload PDF document (.pdf)
										</p>
									</CardHeader>
									<CardContent className="pt-0">
										<label
											htmlFor="soft-upload"
											className="block border border-border rounded-lg p-4 text-center hover:border-primary-custom/50 transition-colors cursor-pointer"
										>
											<input
												type="file"
												accept="application/pdf"
												className="hidden"
												id="soft-upload"
												onChange={(e) =>
													handleInputChange(
														setFiles,
														"ma_softURL",
														e.target.files?.[0]
													)
												}
											/>
											{files.ma_softURL ? (
												<div className="space-y-2">
													<FiFile className="w-6 h-6 mx-auto text-primary-custom" />
													<p className="text-foreground font-medium text-xs">
														{files.ma_softURL.name}
													</p>
												</div>
											) : (
												<div className="space-y-2">
													<FiUpload className="w-6 h-6 mx-auto text-muted-foreground" />
													<p className="text-muted-foreground text-xs">
														Click to upload PDF
													</p>
												</div>
											)}
										</label>

										{files.ma_softURL && (
											<p
												onClick={(e) =>
													handleInputChange(setFiles, "ma_softURL", null)
												}
												className="text-red-500 text-xs mt-2 hover:underline cursor-pointer"
											>
												Remove this PDF file
											</p>
										)}
									</CardContent>
								</Card>
							)}

							{files.ma_audioQty > 0 && (
								<Card className="bg-card border-border shadow-sm animate-slide-up-delay-4">
									<CardHeader className="pb-4">
										<CardTitle className="text-foreground flex items-center gap-2 text-[16px]">
											<FiMusic className="w-4 h-4" />
											Audio Copy
										</CardTitle>
										<p className="text-muted-foreground text-[12px]">
											Upload audio file (.mp3, .wav)
										</p>
									</CardHeader>
									<CardContent className="pt-0">
										<label
											htmlFor="audio-upload"
											className="block border border-border rounded-lg p-4 text-center hover:border-primary-custom/50 transition-colors cursor-pointer"
										>
											<input
												type="file"
												accept="audio/mp3,audio/wav"
												className="hidden"
												id="audio-upload"
												onChange={(e) =>
													handleInputChange(
														setFiles,
														"ma_audioURL",
														e.target.files?.[0]
													)
												}
											/>
											{files.ma_audioURL ? (
												<div className="space-y-2">
													<FiMusic className="w-6 h-6 mx-auto text-primary-custom" />
													<p className="text-foreground font-medium text-xs">
														{files.ma_audioURL.name}
													</p>
												</div>
											) : (
												<div className="space-y-2">
													<FiUpload className="w-6 h-6 mx-auto text-muted-foreground" />
													<p className="text-muted-foreground text-xs">
														Click to upload audio file
													</p>
												</div>
											)}
										</label>

										{files.ma_audioURL && (
											<p
												onClick={(e) =>
													handleInputChange(setFiles, "ma_audioURL", null)
												}
												className="text-red-500 text-xs mt-2 hover:underline cursor-pointer"
											>
												Remove this Audio file
											</p>
										)}
									</CardContent>
								</Card>
							)}

							{type && id && type == "edit" && (
								<Card className="bg-card border-border shadow-sm animate-slide-up-delay-5">
									<CardContent className="p-6">
										<div className="space-y-4">
											<div className="flex items-start gap-3">
												<div
													className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
														formData.ma_status === "Active"
															? "bg-red-50"
															: "bg-green-50"
													}`}
												>
													{formData.ma_status === "Active" ? (
														<FiTrash2 className="w-4 h-4 text-red-500" />
													) : (
														<IoMdCheckmarkCircleOutline className="w-4 h-4 text-green-500" />
													)}
												</div>
												<div className="flex-1 space-y-1">
													<h2 className="font-semibold text-foreground text-[16px] ">
														{formData.ma_status === "Active"
															? "Deactivate Material"
															: "Activate Material"}
													</h2>
													<p className="text-muted-foreground leading-relaxed text-[12px]">
														{formData.ma_status === "Active"
															? "This will remove the material from search results and circulation. The material can be reactivated later by an administrator."
															: "This will restore the material to be available again in search results and circulation."}
													</p>
												</div>
											</div>

											<div className="pt-2 border-t border-border">
												<Button
													variant="outline"
													onClick={() => setShowDeactivateModal(true)}
													className={`w-full h-9 transition-colors text-[12px] ${
														formData.ma_status === "Active"
															? "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
															: "border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
													}`}
												>
													{formData.ma_status === "Active" ? (
														<FiTrash2 className="w-4 h-4 mr-2" />
													) : (
														<IoMdCheckmarkCircleOutline className="w-4 h-4 mr-2" />
													)}
													{formData.ma_status === "Active"
														? "Deactivate Material"
														: "Activate Material"}
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							)}
						</div>
					</div>
					<ShelfRegistrationModal
						isOpen={showShelfModal}
						onClose={() => setShowShelfModal(false)}
						shelves={shelves}
						userDetails={userDetails}
						Alert={Alert}
						loading={loading}
					/>

					{showAddDonorModal && (
						<AddDonorModal
							isOpen={showAddDonorModal}
							onClose={() => setShowAddDonorModal(false)}
							donors={donors}
							userDetails={userDetails}
							Alert={Alert}
							loading={loading}
						/>
					)}
				</main>

				{/* Deactivate Resource Modal */}
				{showDeactivateModal && (
					<DeactivateResourceModal
						isOpen={showDeactivateModal}
						onClose={() => setShowDeactivateModal(false)}
						resourceType="material"
						resourceId={formData.id}
						resourceTitle={
							selectedMaterialType?.mt_section[0]?.mt_fields?.find(
								(f) => f.mt_title === "Title"
							)?.mt_value || "Untitled Material"
						}
						resourceStatus={formData.ma_status}
						resourceQr={formData.ma_qr}
						userDetails={userDetails}
						Alert={Alert}
					/>
				)}

				{/* Deactivate Accession Modal */}
				{showDeactivateAccessionModal && accessionToDeactivate && (
					<DeactivateAccessionModal
						isOpen={showDeactivateAccessionModal}
						onClose={() => {
							setShowDeactivateAccessionModal(false);
							setAccessionToDeactivate(null);
						}}
						accessionToDeactivate={accessionToDeactivate}
						holdings={holdings}
						setHoldings={setHoldings}
						handleHoldings={handleHoldings}
					/>
				)}
			</div>
		</ProtectedRoute>
	);
}
