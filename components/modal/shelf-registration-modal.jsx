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

import { insertShelf } from "@/controller/firebase/insert/insertShelf";
import {
	updateShelfName,
	updateShelfStatus,
} from "@/controller/firebase/update/updateShelfName";

export function ShelfRegistrationModal({ isOpen, onClose, shelves }) {
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const [newShelf, setNewShelf] = useState("");
	const [btnLoading, setBtnloading] = useState(false);
	const [editingShelfId, setEditingShelfId] = useState(null);

	useEffect(() => {
		if (!isOpen) {
			resetForm();
		}
	}, [isOpen]);

	const resetForm = () => {
		setNewShelf("");
		setEditingShelfId(null);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!userDetails || !userDetails?.us_liID || !userDetails?.uid) return;

		if (editingShelfId) {
			await updateShelfName(
				editingShelfId,
				userDetails?.us_liID,
				userDetails?.uid,
				newShelf,
				setBtnloading,
				Alert
			);
		} else {
			await insertShelf(
				userDetails?.us_liID,
				userDetails?.uid,
				newShelf,
				setBtnloading,
				Alert
			);
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

	const handleEdit = (shelf) => {
		setEditingShelfId(shelf.sh_id);
		setNewShelf(shelf.sh_name);
	};

	const handleDeactivateShelf = (sh_id, sh_name) => {
		if (!userDetails || !userDetails?.us_liID || !userDetails?.uid) return;

		updateShelfStatus(
			sh_id,
			userDetails?.us_liID,
			userDetails?.uid,
			sh_name,
			"Inactive",
			setBtnloading,
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
			title="Register New Shelf"
			size="sm"
		>
			<form onSubmit={handleSubmit} className="p-6 space-y-4">
				<div>
					<Label className="text-foreground font-medium text-[12px]">
						Shelf Name/Code
					</Label>
					<Input
						value={newShelf}
						onChange={(e) => setNewShelf(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Enter shelf name or code"
						className="mt-1 h-9 bg-background border-border text-foreground"
						style={{ fontSize: "12px" }}
						autoFocus
					/>
				</div>

				<div className="space-y-2">
					<Label className="text-foreground font-medium text-[12px]">
						Existing Shelves
					</Label>
					{shelves.map((item, index) => (
						<div
							key={index}
							className="flex items-center justify-between p-2 bg-muted/30 rounded hover:bg-muted/50 transition-colors duration-200"
						>
							<span className="text-foreground text-[12px]">
								{item.sh_name}
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
									onClick={() =>
										handleDeactivateShelf(item.sh_id, item.sh_name)
									}
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
						disabled={!newShelf.trim()}
						className="bg-primary-custom text-white hover:opacity-90 h-10 px-4 disabled:opacity-50 disabled:cursor-not-allowed text-[12px]"
					>
						<LoadingSpinner loading={btnLoading} />
						{editingShelfId ? "Update" : "Add Shelf"}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
