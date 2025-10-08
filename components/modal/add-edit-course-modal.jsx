"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddEditCourseModal({
	isOpen,
	onClose,
	onSave,
	type,
	mode = "add",
	initialData = null,
}) {
	const [formData, setFormData] = useState({
		name: "",
	});

	useEffect(() => {
		if (isOpen && mode === "edit" && initialData) {
			setFormData({ name: initialData.name });
		} else if (!isOpen) {
			setFormData({ name: "" });
		}
	}, [isOpen, mode, initialData]);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (formData.name.trim()) {
			onSave(formData);
			setFormData({ name: "" });
			onClose();
		}
	};

	const getTitle = () => {
		if (type === "track") return mode === "add" ? "Add Track" : "Edit Track";
		if (type === "strand") return mode === "add" ? "Add Strand" : "Edit Strand";
		if (type === "institute")
			return mode === "add" ? "Add Institute" : "Edit Institute";
		if (type === "program")
			return mode === "add" ? "Add Program" : "Edit Program";
		return "Add/Edit";
	};

	const getPlaceholder = () => {
		if (type === "track") return "Enter track name";
		if (type === "strand") return "Enter strand name";
		if (type === "institute") return "Enter institute name";
		if (type === "program") return "Enter program name";
		return "Enter name";
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={getTitle()} size="sm">
			<form onSubmit={handleSubmit} className="p-6 space-y-4">
				<div>
					<Label
						className="text-foreground font-medium"
						style={{ fontSize: "11px" }}
					>
						Name
					</Label>
					<Input
						value={formData.name}
						onChange={(e) => setFormData({ name: e.target.value })}
						placeholder={getPlaceholder()}
						className="mt-1 h-9 bg-background border-border text-foreground"
						style={{ fontSize: "11px" }}
						autoFocus
					/>
				</div>

				<div className="flex gap-3 justify-end pt-2">
					<Button
						type="button"
						onClick={onClose}
						variant="outline"
						className="h-9 px-4 border-border text-foreground hover:bg-accent bg-transparent"
						style={{ fontSize: "11px" }}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={!formData.name.trim()}
						className="bg-primary-custom text-white hover:opacity-90 h-9 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
						style={{ fontSize: "11px" }}
					>
						{mode === "add" ? "Add" : "Save"}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
