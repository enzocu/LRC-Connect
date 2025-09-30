"use client";

import { useState, useEffect } from "react";
import { FiX, FiEdit } from "react-icons/fi";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import { LoadingSpinner } from "@/components/loading";

import {
	insertProgram,
	insertSchool,
} from "@/controller/firebase/insert/insertAcademic";
import {
	updateDocumentName,
	updateDocumentStatus,
} from "@/controller/firebase/update/updateAcademic";

export function ProgramSchoolModal({ isOpen, onClose, li_id, records, type }) {
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const [newName, setNewName] = useState("");
	const [btnLoading, setBtnLoading] = useState(false);
	const [editingId, setEditingId] = useState(null);

	useEffect(() => {
		if (!isOpen) resetForm();
	}, [isOpen]);

	const resetForm = () => {
		setNewName("");
		setEditingId(null);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!li_id | !userDetails?.uid) return;

		if (editingId) {
			await updateDocumentName(
				editingId,
				li_id,
				userDetails.uid,
				type,
				type === "program" ? "pr_" : "sc_",
				newName,
				setBtnLoading,
				Alert
			);
		} else {
			if (type === "program") {
				await insertProgram(
					li_id,
					userDetails?.uid,
					newName,
					setBtnLoading,
					Alert
				);
			} else {
				await insertSchool(
					li_id,
					userDetails?.uid,
					newName,
					setBtnLoading,
					Alert
				);
			}
		}

		resetForm();
		onClose();
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	const handleEdit = (record) => {
		setEditingId(record.id);
		setNewName(type === "program" ? record.pr_name : record.sc_name);
	};

	const handleDeactivate = (record) => {
		if (!li_id || !userDetails?.uid) return;

		updateDocumentStatus(
			record.id,
			li_id,
			userDetails.uid,
			type,
			type === "program" ? "pr_" : "sc_",
			"Inactive",
			setBtnLoading,
			Alert
		);
		resetForm();
		onClose();
	};

	if (!isOpen) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={editingId ? `Update ${type}` : `Add New ${type}`}
			size="sm"
		>
			<form onSubmit={handleSubmit} className="p-6 space-y-4">
				<div>
					<Label className="text-foreground font-medium text-[12px]">
						{type === "program" ? "Program Name" : "School Name"}
					</Label>
					<Input
						value={newName}
						onChange={(e) => setNewName(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={`Enter ${type} name`}
						className="mt-1 h-9 bg-background border-border text-foreground"
						style={{ fontSize: "12px" }}
						autoFocus
					/>
				</div>

				<div className="space-y-2">
					<Label className="text-foreground font-medium text-[12px]">
						Existing {type === "program" ? "Programs" : "Schools"}
					</Label>
					{records.map((item, index) => (
						<div
							key={index}
							className="flex items-center justify-between p-2 bg-muted/30 rounded hover:bg-muted/50 transition-colors duration-200"
						>
							<span className="text-foreground text-[12px]">
								{type === "program" ? item.pr_name : item.sc_name}
							</span>
							<span>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="text-primary-custom hover:text-secondary-custom h-6 w-6 p-0"
									onClick={() => handleEdit(item)}
								>
									<FiEdit className="w-3 h-3" />
								</Button>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
									onClick={() => handleDeactivate(item)}
								>
									<FiX className="w-3 h-3" />
								</Button>
							</span>
						</div>
					))}
				</div>

				<div className="flex gap-3 justify-end pt-2">
					<Button
						type="button"
						onClick={() => {
							resetForm();
							onClose();
						}}
						variant="outline"
						className="bg-transparent h-10 px-4 text-[12px]"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={!newName.trim()}
						className="bg-primary-custom text-white hover:opacity-90 h-10 px-4 disabled:opacity-50 disabled:cursor-not-allowed text-[12px]"
					>
						<LoadingSpinner loading={btnLoading} />
						{editingId ? "Update" : `Add ${type}`}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
