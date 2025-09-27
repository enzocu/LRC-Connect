"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
	FiArrowLeft,
	FiPlus,
	FiX,
	FiRotateCcw,
	FiInfo,
	FiEdit,
} from "react-icons/fi";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import ProtectedRoute from "@/contexts/ProtectedRoute";
import { useLoading } from "@/contexts/LoadingProvider";

import { LoadingSpinner } from "@/components/loading";

import { MaterialTypeModal } from "@/components/modal/materialtype-modal";

import { insertMaterialtype } from "@/controller/firebase/insert/insertMaterialtype";
import { insertCategory } from "@/controller/firebase/insert/insertCategory";
import {
	updateCategory,
	updateCategoryStatus,
} from "@/controller/firebase/update/updateCategory";
import {
	updateMaterialtype,
	updateMaterialtypeStatus,
} from "@/controller/firebase/update/updateMaterialtype";
import { getCategoryListRealtime } from "@/controller/firebase/get/getCategoryListRealtime";
import { getMaterialtypelistRealtime } from "@/controller/firebase/get/getMaterialtypelist";

const defaultField = {
	mt_section: "General",
	mt_fields: [
		{
			mt_marcTag: "050",
			mt_title: "Call Number",
			mt_type: "Text",
		},

		{
			mt_marcTag: "245",
			mt_title: "Title",
			mt_type: "Text",
		},
		{
			mt_marcTag: "100",
			mt_title: "Author",
			mt_type: "Text",
		},
		{
			mt_marcTag: "26s4$a",
			mt_title: "Publisher",
			mt_type: "Textarea",
		},
		{
			mt_marcTag: "264$a",
			mt_title: "Place of Publication",
			mt_type: "Text",
		},
		{
			mt_marcTag: "264$c",
			mt_title: "Copyright/Publication Year",
			mt_type: "Year",
		},
		{
			mt_marcTag: "300$a",
			mt_title: "Pages",
			mt_type: "Text",
		},
		{
			mt_marcTag: "310$a",
			mt_title: "Size",
			mt_type: "Text",
		},
		{
			mt_marcTag: "020$a",
			mt_title: "ISBN",
			mt_type: "Text",
		},
		{
			mt_marcTag: "041$a",
			mt_title: "Language",
			mt_type: "Text",
		},
		{
			mt_marcTag: "520$a",
			mt_title: "Description",
			mt_type: "Textarea",
		},
		{
			mt_marcTag: "650$a",
			mt_title: "Subject",
			mt_type: "Text",
		},
	],
};

