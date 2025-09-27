"use client";

import { useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { LoadingSpinner } from "@/components/loading";
import { useAlertActions } from "@/contexts/AlertContext";

const DEACTIVATION_REASONS = {
	material: [
		"Material is damaged beyond repair",
		"Material is outdated/obsolete",
		"Material contains incorrect information",
		"Material is missing/lost",
		"Material is being replaced by newer edition",
		"Material violates library policies",
		"Material is being transferred to another branch",
	],
	computers: [
		"Computer is damaged/malfunctioning",
		"Computer is outdated/obsolete",
		"Computer requires maintenance",
		"Computer is being replaced",
		"Computer is being relocated",
		"Software issues require resolution",
		"Hardware components need replacement",
	],
	discussionrooms: [
		"Room requires maintenance/repairs",
		"Room is being renovated",
		"Room is being repurposed",
		"Room equipment is malfunctioning",
		"Room is being relocated",
		"Room is temporarily unavailable",
		"Room is being consolidated with another space",
	],
	library: [
		"Library is under renovation",
		"Library is being merged with another branch",
		"Library operations are temporarily suspended",
		"Library is being permanently closed",
		"Library is undergoing system upgrades",
		"Library is being relocated",
		"Library is no longer supported",
	],
};

import { deactiveResource } from "@/controller/firebase/update/updateResourceDeactive";

export function DeactivateResourceModal({
	isOpen,
	onClose,
	resourceId,
	resourceTitle,
	resourceStatus,
	resourceType = "material",
	resourceQr,
}) {
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const [btnLoading, setBtnLoading] = useState(false);

	const [selectedReasons, setSelectedReasons] = useState([]);
	const [customReason, setCustomReason] = useState("");

	const reasons =
		DEACTIVATION_REASONS[resourceType] || DEACTIVATION_REASONS.material;

	const handleReasonToggle = (reason) => {
		setSelectedReasons((prev) =>
			prev.includes(reason)
				? prev.filter((r) => r !== reason)
				: [...prev, reason]
		);
	};

	const handleSubmit = async () => {
		if (
			selectedReasons.length === 0 &&
			!customReason.trim() &&
			resourceStatus == "Active"
		)
			return;

		const allReasons = [
			...selectedReasons,
			...(customReason.trim() ? [customReason.trim()] : []),
		];

		if (!userDetails?.uid || !resourceId) return;

		await deactiveResource(
			resourceType,
			resourceId,
			resourceStatus == "Active" ? "Inactive" : "Active",
			userDetails?.us_liID || resourceId,
			userDetails?.uid,
			resourceTitle,
			resourceQr,
			allReasons,
			setBtnLoading,
			Alert
		);

		handleClose();
	};

	const handleClose = () => {
		setSelectedReasons([]);
		setCustomReason("");
		onClose();
	};

	const resourceTypeDisplay = getResourceTypeDisplay(resourceType);

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title={`${
				resourceStatus === "Inactive" ? "Activate" : "Deactivate"
			} ${resourceTypeDisplay}`}
			size="md"
		>
			<div className="p-6 space-y-6">
				<div
					className={`flex items-start space-x-3 p-4 rounded-md border ${
						resourceStatus === "Inactive"
							? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
							: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
					}`}
				>
					<FiAlertTriangle
						className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
							resourceStatus === "Inactive" ? "text-green-500" : "text-red-500"
						}`}
					/>

					<div>
						{resourceStatus === "Inactive" ? (
							<>
								<p
									className="text-green-800 dark:text-green-300 font-medium mb-1 text-[12px]"
									style={{ fontSize: "11px" }}
								>
									Info: This action will activate the{" "}
									{resourceTypeDisplay.toLowerCase()}.
								</p>
								<p className="text-green-700 dark:text-green-400 text-[11px]">
									The {resourceTypeDisplay.toLowerCase()} will be made available
									again to users and can be reserved or accessed.
								</p>
							</>
						) : resourceType === "library" ? (
							<>
								<p className="text-red-800 dark:text-red-300 font-medium mb-1 text-[12px]">
									Warning: This action will deactivate the library from the
									system
								</p>
								<p className="text-red-700 dark:text-red-400 text-[11px]">
									The library will no longer be accessible or visible to users.
									All operations may be disabled until reactivation.
								</p>
							</>
						) : (
							<>
								<p className="text-red-800 dark:text-red-300 font-medium mb-1 text-[12px]">
									Warning: This action will remove the{" "}
									{resourceType.toLowerCase()} from circulation
								</p>
								<p className="text-red-700 dark:text-red-400 text-[11px]">
									The {resourceType.toLowerCase()} will not appear in results
									and can't be reserved. Reversal is admin-only.
								</p>
							</>
						)}
					</div>
				</div>

				{resourceTitle && (
					<div className="p-3 bg-muted/30 border border-border rounded-md">
						<p className="text-foreground font-medium text-[12px]">
							{resourceTypeDisplay}: {resourceTitle}
						</p>
					</div>
				)}

				{resourceStatus !== "Inactive" && (
					<div className="space-y-4">
						<div>
							<h3 className="font-normal text-foreground mb-3 text-[12px]">
								Select deactivation reason(s):
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
								Custom reason (optional):
							</Label>
							<Textarea
								id="custom-reason"
								placeholder="Enter a custom reason for deactivation..."
								value={customReason}
								onChange={(e) => setCustomReason(e.target.value)}
								className="resize-none h-24"
								style={{ fontSize: "12px" }}
							/>
						</div>
					</div>
				)}
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
					variant={resourceStatus === "Inactive" ? "default" : "destructive"}
					onClick={handleSubmit}
					disabled={
						resourceStatus !== "Inactive" &&
						selectedReasons.length === 0 &&
						!customReason.trim()
					}
				>
					<LoadingSpinner loading={btnLoading} />
					{resourceStatus === "Inactive"
						? "Confirm Activation"
						: "Confirm Deactivation"}
				</Button>
			</div>
		</Modal>
	);
}

const getResourceTypeDisplay = (resourceType) => {
	switch (resourceType) {
		case "computers":
			return "Computer";
		case "discussionrooms":
			return "Discussion Room";
		case "library":
			return "Library";
		default:
			return "Material";
	}
};
