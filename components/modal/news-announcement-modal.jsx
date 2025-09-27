"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FiImage, FiX } from "react-icons/fi";

import { handleChange } from "@/controller/custom/customFunction";
import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import { LoadingSpinner } from "@/components/loading";

import { insertNewsAnnouncement } from "../../controller/firebase/insert/insertNewsAnnouncement";
import { updateNewsAnnouncement } from "../../controller/firebase/update/updateNewsAnnouncement";
import { isEmptyObject } from "../../controller/custom/customFunction";

const defaultValues = {
	na_title: "",
	na_content: "",
	na_category: "",
	na_visibility: "General",
	na_urgent: false,
	na_photoURL: null,
	na_liID: null,
};

export function AddNewsAnnouncementModal({
	isOpen,
	onClose,
	entryType,
	selectedNewsAnnouncements,
}) {
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const [btnLoading, setBtnLoading] = useState(false);
	const [formData, setFormData] = useState(defaultValues);

	const isEmpty = isEmptyObject(selectedNewsAnnouncements);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!userDetails?.uid) return;

		if (!formData.na_title.trim() || !formData.na_content.trim()) {
			Alert.showWarning("Title and content are required.");
			return;
		}

		if (!formData.na_category) {
			Alert.showWarning("Please select a category.");
			return;
		}

		if (isEmpty) {
			await insertNewsAnnouncement(
				userDetails?.us_liID,
				userDetails?.uid,
				entryType,
				formData,
				setBtnLoading,
				Alert
			);
		} else {
			await updateNewsAnnouncement(
				selectedNewsAnnouncements.id,
				userDetails?.us_liID,
				formData,
				userDetails?.uid,
				setBtnLoading,
				Alert
			);
		}

		setFormData(defaultValues);
		onClose();
	};

	const removeImage = () => {
		setFormData((prev) => ({
			...prev,
			na_photoURL: null,
		}));
	};

	useEffect(() => {
		setFormData({
			na_title: selectedNewsAnnouncements?.na_title || "",
			na_content: selectedNewsAnnouncements?.na_content || "",
			na_category: selectedNewsAnnouncements?.na_category || "",
			na_visibility: selectedNewsAnnouncements?.na_visibility || "General",
			na_urgent: selectedNewsAnnouncements?.na_urgent || false,
			na_photoURL: selectedNewsAnnouncements?.na_photoURL || null,
			na_liID: selectedNewsAnnouncements?.na_liID || null,
		});
	}, [isOpen, selectedNewsAnnouncements]);

	if (!isOpen) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={`${!isEmpty ? "Edit" : "Add"} ${entryType}`}
			size="lg"
		>
			<form onSubmit={handleSubmit}>
				<div className="flex-1 overflow-y-auto p-6 space-y-4">
					<p className="text-muted-foreground mb-4 text-[12px]">
						Fill in the details for the {!isEmpty ? "selected" : "new"}{" "}
						{entryType}.
					</p>

					{/* Title */}
					<div className="space-y-1">
						<Label
							htmlFor="title"
							className="text-[12px] font-medium text-foreground"
						>
							Title
						</Label>
						<Input
							id="title"
							name="na_title"
							value={formData.na_title}
							onChange={(e) => handleChange(e, setFormData)}
							className="h-9 bg-background border-border text-foreground"
							style={{ fontSize: "12px" }}
							required
						/>
					</div>

					{/* Content */}
					<div className="space-y-1">
						<Label
							htmlFor="content"
							className="text-[12px] font-medium text-foreground"
						>
							Content
						</Label>
						<Textarea
							id="content"
							name="na_content"
							value={formData.na_content}
							onChange={(e) => handleChange(e, setFormData)}
							className="h-24 bg-background border-border text-foreground"
							style={{ fontSize: "12px" }}
							required
						/>
					</div>

					{/* Category */}
					<div className="space-y-1">
						<Label
							htmlFor="category"
							className="text-[12px] font-medium text-foreground"
						>
							Category
						</Label>
						<Select
							value={formData.na_category}
							onValueChange={(val) =>
								handleChange(
									{ target: { name: "na_category", value: val } },
									setFormData
								)
							}
							required
						>
							<SelectTrigger className="h-9 bg-background border-border text-foreground text-[12px]">
								<SelectValue placeholder="Select category" />
							</SelectTrigger>
							<SelectContent>
								{[
									"General",
									"Event",
									"Maintenance",
									"Policy Update",
									"Holiday",
								].map((item) => (
									<SelectItem key={item} value={item}>
										{item}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Visibility */}
					<div className="space-y-1">
						<Label className="text-[12px] font-medium text-foreground">
							Visibility
						</Label>
						<RadioGroup
							value={formData.na_visibility}
							onValueChange={(val) =>
								handleChange(
									{ target: { name: "na_visibility", value: val } },
									setFormData
								)
							}
							className="flex gap-4"
							required
						>
							{["General", "Patron", "Personnel"].map((value, i) => (
								<div key={value} className="flex items-center gap-2">
									<RadioGroupItem value={value} id={`r${i}`} />
									<Label htmlFor={`r${i}`} style={{ fontSize: "12px" }}>
										{value}
									</Label>
								</div>
							))}
						</RadioGroup>
					</div>

					{/* Image Upload */}
					<div className="space-y-1">
						<Label
							htmlFor="image-upload"
							className="text-[12px] font-medium text-foreground"
						>
							Featured Image
						</Label>
						<label
							htmlFor="image-upload"
							className="block w-full cursor-pointer"
						>
							{formData.na_photoURL ? (
								<div className="relative border-2 border-dashed border-border rounded-lg p-4 bg-muted/30">
									<img
										src={
											formData.na_photoURL instanceof File
												? URL.createObjectURL(formData.na_photoURL)
												: formData.na_photoURL
										}
										alt="Preview"
										className="w-full h-64 object-cover rounded-lg"
									/>
									<Button
										type="button"
										variant="destructive"
										size="sm"
										onClick={removeImage}
										className="absolute top-2 right-2 h-7 w-7 p-0"
									>
										<FiX className="w-4 h-4" />
									</Button>
									<p className="text-center text-muted-foreground mt-2 text-[10px]">
										{formData.na_photoURL.name ?? "Uploaded image"}
									</p>
								</div>
							) : (
								<div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/30 hover:bg-muted/50 transition-colors h-64 flex flex-col items-center justify-center">
									<FiImage className="w-8 h-8 text-muted-foreground mb-2" />
									<p className="text-muted-foreground text-[12px]">
										Click or drag to upload image
									</p>
									<p className="text-muted-foreground text-[11px]">
										JPG, PNG, SVG. Max: 2MB
									</p>
								</div>
							)}
						</label>
						<input
							id="image-upload"
							type="file"
							accept="image/*"
							name="na_photoURL"
							onChange={(e) => handleChange(e, setFormData)}
							className="hidden"
						/>
					</div>

					{/* Urgent Checkbox */}
					{entryType === "Announcements" && (
						<div className="flex items-center gap-2">
							<Checkbox
								id="urgent"
								name="na_urgent"
								checked={formData.na_urgent}
								onCheckedChange={(val) =>
									handleChange(
										{ target: { name: "na_urgent", value: val } },
										setFormData
									)
								}
							/>
							<Label htmlFor="urgent" className="text-[12px]">
								Mark as Urgent
							</Label>
						</div>
					)}
				</div>

				<div className="flex items-center justify-end gap-3 px-6 py-4 bg-muted/30 border-t border-border">
					<Button
						type="button"
						onClick={() => onClose()}
						variant="outline"
						className="bg-transparent h-10 px-4 text-[12px]"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						className="bg-primary-custom hover:bg-secondary-custom text-white text-[11px] h-10 px-4 text-[12px]"
						disabled={btnLoading || formData.na_photoURL == null}
					>
						<LoadingSpinner loading={btnLoading} />
						{!isEmpty ? "Update" : `Add ${entryType}`}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
