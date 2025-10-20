"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AddDonorModal({ isOpen, onClose }) {
	const [formData, setFormData] = useState({
		donorName: "",
		donorEmail: "",
		donorPhone: "",
		donorAddress: "",
		donorOrganization: "",
	});

	const handleInputChange = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		setFormData({
			donorName: "",
			donorEmail: "",
			donorPhone: "",
			donorAddress: "",
			donorOrganization: "",
		});

		onClose();
	};

	const handleClose = () => {
		setFormData({
			donorName: "",
			donorEmail: "",
			donorPhone: "",
			donorAddress: "",
			donorOrganization: "",
		});
		onClose();
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title="Add New Donor"
			size="md"
		>
			<form onSubmit={handleSubmit}>
				<div className="p-6 space-y-4">
					<div>
						<Label className="text-foreground font-medium text-[12px]">
							Donor Name <span className="text-red-500">*</span>
						</Label>
						<Input
							type="text"
							placeholder="Enter donor name"
							value={formData.donorName}
							onChange={(e) => handleInputChange("donorName", e.target.value)}
							className="mt-1 h-9 bg-background border-border text-foreground w-full"
							style={{ fontSize: "12px" }}
							required
						/>
					</div>

					<div>
						<Label className="text-foreground font-medium text-[12px]">
							Email Address
						</Label>
						<Input
							type="email"
							placeholder="Enter email address"
							value={formData.donorEmail}
							onChange={(e) => handleInputChange("donorEmail", e.target.value)}
							className="mt-1 h-9 bg-background border-border text-foreground w-full"
							style={{ fontSize: "12px" }}
						/>
					</div>

					<div>
						<Label className="text-foreground font-medium text-[12px]">
							Phone Number
						</Label>
						<Input
							type="tel"
							placeholder="Enter phone number"
							value={formData.donorPhone}
							onChange={(e) => handleInputChange("donorPhone", e.target.value)}
							className="mt-1 h-9 bg-background border-border text-foreground w-full"
							style={{ fontSize: "12px" }}
						/>
					</div>

					<div>
						<Label className="text-foreground font-medium text-[12px]">
							Organization (Optional)
						</Label>
						<Input
							type="text"
							placeholder="Enter organization name"
							value={formData.donorOrganization}
							onChange={(e) =>
								handleInputChange("donorOrganization", e.target.value)
							}
							className="mt-1 h-9 bg-background border-border text-foreground w-full"
							style={{ fontSize: "12px" }}
						/>
					</div>

					<div>
						<Label className="text-foreground font-medium text-[12px]">
							Address (Optional)
						</Label>
						<Textarea
							placeholder="Enter address"
							value={formData.donorAddress}
							onChange={(e) =>
								handleInputChange("donorAddress", e.target.value)
							}
							className="mt-1 h-20 bg-background border-border text-foreground w-full resize-none"
							style={{ fontSize: "12px" }}
						/>
					</div>
				</div>

				{/* Footer */}
				<div className="flex items-center justify-end gap-3 px-6 py-4 bg-muted/30 border-t border-border">
					<Button
						type="button"
						onClick={handleClose}
						variant="outline"
						className="bg-transparent h-10 px-4 text-[12px]"
					>
						Cancel
					</Button>
					<Button type="submit" className="h-10 text-[12px]">
						Add Donor
					</Button>
				</div>
			</form>
		</Modal>
	);
}
