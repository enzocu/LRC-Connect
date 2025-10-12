"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { LoadingSpinner } from "@/components/loading";
import { updateCourses } from "@/controller/firebase/update/updateCourses.js";
import { insertCourses } from "@/controller/firebase/insert/insertCourses";

export function AddEditCourseModal({
	isOpen,
	onClose,
	type,
	mode = "add",
	actionData = null,
	coursesData = null,
	Alert,
}) {
	const [btnLoading, setBtnLoading] = useState(false);
	const [name, setName] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (mode === "add") {
			await insertCourses(name, actionData, setBtnLoading, Alert);
		} else if (actionData.id && mode === "edit") {
			await updateCourses(name, actionData, coursesData, setBtnLoading, Alert);
		}

		setName("");
		onClose();
	};

	useEffect(() => {
		if (isOpen && mode === "edit" && actionData?.title) {
			setName(actionData.title);
		} else {
			setName("");
		}
	}, [isOpen, mode, actionData]);

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

	if (!isOpen || !["add", "edit"].includes(actionData?.mode)) return null;

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={getTitle()} size="sm">
			<form onSubmit={handleSubmit}>
				<div className="p-6  space-y-1">
					<Label className="font-medium text-foreground text-[12px]">
						Name
					</Label>
					<Input
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder={getPlaceholder()}
						className="h-9 bg-background border-border text-foreground"
						style={{ fontSize: "12px" }}
						autoFocus
					/>
				</div>

				<div className="flex items-center justify-end gap-3 px-6 py-4 bg-muted/30 border-t border-border">
					<Button
						type="button"
						onClick={onClose}
						variant="outline"
						className="bg-transparent h-10 px-4 text-[12px]"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={!name.trim()}
						className="bg-primary-custom hover:bg-secondary-custom text-white text-[12px] h-10 px-4"
					>
						<LoadingSpinner loading={btnLoading} />
						{mode === "add" ? "Add" : "Save"}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
