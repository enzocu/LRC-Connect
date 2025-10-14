"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FiAlertTriangle } from "react-icons/fi";
import { Modal } from "@/components/modal";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const damageTypes = [
	"Physical damage (torn pages, broken binding)",
	"Water damage or stains",
	"Missing pages or components",
	"Writing or markings inside",
	"Cover damage or detachment",
	"Disc/CD scratches or cracks",
	"Hardware malfunction (for equipment)",
	"Software issues (for computers)",
	"Cleanliness issues",
	"Return the book because it’s overdue",
	"Other damage",
];

import { LoadingSpinner } from "@/components/loading";
import { markCompletedWithReport } from "../../controller/firebase/update/updateCompletedWithReport";

export function DamageReportModal({
	isOpen,
	onClose,
	transaction,
	setActiveTab,
	userDetails,
	Alert,
}) {
	const [btnLoading, setBtnLoading] = useState(false);
	const [selectedDamageTypes, setSelectedDamageTypes] = useState([]);
	const [customDamage, setCustomDamage] = useState("");

	const handleDamageTypeChange = (damageType) => {
		setSelectedDamageTypes((prev) =>
			prev.includes(damageType)
				? prev.filter((type) => type !== damageType)
				: [...prev, damageType]
		);
	};

	const handleSubmit = async () => {
		const allDamages = [...selectedDamageTypes];
		if (customDamage.trim() !== "") {
			allDamages.push(customDamage.trim());
		}
		if (userDetails && userDetails?.uid && transaction?.id) {
			await markCompletedWithReport(
				transaction,
				userDetails?.uid,
				allDamages,
				setBtnLoading,
				Alert
			);
			handleClose();
			setActiveTab("Completed");
		}
	};

	const handleClose = () => {
		setSelectedDamageTypes([]);
		setCustomDamage("");
		onClose();
	};

	if (!isOpen) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title="Report Transaction"
			size="md"
		>
			<div className="p-6 space-y-6">
				<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
					<div className="flex items-start gap-3">
						<FiAlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
						<div>
							<p className="font-bold text-red-800 mb-1 text-[12px]">
								Damage Report Summary
							</p>
							<p className="text-red-700 text-[11px]">
								This summary outlines the damages found upon the return of the
								borrowed material. The item must be returned to the library for
								further inspection and appropriate action. <br />
								<br />
								<span className="font-medium">
									Any applicable fines or repair procedures will be determined
									after assessment.
								</span>
							</p>
						</div>
					</div>
				</div>

				<div className="mb-6">
					<h3 className="text-xs font-medium text-gray-500 mb-3">
						Documented Damage(s)
					</h3>
					<div className="grid grid-cols-1 gap-2">
						{damageTypes.map((damageType) => (
							<div key={damageType} className="flex items-center space-x-2">
								<Checkbox
									id={`reason-${damageType}`}
									value={damageType}
									checked={selectedDamageTypes.includes(damageType)}
									onCheckedChange={() => handleDamageTypeChange(damageType)}
								/>
								<Label
									htmlFor={`reason-${damageType}`}
									className="text-foreground cursor-pointer font-normal text-[12px]"
								>
									{damageType}
								</Label>
							</div>
						))}
					</div>

					<div className="space-y-2 mt-4">
						<Label
							htmlFor="custom-reason"
							className="font-medium text-foreground text-[12px]"
						>
							Additional notes by admin (if any):
						</Label>
						<Textarea
							id="custom-reason"
							placeholder="Enter a custom reason for cancellation..."
							value={customDamage}
							onChange={(e) => setCustomDamage(e.target.value)}
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
					onClick={handleSubmit}
					className="bg-red-600 hover:bg-red-700 text-white h-10 text-[12px]"
					disabled={selectedDamageTypes.length == 0 && customDamage == ""}
				>
					<LoadingSpinner loading={btnLoading} />
					Report
				</Button>
			</div>
		</Modal>
	);
}
