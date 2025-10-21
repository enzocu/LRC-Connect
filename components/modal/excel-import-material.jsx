"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import EmptyState from "@/components/tags/empty";
import { FiUpload, FiFileText, FiRefreshCw } from "react-icons/fi";

import { processExcelMaterialFile } from "@/controller/custom/processExcelFile";
import { useLoading } from "@/contexts/LoadingProvider";

import { getMaterialtypelistRealtime } from "@/controller/firebase/get/getMaterialtypelist";
import { getCategoryListRealtime } from "@/controller/firebase/get/getCategoryListRealtime";
import { getShelfListRealtime } from "@/controller/firebase/get/getShelfRealtime";
import { getDonorListRealtime } from "@/controller/firebase/get/getDonorListRealtime";
import { insertMaterialExcel } from "@/controller/firebase/insert/insertMaterialExcel";

export function ExcelImportModal({
	isOpen,
	onClose,
	li_id,
	modifiedBy,
	Alert,
}) {
	const pathname = usePathname();
	const { setLoading, setPath } = useLoading();
	const [step, setStep] = useState("upload");
	const [selectedFile, setSelectedFile] = useState(null);
	const [btnLoading, setBtnloading] = useState(false);
	const [materialData, setMaterialData] = useState([]);
	const [selectedMaterials, setSelectedMaterials] = useState([]);

	// dropdown states
	const [materialType, setMaterialType] = useState("");
	const [category, setCategory] = useState("");
	const [shelf, setShelf] = useState("");
	const [acquisitionType, setAcquisitionType] = useState("Donated");
	const [donor, setDonor] = useState("");
	const [pricePerItem, setPricePerItem] = useState(0);

	const [materialTypes, setMaterialTypes] = useState([]);
	const [categories, setCategories] = useState([]);
	const [shelves, setShelves] = useState([]);
	const [donors, setDonors] = useState([]);

	const handleFileSelect = (event) => {
		const file = event.target.files?.[0];
		if (file) setSelectedFile(file);
	};

	// Required Excel headers for material
	const excelHeader = [
		"Title",
		"Author",
		"Place of Publication",
		"Publisher",
		"Copyright",
		"Pages",
		"Size",
		"Language",
		"Description",
		"Subject 1",
		"Subject 2",
		"Accession No.",
		"Call No.",
		"ISBN",
		"Copies",
		"Remarks",
	];

	const handleImport = async () => {
		if (li_id && materialType && category && shelf) {
			await insertMaterialExcel(
				li_id,
				modifiedBy,
				selectedMaterials,
				materialType,
				category,
				shelf,
				acquisitionType,
				donor,
				pricePerItem,
				setBtnloading,
				Alert
			);
			handleClose();
		}
	};

	const handleProcessFile = async () => {
		if (!selectedFile) return;
		processExcelMaterialFile(
			selectedFile,
			excelHeader,
			setMaterialData,
			setSelectedMaterials,
			setStep,
			setBtnloading,
			Alert
		);
	};

	// Toggle based on Call No.
	const handleMaterialToggle = (callNo) => {
		setSelectedMaterials((prev) => {
			const isSelected = prev.some((mat) => mat.mt_callNo === callNo);
			if (isSelected) {
				return prev.filter((mat) => mat.mt_callNo !== callNo);
			} else {
				const material = materialData.find((m) => m.mt_callNo === callNo);
				return material ? [...prev, material] : prev;
			}
		});
	};

	const handleClose = () => {
		setStep("upload");
		setSelectedFile(null);
		setSelectedMaterials([]);
		setBtnloading(false);
		setMaterialData([]);
		setMaterialType("");
		setCategory("");
		setShelf("");
		onClose();
	};

	const isAllSelected =
		materialData.length > 0 &&
		materialData.every((mat) =>
			selectedMaterials.some((sel) => sel.mt_callNo === mat.mt_callNo)
		);

	const toggleSelectAll = (checked) => {
		if (checked) {
			setSelectedMaterials(materialData);
		} else {
			setSelectedMaterials([]);
		}
	};

	useEffect(() => {
		setPath(pathname);

		const unsubscribers = [];

		if (open && li_id) {
			const unsubscribeMaterialTypes = getMaterialtypelistRealtime(
				li_id,
				setMaterialTypes,
				setLoading,
				Alert
			);
			unsubscribers.push(unsubscribeMaterialTypes);

			const unsubscribeCategory = getCategoryListRealtime(
				li_id,
				setCategories,
				setLoading,
				Alert
			);
			unsubscribers.push(unsubscribeCategory);

			const unsubscribeShelf = getShelfListRealtime(
				li_id,
				setShelves,
				setLoading,
				Alert
			);
			unsubscribers.push(unsubscribeShelf);

			const unsubscribeDonor = getDonorListRealtime(
				li_id,
				setDonors,
				setLoading,
				Alert
			);

			unsubscribers.push(unsubscribeDonor);
		}

		return () => {
			unsubscribers.forEach((unsub) => unsub && unsub());
		};
	}, [open]);

	const allHeaders = materialData.length ? Object.keys(materialData[0]) : [];

	if (!isOpen) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title="Import Material from Excel"
			size="xxl"
		>
			<div className="p-6">
				{step === "upload" && (
					<div className="space-y-6">
						{/* Dropdowns */}
						<div className="text-center">
							<div className="mx-auto w-16 h-16 bg-primary-custom/10 rounded-full flex items-center justify-center mb-4">
								<FiFileText className="w-8 h-8 text-primary-custom" />
							</div>
							<h3 className="font-semibold text-foreground mb-2 text-[16px]">
								Upload Excel File
							</h3>
							<p className="text-muted-foreground text-[12px]">
								Select an Excel file (.xlsx, .xls) containing material
								information
							</p>
							<p className="text-muted-foreground text-[11px]">
								Excel files only (Max 10MB)
							</p>

							<div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-left pt-10">
								<div>
									<label className="block text-foreground font-medium mb-2 text-[12px]">
										Material Type <span className="text-red-500">*</span>
									</label>
									<select
										className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9"
										style={{ fontSize: "12px" }}
										value={materialType}
										onChange={(e) => setMaterialType(e.target.value)}
									>
										<option value="">Select Type</option>
										{materialTypes.map((type) => (
											<option key={type.mt_id} value={type.mt_id}>
												{type.mt_name}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-foreground font-medium mb-2 text-[12px]">
										Category <span className="text-red-500">*</span>
									</label>
									<select
										className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9"
										style={{ fontSize: "12px" }}
										value={category}
										onChange={(e) => setCategory(e.target.value)}
									>
										<option value="">Select Category</option>
										{categories.map((category, index) => (
											<option key={index} value={category.ca_id}>
												{category.ca_name}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-foreground font-medium mb-2 text-[12px]">
										Shelf <span className="text-red-500">*</span>
									</label>
									<select
										className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9"
										style={{ fontSize: "12px" }}
										value={shelf}
										onChange={(e) => setShelf(e.target.value)}
									>
										<option value="">Select Shelf</option>
										{shelves.map((shelf, index) => (
											<option key={index} value={shelf.sh_id}>
												{shelf.sh_name}
											</option>
										))}
									</select>
								</div>

								<div>
									<label className="block text-foreground font-medium mb-2 text-[12px]">
										Type <span className="text-red-500">*</span>
									</label>
									<select
										className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9"
										style={{ fontSize: "12px" }}
										value={acquisitionType}
										onChange={(e) => setAcquisitionType(e.target.value)}
									>
										{["Donated", "Purchased"].map((type, index) => (
											<option key={index} value={type}>
												{type}
											</option>
										))}
									</select>
								</div>

								{acquisitionType === "Donated" ? (
									<div>
										<label className="block text-foreground font-medium mb-2 text-[12px]">
											Donor <span className="text-red-500">*</span>
										</label>
										<select
											className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9"
											style={{ fontSize: "12px" }}
											value={donor}
											onChange={(e) => setDonor(e.target.value)}
										>
											<option value="">Select Donor</option>
											{donors.map((donor, index) => (
												<option key={index} value={donor.do_id}>
													{donor.do_name}
												</option>
											))}
										</select>
									</div>
								) : (
									<div>
										<label className="block text-foreground font-medium mb-2 text-[12px]">
											Price per Item <span className="text-red-500">*</span>
										</label>
										<Input
											type="number"
											placeholder="e.g., 25.99"
											value={pricePerItem}
											onChange={(e) => setPricePerItem(e.target.value)}
											className="h-9 bg-background border-border text-foreground w-full"
											style={{ fontSize: "12px" }}
											step="0.01"
											min="0"
										/>
									</div>
								)}
							</div>
							<Input
								type="file"
								accept=".xlsx,.xls"
								onChange={handleFileSelect}
								className="mt-4 cursor-pointer"
								style={{ fontSize: "12px" }}
							/>
						</div>

						{selectedFile && (
							<div className="bg-card border border-border rounded-lg p-4">
								<div className="flex items-center gap-3">
									<FiFileText className="w-5 h-5 text-primary-custom" />
									<div className="flex-1">
										<p className="font-medium text-foreground text-[12px]">
											{selectedFile.name}
										</p>
										<p className="text-muted-foreground text-[11px]">
											{(selectedFile.size / 1024 / 1024).toFixed(2)} MB
										</p>
									</div>
								</div>
							</div>
						)}

						<div className="flex gap-3 justify-end">
							<Button
								onClick={handleClose}
								variant="outline"
								className="h-10 w-fit text-[12px]"
							>
								Cancel
							</Button>
							<Button
								onClick={handleProcessFile}
								disabled={
									!selectedFile ||
									btnLoading ||
									materialType == "" ||
									category == "" ||
									shelf == "" ||
									(donor == "" && pricePerItem == 0)
								}
								className="bg-primary-custom hover:bg-secondary-custom text-white h-10 w-fit text-[12px]"
							>
								{btnLoading ? (
									<>
										<FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
										Processing...
									</>
								) : (
									<>
										<FiUpload className="w-4 h-4 mr-2" />
										Process File
									</>
								)}
							</Button>
						</div>
					</div>
				)}

				{step === "preview" && (
					<div className="space-y-6">
						{materialData.length === 0 ? (
							<EmptyState data={materialData} loading={btnLoading} />
						) : (
							<>
								<span className="text-foreground font-medium text-[12px]">
									{selectedMaterials.length} of {materialData.length} valid
									materials selected
								</span>

								<div className="border border-border rounded-lg max-h-96 overflow-auto">
									<table className="w-full table-auto">
										<thead>
											<tr className="border-b border-border bg-muted/50">
												<th className="py-3 px-4">
													<Checkbox
														checked={isAllSelected}
														onCheckedChange={toggleSelectAll}
													/>
												</th>
												{excelHeader.map((header) => (
													<th
														key={header}
														className="text-left py-4 px-6 font-semibold text-[12px] text-foreground"
													>
														{header}
													</th>
												))}
											</tr>
										</thead>
										<tbody>
											{materialData.map((mat, index) => {
												const isChecked = selectedMaterials.some(
													(sel) => sel.mt_callNo === mat.mt_callNo
												);
												return (
													<tr
														key={index}
														className={`border-b border-border transition-colors ${
															index % 2 === 0 ? "bg-background" : "bg-muted/20"
														}`}
													>
														<td className="py-3 px-4 text-left align-top">
															<Checkbox
																checked={isChecked}
																onCheckedChange={() =>
																	handleMaterialToggle(mat.mt_callNo)
																}
															/>
														</td>
														{allHeaders.map((key) => (
															<td
																key={key}
																className="py-4 px-6 text-[12px] min-w-[150px] text-left align-top"
															>
																{mat[key]}
															</td>
														))}
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>

								<div className="flex justify-end gap-3">
									<Button
										variant="outline"
										className="bg-transparent h-10 px-4 text-[12px]"
										onClick={() => setStep("upload")}
									>
										Back
									</Button>
									<Button
										className="bg-primary-custom hover:bg-secondary-custom text-white h-10 w-fit text-[12px]"
										onClick={handleImport}
										disabled={selectedMaterials.length === 0}
									>
										{btnLoading ? (
											<>
												<FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
												Processing import...
											</>
										) : (
											<>
												<FiUpload className="w-4 h-4 mr-2" />
												Upload and Register
											</>
										)}
									</Button>
								</div>
							</>
						)}
					</div>
				)}
			</div>
		</Modal>
	);
}
