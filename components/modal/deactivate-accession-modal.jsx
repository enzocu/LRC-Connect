"use client";

import { useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const ACCESSION_DEACTIVATION_REASONS = [
	"Accession is damaged beyond repair",
	"Accession is lost or missing",
	"Accession is being replaced",
	"Accession contains errors or defects",
	"Accession is outdated or obsolete",
	"Accession is being transferred",
	"Accession violates library policies",
];

const ACCESSION_ACTIVATION_REASONS = [
	"Accession has been repaired",
	"Accession has been recovered",
	"Accession replacement completed",
	"Errors or defects have been corrected",
	"Accession has been updated",
	"Accession transfer completed",
	"Policy violation has been resolved",
];

export function DeactivateAccessionModal({
	isOpen,
	onClose,
	accessionToDeactivate,
	holdings,
	setHoldings,
	handleHoldings,
}) {
	const [selectedReasons, setSelectedReasons] = useState([]);
	const [customReason, setCustomReason] = useState("");

	const handleSubmit = async () => {
		const allReasons = [
			...selectedReasons,
			...(customReason.trim() ? [`Custom: ${customReason.trim()}`] : []),
		];

		await handleHoldings(
			{
				ho_index: accessionToDeactivate.ho_index,
				ho_action: "Status",
				ho_status:
					accessionToDeactivate.ho_status === "Active" ? "Inactive" : "Active",
				ho_reason: allReasons.join("; "),
			},
			null,
			holdings,
			setHoldings
		);

		onClose();
	};

	const handleClose = () => {
		setSelectedReasons([]);
		setCustomReason("");
		onClose();
	};

	const isDeactivating = accessionToDeactivate?.ho_status === "Active";
	const reasons = isDeactivating
		? ACCESSION_DEACTIVATION_REASONS
		: ACCESSION_ACTIVATION_REASONS;
	const modalTitle = isDeactivating
		? "Deactivate Accession"
		: "Activate Accession";
	const warningTitle = isDeactivating
		? "Warning: This action will mark the accession as inactive"
		: "Notice: This action will mark the accession as active";
	const warningMessage = isDeactivating
		? "The accession will no longer be available for circulation. This action can be reversed by an administrator."
		: "The accession will be available for circulation again. This action can be reversed by an administrator.";
	const reasonLabel = isDeactivating
		? "Select deactivation reason(s):"
		: "Select activation reason(s):";
	const customReasonPlaceholder = isDeactivating
		? "Enter a custom reason for deactivation..."
		: "Enter a custom reason for activation...";
	const buttonText = isDeactivating
		? "Confirm Deactivation"
		: "Confirm Activation";
	const warningColor = isDeactivating ? "red" : "blue";

	const warningBgColor =
		warningColor === "red"
			? "bg-red-50 dark:bg-red-900/20"
			: "bg-blue-50 dark:bg-blue-900/20";
	const warningBorderColor =
		warningColor === "red"
			? "border-red-200 dark:border-red-800"
			: "border-blue-200 dark:border-blue-800";
	const warningTextColor =
		warningColor === "red"
			? "text-red-800 dark:text-red-300"
			: "text-blue-800 dark:text-blue-300";
	const warningSubTextColor =
		warningColor === "red"
			? "text-red-700 dark:text-red-400"
			: "text-blue-700 dark:text-blue-400";
	const warningIconColor =
		warningColor === "red" ? "text-red-500" : "text-blue-500";
	const buttonVariant = isDeactivating ? "destructive" : "default";

	const handleReasonToggle = (reason) => {
		setSelectedReasons((prev) =>
			prev.includes(reason)
				? prev.filter((r) => r !== reason)
				: [...prev, reason]
		);
	};

	return (
		<Modal isOpen={isOpen} onClose={handleClose} title={modalTitle} size="md">
			<div className="p-6 space-y-6">
				<div
					className={`flex items-start space-x-3 p-4 ${warningBgColor} border ${warningBorderColor} rounded-md`}
				>
					<FiAlertTriangle
						className={`w-5 h-5 ${warningIconColor} flex-shrink-0 mt-0.5`}
					/>
					<div>
						<p
							className={`${warningTextColor} font-medium mb-1`}
							style={{ fontSize: "11px" }}
						>
							{warningTitle}
						</p>
						<p className={warningSubTextColor} style={{ fontSize: "11px" }}>
							{warningMessage}
						</p>
					</div>
				</div>

				{accessionToDeactivate?.ho_access && (
					<div className="p-3 bg-muted/30 border border-border rounded-md">
						<p className="text-foreground font-medium text-[12px]">
							Accession Number: {accessionToDeactivate?.ho_access}
						</p>
					</div>
				)}

				<div className="space-y-4">
					<div>
						<h3 className="font-normal text-foreground mb-3 text-[12px]">
							{reasonLabel}
						</h3>
						<div className="space-y-3">
							{reasons.map((reason) => (
								<div key={reason} className="flex items-center space-x-2">
									<Checkbox
										id={`reason-${reason}`}
										checked={selectedReasons.includes(reason)}
										onCheckedChange={() => handleReasonToggle(reason)}
									/>
									<Label
										htmlFor={`reason-${reason}`}
										className="text-foreground cursor-pointer font-normal text-[12px]"
									>
										{reason}
									</Label>
								</div>
							))}
						</div>
					</div>

					<div className="space-y-2">
						<Label
							htmlFor="custom-reason"
							className="font-medium text-foreground text-[12px]"
						>
							Other Reason (optional):
						</Label>
						<Textarea
							id="custom-reason"
							placeholder={customReasonPlaceholder}
							value={customReason}
							onChange={(e) => setCustomReason(e.target.value)}
							className="resize-none h-24"
							style={{ fontSize: "12px" }}
						/>
					</div>
				</div>
			</div>

			<div className="flex items-center justify-end gap-3 px-6 py-4 bg-muted/30 border-t border-border">
				<Button
					variant="outline"
					onClick={handleClose}
					className="bg-transparent h-10 px-4 text-[12px]"
				>
					Cancel
				</Button>
				<Button
					variant={buttonVariant}
					onClick={handleSubmit}
					disabled={selectedReasons.length === 0 && !customReason.trim()}
					className="h-10 text-[12px]"
				>
					{buttonText}
				</Button>
			</div>
		</Modal>
	);
}
