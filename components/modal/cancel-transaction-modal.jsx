"use client";

import { useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const CANCELLATION_REASONS = [
	"Patron requested cancellation",
	"Resource no longer needed",
	"Resource unavailable/damaged",
	"Scheduling conflict",
	"Duplicate reservation",
	"System error",
	"Policy violation",
];

const CANCELLATION_REASONS_PATRON = [
	"I no longer need the resource",
	"I made the reservation by mistake",
	"The schedule doesn't work for me",
	"I found another resource instead",
	"The resource is not available or broken",
	"I’m having a personal/emergency issue",
	"I want to cancel for other reasons",
];

import { LoadingSpinner } from "@/components/loading";
import { markCancelled } from "../../controller/firebase/update/updateCancelled";

export function CancelTransactionModal({
	isOpen,
	onClose,
	transaction,
	setActiveTab,
	userDetails,
	Alert,
}) {
	const [btnLoading, setBtnLoading] = useState(false);
	const [selectedReasons, setSelectedReasons] = useState([]);
	const [customReason, setCustomReason] = useState("");

	const handleReasonToggle = (reason) => {
		setSelectedReasons((prev) =>
			prev.includes(reason)
				? prev.filter((r) => r !== reason)
				: [...prev, reason]
		);
	};

	const handleSubmit = async () => {
		if (userDetails && userDetails?.uid && transaction?.id) {
			const allReasons = [...selectedReasons];
			if (customReason.trim()) {
				allReasons.push(customReason.trim());
			}
			await markCancelled(
				transaction,
				userDetails?.uid,
				allReasons,
				setBtnLoading,
				Alert
			);
			handleClose();
			setActiveTab("Cancelled");
		}
	};

	const handleClose = () => {
		setSelectedReasons([]);
		setCustomReason("");
		onClose();
	};

	if (!isOpen) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title="Cancel Transaction"
			size="md"
		>
			<div className="p-6 space-y-6">
				<div className="flex items-start space-x-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
					<FiAlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
					<div>
						<p className="text-amber-800 dark:text-amber-300 text-[12px]">
							This action cannot be undone. The transaction will be marked as
							cancelled and the resource will become available for others.
						</p>
					</div>
				</div>

				<div className="space-y-4">
					<div>
						<h3 className="font-normal text-foreground mb-3 text-[12px]">
							Select cancellation reason(s):
						</h3>
						<div className="space-y-3">
							{(!["USR-5", "USR-6"].includes(userDetails?.us_level)
								? CANCELLATION_REASONS
								: CANCELLATION_REASONS_PATRON
							).map((reason) => (
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
							Custom reason (optional):
						</Label>
						<Textarea
							id="custom-reason"
							placeholder="Enter a custom reason for cancellation..."
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
					onClick={handleClose}
					variant="outline"
					className="bg-transparent h-10 px-4 text-[12px]"
				>
					Cancel
				</Button>
				<Button
					className="h-10 text-[12px]"
					variant="destructive"
					onClick={handleSubmit}
					disabled={selectedReasons.length == 0 && customReason == ""}
				>
					<LoadingSpinner loading={btnLoading} />
					Confirm Cancellation
				</Button>
			</div>
		</Modal>
	);
}
