"use client";

import { useState, useEffect } from "react";
import { FiX, FiEdit } from "react-icons/fi";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/loading";
import EmptyState from "@/components/tags/empty";

import { insertDonor } from "@/controller/firebase/insert/insertDonor";
import {
	updateDonorName,
	updateDonorStatus,
} from "@/controller/firebase/update/updateDonor";

export function AddDonorModal({
	isOpen,
	onClose,
	donors,
	userDetails,
	Alert,
	loading,
}) {
	const [newDonor, setNewDonor] = useState("");
	const [btnLoading, setBtnloading] = useState(false);
	const [editingDonorId, setEditingDonorId] = useState(null);

	const resetForm = () => {
		setNewDonor("");
		setEditingDonorId(null);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!userDetails?.us_liID || !userDetails?.uid) return;

		if (editingDonorId) {
			await updateDonorName(
				editingDonorId,
				userDetails.us_liID,
				userDetails.uid,
				newDonor,
				setBtnloading,
				Alert
			);
		} else {
			await insertDonor(
				userDetails.us_liID,
				userDetails.uid,
				newDonor,
				setBtnloading,
				Alert
			);
		}

		resetForm();
	};

	const handleEdit = (donor) => {
		setEditingDonorId(donor.do_id);
		setNewDonor(donor.do_name);
	};

	const handleDeactivateDonor = (do_id, do_name) => {
		if (!userDetails?.us_liID || !userDetails?.uid) return;

		updateDonorStatus(
			do_id,
			userDetails.us_liID,
			userDetails.uid,
			do_name,
			"Inactive",
			setBtnloading,
			Alert
		);
		resetForm();
	};

	if (!isOpen) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Register New Donor"
			size="sm"
		>
			<form onSubmit={handleSubmit} className="p-6 space-y-4">
				<div>
					<Label className="text-foreground font-medium text-[12px]">
						Donor Name
					</Label>
					<Input
						value={newDonor}
						onChange={(e) => setNewDonor(e.target.value)}
						placeholder="Enter donor name"
						className="mt-1 h-9 bg-background border-border text-foreground"
						style={{ fontSize: "12px" }}
						required
						autoFocus
					/>
				</div>

				<div className="space-y-2">
					<Label className="text-foreground font-medium text-[12px]">
						Registered Donors
					</Label>
					{donors?.length > 0 &&
						donors?.map((item, index) => (
							<div
								key={index}
								className="flex items-center justify-between p-2 bg-muted/30 rounded hover:bg-muted/50 transition-colors duration-200"
							>
								<span className="text-foreground text-[12px]">
									{item.do_name}
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
											handleDeactivateDonor(item.do_id, item.do_name)
										}
									>
										<FiX className="w-3 h-3" />
									</Button>
								</span>
							</div>
						))}

					<EmptyState data={donors} loading={loading} />
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
						disabled={!newDonor.trim()}
						className="bg-primary-custom text-white hover:opacity-90 h-10 px-4 disabled:opacity-50 disabled:cursor-not-allowed text-[12px]"
					>
						<LoadingSpinner loading={btnLoading} />
						{editingDonorId ? "Update" : "Add Donor"}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