export default function MaterialTypeRegistrationPage() {
	const router = useRouter();
	const pathname = usePathname();
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const { setLoading, setPath } = useLoading();
	const [btnLoading, setBtnLoading] = useState(false);
	const [btnCategory, setBtnCategory] = useState(false);

	const [registeredMaterialTypes, setRegisteredMaterialTypes] = useState([]);
	const [categories, setCategory] = useState([]);

	const [mt_id, setMt_id] = useState(null);
	const [newCategory, setNewCategory] = useState({
		ca_id: null,
		ca_name: "",
	});

	const [materialTypeData, setMaterialTypeData] = useState([defaultField]);
	const [actionType, setActionType] = useState("");
	const [type, setType] = useState("");
	const [showMaterialTypeModal, setShowMaterialTypeModal] = useState(false);

	const [materialTypeName, setMaterialTypeName] = useState("");
	const [materialField, setMaterialField] = useState({
		mt_sectionTransferIndex: null,
		mt_sectionIndex: null,
		mt_fieldIndex: null,
		mt_section: "",
		mt_marcTag: "",
		mt_title: "",
		mt_type: "Text",
	});

	const handleSave = () => {
		if (!userDetails || !userDetails?.us_liID || !userDetails?.uid) return;
		if (!mt_id) {
			insertMaterialtype(
				userDetails?.us_liID,
				userDetails?.uid,
				materialTypeName,
				materialTypeData,
				setBtnLoading,
				Alert
			);
		} else if (mt_id) {
			updateMaterialtype(
				mt_id,
				userDetails?.us_liID,
				userDetails?.uid,
				materialTypeName,
				materialTypeData,
				setBtnLoading,
				Alert
			);
		}
		handleDiscard();
		setMaterialTypeData([defaultField]);
		setMaterialTypeName("");
	};

	const handleInactiveMaterial = async (mt_id, materialTypeName) => {
		if (!userDetails || !userDetails?.us_liID || !userDetails?.uid) return;
		await updateMaterialtypeStatus(
			mt_id,
			userDetails?.us_liID,
			userDetails?.uid,
			materialTypeName,
			"Inactive",
			Alert
		);
	};

	const mtField = (materialField, setMaterialTypeData, actionType) => {
		const {
			mt_sectionTransferIndex,
			mt_sectionIndex,
			mt_fieldIndex,
			mt_section,
			mt_marcTag,
			mt_title,
			mt_type,
		} = materialField;

		setMaterialTypeData((prevData) => {
			let newData = [...prevData];

			if (actionType == "InsertSection") {
				const existingSectionIndex = newData.findIndex(
					(sec) => sec.mt_section === mt_section
				);

				if (existingSectionIndex === -1 && mt_section?.trim()) {
					newData.push({
						mt_section,
						mt_fields: [],
					});
				}
			} else if (actionType == "InsertField") {
				const existingSectionIndex = newData.findIndex(
					(sec) => sec.mt_section === mt_section
				);

				if (existingSectionIndex !== -1) {
					const isDuplicate = newData[existingSectionIndex].mt_fields.some(
						(f) => f.mt_marcTag === mt_marcTag || f.mt_title === mt_title
					);

					if (!isDuplicate) {
						newData[existingSectionIndex].mt_fields.push({
							mt_marcTag,
							mt_title,
							mt_type,
						});
					}
				} else {
					newData.push({
						mt_section,
						mt_fields: [{ mt_marcTag, mt_title, mt_type }],
					});
				}
			} else if (mt_sectionIndex != null && actionType == "UpdateSection") {
				newData[mt_sectionIndex].mt_section = mt_section;
			} else if (
				mt_sectionIndex != null &&
				mt_fieldIndex != null &&
				actionType == "UpdateField"
			) {
				newData[mt_sectionIndex].mt_fields[mt_fieldIndex] = {
					mt_marcTag,
					mt_title,
					mt_type,
				};
			} else if (mt_sectionIndex != null && actionType == "DeleteSection") {
				newData.splice(mt_sectionIndex, 1);
			} else if (
				mt_sectionIndex != null &&
				mt_fieldIndex != null &&
				actionType == "DeleteField"
			) {
				newData[mt_sectionIndex].mt_fields.splice(mt_fieldIndex, 1);
			} else if (
				mt_sectionTransferIndex != null &&
				mt_sectionIndex != null &&
				actionType == "TransferSection"
			) {
				const fieldsToMove = newData[mt_sectionIndex]?.mt_fields ?? [];

				if (fieldsToMove.length > 0) {
					fieldsToMove.forEach((field) => {
						const alreadyExists = newData[
							mt_sectionTransferIndex
						]?.mt_fields?.some(
							(f) =>
								f.mt_marcTag === field.mt_marcTag &&
								f.mt_title === field.mt_title
						);

						if (!alreadyExists) {
							newData[mt_sectionTransferIndex].mt_fields.push(field);
						}
					});

					newData[mt_sectionIndex].mt_fields = [];

					if (newData[mt_sectionIndex].mt_fields.length === 0) {
						newData.splice(mt_sectionIndex, 1);
					}
				}
			} else if (
				mt_sectionTransferIndex != null &&
				mt_sectionIndex != null &&
				mt_fieldIndex != null &&
				actionType == "TransferField"
			) {
				const fieldToMove =
					newData[mt_sectionIndex]?.mt_fields?.[mt_fieldIndex];

				if (fieldToMove) {
					const alreadyExists = newData[
						mt_sectionTransferIndex
					]?.mt_fields?.some(
						(f) =>
							f.mt_marcTag === fieldToMove.mt_marcTag &&
							f.mt_title === fieldToMove.mt_title
					);

					if (!alreadyExists) {
						newData[mt_sectionTransferIndex].mt_fields.push(fieldToMove);
						newData[mt_sectionIndex].mt_fields.splice(mt_fieldIndex, 1);
					}
				}
			}

			return newData;
		});

		handleDiscard();
	};

	const handleDiscard = () => {
		setMaterialField({
			mt_sectionIndex: null,
			mt_sectionTransferIndex: null,
			mt_fieldIndex: null,
			mt_section: "",
			mt_marcTag: "",
			mt_title: "",
			mt_type: "Text",
		});
		setShowMaterialTypeModal(false);
		setMt_id(null);
	};

	const handleCategory = () => {
		if (!userDetails || !userDetails?.us_liID || !userDetails?.uid) return;
		if (!newCategory.ca_id) {
			insertCategory(
				userDetails?.us_liID,
				userDetails?.uid,
				newCategory.ca_name,
				setBtnCategory,
				Alert
			);
		} else {
			updateCategory(
				newCategory.ca_id,
				userDetails?.us_liID,
				userDetails?.uid,
				newCategory.ca_name,
				setBtnCategory,
				Alert
			);
		}

		setNewCategory({ ca_id: null, ca_name: "" });
	};

	const handleInactiveCategory = (ca_id, ca_name) => {
		if (!userDetails || !userDetails?.us_liID || !userDetails?.uid) return;
		updateCategoryStatus(
			ca_id,
			userDetails?.us_liID,
			userDetails?.uid,
			ca_name,
			"Inactive",
			setBtnCategory,
			Alert
		);
	};

	useEffect(() => {
		setPath(pathname);
		if (userDetails && userDetails?.us_liID) {
			const unsubscribe = getMaterialtypelistRealtime(
				userDetails?.us_liID,
				setRegisteredMaterialTypes,
				setLoading,
				Alert
			);

			return () => unsubscribe && unsubscribe();
		}
	}, [userDetails]);

	useEffect(() => {
		setPath(pathname);
		if (userDetails && userDetails?.us_liID) {
			const unsubscribe = getCategoryListRealtime(
				userDetails?.us_liID,
				setCategory,
				setLoading,
				Alert
			);

			return () => unsubscribe && unsubscribe();
		}
	}, [userDetails]);

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

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
						<div className="lg:col-span-2 space-y-8">
							<div className="animate-slide-up">
								<h1 className="font-semibold text-foreground text-[20px]">
									Register New Materdial Type
								</h1>
								<p className="text-muted-foreground text-[14px]">
									Create a new material type with custom fields and sections
								</p>
							</div>

							<Card className="bg-blue-50 border-blue-200 shadow-sm animate-slide-up">
								<CardContent className="p-4">
									<div className="flex items-start gap-3">
										<FiInfo className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
										<div>
											<p className="text-blue-800 font-medium text-[14px]">
												Call Number Information
											</p>
											<p className="text-blue-700 text-[12px]">
												The Call Number is already included by default for all
												material types.
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="bg-card border-border shadow-sm animate-slide-up-delay-1">
								<CardContent className="p-6">
									<div className="space-y-6">
										<div>
											<Label
												htmlFor="materialTypeName"
												className="text-foreground font-medium text-[12px]"
											>
												Material Type Name
											</Label>
											<Input
												id="materialTypeName"
												value={materialTypeName}
												onChange={(e) => setMaterialTypeName(e.target.value)}
												placeholder="Enter material type name (e.g., Book, Journal, Thesis)"
												className="mt-2 h-9 bg-background border-border text-foreground"
												style={{ fontSize: "12px" }}
											/>
										</div>

										<div>
											<div className="mb-2">
												<h2 className="font-semibold text-foreground text-[16px]">
													Add Section
												</h2>
												<p className="text-muted-foreground text-[12px]">
													Define the fields for this material type. Fields with
													the same section will be grouped together.
												</p>
											</div>

											<div className="flex gap-4">
												<div className="flex-1">
													<Label className="text-foreground font-medium text-[12px]">
														Section
													</Label>
													<Input
														value={materialField?.mt_section ?? ""}
														onChange={(e) =>
															setMaterialField({
																...materialField,
																mt_section: e.target.value,
															})
														}
														placeholder="e.g., Book, Journal"
														className="mt-1 h-9 bg-background border-border text-foreground w-full"
														style={{ fontSize: "12px" }}
													/>
												</div>

												<div className="flex items-end">
													<Button
														onClick={() => {
															mtField(
																{
																	mt_section: materialField.mt_section,
																},
																setMaterialTypeData,
																"InsertSection"
															);
														}}
														disabled={!materialField.mt_section}
														className="bg-primary text-white hover:opacity-90 h-9 px-4 flex items-center gap-2 w-fit text-[12px]"
													>
														<FiPlus className="w-3 h-3" />
														Add Section
													</Button>
												</div>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							{materialTypeData.length > 0 && (
								<div className="space-y-6 animate-slide-up-delay-3">
									{materialTypeData.map((section, sectionIndex) => (
										<Card
											key={sectionIndex}
											className="bg-card border-border shadow-sm"
											id={section.mt_section + sectionIndex}
										>
											<CardHeader className="pb-4">
												<CardTitle className="text-foreground text-[16px] flex items-start justify-between leading-none">
													<span>
														{section.mt_section.charAt(0).toUpperCase() +
															section.mt_section.slice(1)}
													</span>
													<span className="flex gap-2">
														{!(sectionIndex === 0) && (
															<>
																<Button
																	variant="ghost"
																	size="sm"
																	className="text-primary-custom hover:text-secondary-custom h-6 w-6 p-0"
																	onClick={() => {
																		{
																			setMaterialField({
																				mt_sectionIndex: sectionIndex,
																				mt_section: section.mt_section,
																			});
																			setActionType("Insert");
																			setType("Field");
																			setShowMaterialTypeModal(true);
																		}
																	}}
																	title="Insert a new material type field"
																>
																	<FiPlus className="w-3 h-3" />
																</Button>
																<Button
																	variant="ghost"
																	size="sm"
																	className="text-primary-custom hover:text-secondary-custom h-6 w-6 p-0"
																	onClick={() => {
																		{
																			setMaterialField({
																				mt_sectionIndex: sectionIndex,
																				mt_section: section.mt_section,
																			});
																			setActionType("Update");
																			setType("Section");
																			setShowMaterialTypeModal(true);
																		}
																	}}
																	title="Edit material type section name"
																>
																	<FiEdit className="w-3 h-3" />
																</Button>

																<Button
																	variant="ghost"
																	size="sm"
																	className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
																	onClick={() => {
																		mtField(
																			{
																				mt_sectionIndex: sectionIndex,
																			},
																			setMaterialTypeData,
																			"DeleteSection"
																		);
																	}}
																	title="Delete material type section"
																>
																	<FiX className="w-3 h-3" />{" "}
																</Button>
															</>
														)}
													</span>
												</CardTitle>
											</CardHeader>
											{section?.mt_fields?.length > 0 && (
												<CardContent className="pt-0">
													<div className="overflow-x-auto">
														<table className="w-full">
															<thead>
																<tr className="border-b border-border">
																	<th className="text-left py-3 text-foreground font-medium text-[12px]">
																		MARC Tag
																	</th>
																	<th className="text-left py-3 text-foreground font-medium text-[12px]">
																		Title
																	</th>
																	<th className="text-left py-3 text-foreground font-medium text-[12px]">
																		Type
																	</th>
																	<th className="text-left py-3 text-foreground font-medium text-[12px]">
																		Action
																	</th>
																</tr>
															</thead>
															<tbody>
																{section.mt_fields.map((field, fieldIndex) => (
																	<tr
																		key={fieldIndex}
																		className="border-b border-border/50 hover:bg-muted/20 transition-colors duration-200 cursor-pointer"
																		id={field.mt_title + fieldIndex}
																	>
																		<td
																			className="py-3 text-foreground text-[12px]"
																			style={{ width: "20%" }}
																		>
																			{field.mt_marcTag}
																		</td>
																		<td
																			className="py-3 text-foreground text-[12px]"
																			style={{ width: "30%" }}
																		>
																			{field.mt_title}
																		</td>
																		<td
																			className="py-3 text-foreground text-[12px]"
																			style={{
																				width: "auto",
																			}}
																		>
																			{field.mt_type}
																		</td>
																		<td
																			className="py-3  text-right"
																			style={{
																				width: "50px",
																			}}
																		>
																			<span className="flex items-center ml-auto gap-1">
																				<Button
																					variant="ghost"
																					size="sm"
																					className="text-primary-custom hover:text-secondary-custom h-6 w-6 p-0"
																					onClick={() => {
																						{
																							setMaterialField({
																								mt_sectionIndex: sectionIndex,
																								mt_fieldIndex: fieldIndex,
																								mt_section: section.mt_section,
																								mt_marcTag: field.mt_marcTag,
																								mt_title: field.mt_title,
																								mt_type: field.mt_type,
																							});
																							setActionType("Update");
																							setType("Field");
																							setShowMaterialTypeModal(true);
																						}
																					}}
																					title="Edit material type field"
																				>
																					<FiEdit className="w-3 h-3" />
																				</Button>

																				{!(
																					sectionIndex === 0 && fieldIndex < 12
																				) && (
																					<Button
																						variant="ghost"
																						size="sm"
																						className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
																						onClick={() => {
																							mtField(
																								{
																									mt_sectionIndex: sectionIndex,
																									mt_fieldIndex: fieldIndex,
																								},

																								setMaterialTypeData,
																								"DeleteField"
																							);
																						}}
																						title="Delete material type field"
																					>
																						<FiX className="w-3 h-3" />
																					</Button>
																				)}
																			</span>
																		</td>
																	</tr>
																))}
															</tbody>
														</table>
													</div>
												</CardContent>
											)}
										</Card>
									))}
								</div>
							)}

							{/* Action Buttons */}
							<div className="flex gap-3 animate-slide-up-delay-4">
								<Button
									onClick={() => handleSave()}
									className="bg-primary-custom text-white hover:opacity-90 h-11 px-6 flex items-center gap-2 text-[12px]"
									disabled={
										materialTypeData.length === 0 || materialTypeName == ""
									}
								>
									<LoadingSpinner loading={btnLoading} />
									{mt_id ? "Update Type" : "Register Type"}
								</Button>
								<Button
									variant="outline"
									className="h-11 px-6 border-border text-foreground hover:bg-accent flex items-center gap-2 text-[12px]"
									disabled={
										materialTypeData.length === 0 || materialTypeName == ""
									}
									onClick={() => {
										handleDiscard();
										setMaterialTypeData([defaultField]);
										setMaterialTypeName("");
									}}
								>
									<FiRotateCcw className="w-4 h-4" />
									Discard Changes
								</Button>
							</div>
						</div>

						{/* Sidebar */}
						<div className="space-y-8">
							<Card className="bg-card border-border shadow-sm animate-slide-up-delay-2">
								<CardHeader className="pb-4">
									<CardTitle className="text-foreground flex items-center justify-between text-[16px]">
										List of Registered Material Types
										<Badge
											variant="secondary"
											className="bg-muted text-foreground text-[11px]"
										>
											{registeredMaterialTypes.length}
										</Badge>
									</CardTitle>
									<p className="text-muted-foreground text-[12px]">
										These material types will be used during material
										registration
									</p>
								</CardHeader>
								<CardContent className="pt-0">
									<div className="space-y-2">
										{registeredMaterialTypes.map((item, index) => (
											<div
												key={index}
												className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/50 transition-colors duration-200 cursor-pointer"
											>
												<span className="text-foreground font-medium text-[12px]">
													{item.mt_name}
												</span>
												<span>
													<Button
														variant="ghost"
														size="sm"
														className="text-primary-custom hover:text-secondary-custom h-6 w-6 p-0"
														onClick={() => {
															setMt_id(item.mt_id);
															setMaterialTypeName(item.mt_name);
															setMaterialTypeData(item.mt_section);
														}}
														title="Edit material type"
													>
														<FiEdit className="w-3 h-3" />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
														onClick={() =>
															handleInactiveMaterial(item.mt_id, item.mt_name)
														}
														title="Delete material type"
													>
														<FiX className="w-3 h-3" />
													</Button>
												</span>
											</div>
										))}
									</div>
								</CardContent>
							</Card>

							<Card className="bg-card border-border shadow-sm animate-slide-up-delay-3">
								<CardHeader className="pb-4">
									<CardTitle className="text-foreground text-[16px]">
										Material Category Registration
									</CardTitle>
									<p className="text-muted-foreground text-[12px]">
										Register new categories for better material organization
									</p>
								</CardHeader>
								<CardContent className="pt-0">
									<div className="space-y-4">
										<div>
											<Label className="text-foreground font-medium text-[12px]">
												Category Name
											</Label>
											<div className="flex gap-2 mt-1">
												<Input
													value={newCategory.ca_name}
													onChange={(e) =>
														setNewCategory((prev) => ({
															...prev,
															ca_name: e.target.value,
														}))
													}
													placeholder="Enter category name"
													className="h-9 bg-background border-border text-foreground flex-1"
													style={{ fontSize: "12px" }}
												/>
												<Button
													onClick={() => handleCategory()}
													className="bg-primary-custom text-white hover:opacity-90 h-9 px-3 text-[12px]"
													disabled={newCategory.ca_name == ""}
												>
													<LoadingSpinner loading={btnCategory} />
													{!newCategory.ca_id ? "Add" : "Update"}
												</Button>
											</div>
										</div>

										<div className="space-y-2">
											<Label className="text-foreground font-medium text-[12px]">
												Existing Categories
											</Label>
											{categories.map((category, index) => (
												<div
													key={index}
													className="flex items-center justify-between p-2 bg-muted/50 rounded hover:bg-muted/50 transition-colors duration-200 cursor-pointer"
												>
													<span className="text-foreground text-[12px]">
														{category.ca_name}
													</span>
													<span>
														<Button
															variant="ghost"
															size="sm"
															className="text-primary-custom hover:text-secondary-custom h-6 w-6 p-0"
															onClick={() =>
																setNewCategory({
																	ca_id: category.ca_id,
																	ca_name: category.ca_name,
																})
															}
															title="Edit category"
														>
															<FiEdit className="w-3 h-3" />
														</Button>

														<Button
															variant="ghost"
															size="sm"
															className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
															onClick={() =>
																handleInactiveCategory(
																	category.ca_id,
																	category.ca_name
																)
															}
															title="Delete category"
														>
															<FiX className="w-3 h-3" />
														</Button>
													</span>
												</div>
											))}
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</main>

				<MaterialTypeModal
					isOpen={showMaterialTypeModal}
					onClose={() => {
						handleDiscard();
					}}
					materialTypeData={materialTypeData}
					setMaterialTypeData={setMaterialTypeData}
					materialField={materialField}
					setMaterialField={setMaterialField}
					actionType={actionType}
					type={type}
					mtField={mtField}
				/>
			</div>
		</ProtectedRoute>
	);
}
