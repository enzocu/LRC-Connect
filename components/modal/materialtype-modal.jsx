"use client";

import { useState } from "react";
import { Modal } from "./index";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MaterialTypeModal({
	isOpen,
	onClose,
	materialTypeData,
	setMaterialTypeData,
	materialField,
	setMaterialField,
	actionType,
	type,
	mtField,
}) {
	const [transferToOtherSection, setTransferToOtherSection] = useState(false);
	const [selectedSectionIndex, setSelectedSectionIndex] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();

		mtField(
			{
				mt_sectionTransferIndex: selectedSectionIndex,
				mt_sectionIndex: materialField.mt_sectionIndex,
				mt_fieldIndex: materialField.mt_fieldIndex,
				mt_section: materialField.mt_section,
				mt_marcTag: materialField.mt_marcTag,
				mt_title: materialField.mt_title,
				mt_type: materialField.mt_type || "Text",
			},
			setMaterialTypeData,
			(transferToOtherSection ? "Transfer" : actionType) + type
		);
		handleCancel();
	};

	const handleCancel = () => {
		onClose();
		setSelectedSectionIndex("");
		setTransferToOtherSection(false);
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleCancel}
			title="Material Type"
			size="md"
		>
			<form onSubmit={handleSubmit} className="p-6">
				<div className="mb-6">
					<>
						{type == "Section" ? (
							<div>
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
						) : (
							<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
								<div>
									<Label className="text-foreground font-medium text-[12px]">
										MARC Tag
									</Label>
									<Input
										value={materialField?.mt_marcTag ?? ""}
										onChange={(e) =>
											setMaterialField({
												...materialField,
												mt_marcTag: e.target.value,
											})
										}
										placeholder="e.g., 100, 245"
										className="mt-1 h-9 bg-background border-border text-foreground"
										style={{ fontSize: "12px" }}
									/>
								</div>{" "}
								<div>
									<Label className="text-foreground font-medium text-[12px]">
										Title
									</Label>
									<Input
										value={materialField?.mt_title ?? ""}
										onChange={(e) =>
											setMaterialField({
												...materialField,
												mt_title: e.target.value,
											})
										}
										placeholder="e.g., Author, Title"
										className="mt-1 h-9 bg-background border-border text-foreground"
										style={{ fontSize: "12px" }}
										disabled={
											materialField.mt_sectionIndex === 0 &&
											materialField.mt_fieldIndex < 12
										}
									/>
								</div>
								<div>
									<Label className="text-foreground font-medium text-[12px]">
										Type
									</Label>
									<select
										value={materialField?.mt_type ?? ""}
										onChange={(e) =>
											setMaterialField({
												...materialField,
												mt_type: e.target.value,
											})
										}
										className="mt-1 h-9 w-full bg-background border border-border text-foreground rounded-md px-2 text-[12px]"
										disabled={
											materialField.mt_sectionIndex === 0 &&
											materialField.mt_fieldIndex < 12
										}
									>
										<option value="Text">Text</option>
										<option value="Double">Double</option>
										<option value="Textarea">Textarea</option>
										<option value="Year">Year</option>
										<option value="Date">Date</option>
										<option value="Number">Number</option>
										<option value="Select">Select</option>
									</select>
								</div>
							</div>
						)}
					</>

					{materialTypeData[materialField.mt_sectionIndex]?.mt_fields.length >
						0 &&
						materialField.mt_sectionIndex !== 0 &&
						actionType != "Insert" && (
							<div className="flex items-center space-x-2 mb-4  mt-4">
								<Checkbox
									id="transfer-section"
									checked={transferToOtherSection}
									onCheckedChange={(checked) => {
										setTransferToOtherSection(checked);
										if (!checked) setSelectedSectionIndex("");
									}}
								/>
								<label
									htmlFor="transfer-section"
									className="text-foreground font-medium cursor-pointer text-[12px]"
								>
									Transfer to another section
								</label>
							</div>
						)}

					{transferToOtherSection && (
						<div>
							<label className="block text-foreground font-medium mb-2 text-[12px]">
								Select Section <span className="text-red-500">*</span>
							</label>
							<select
								value={selectedSectionIndex}
								onChange={(e) => setSelectedSectionIndex(e.target.value)}
								className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 text-[12px]"
								required={transferToOtherSection}
							>
								<option value="">Choose a section...</option>
								{materialTypeData.map((item, idx) => (
									<option key={idx} value={idx}>
										{item.mt_section}
									</option>
								))}
							</select>
							<p className="text-muted-foreground mt-1 text-[11px]">
								The account will be transferred to the selected section and
								maintain access there.
							</p>
						</div>
					)}
				</div>

				<div className="flex gap-3 justify-end pt-4 border-t border-border">
					<Button
						type="button"
						onClick={handleCancel}
						variant="outline"
						className="bg-transparent h-10 px-4 text-[12px]"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						className="h-10 bg-primary-custom hover:bg-secondary-custom text-[12px]"
					>
						{transferToOtherSection ? "Transfer" : actionType} {type}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
