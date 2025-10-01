"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/modal";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/loading";
import { updateReportAction } from "../../controller/firebase/update/updateReport";
import { renderResource } from "@/components/tags/transaction";

export function PenaltyActionModal({
	isOpen,
	onClose,
	reportData,
	userDetails,
	Alert,
}) {
	const [btnLoading, setBtnLoading] = useState(false);
	const [actionText, setActionText] = useState("");
	const [deadline, setDeadline] = useState("");

	if (!reportData) return null;

	const handleSubmit = async () => {
		if (!reportData.id || !userDetails || !userDetails?.uid) return;

		await updateReportAction(
			reportData.id,
			userDetails?.us_liID,
			userDetails?.uid,
			actionText,
			deadline,
			setBtnLoading,
			Alert
		);

		setActionText("");
		setDeadline("");
		onClose();
	};

	if (!isOpen) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Take Penalty Action"
			size="md"
		>
			<div className="p-6 space-y-6">
				{renderResource(reportData, false)}

				<div className="space-y-3">
					<div>
						<label className="block font-medium text-foreground mb-2 text-[12px]">
							Action to Take
						</label>
						<Textarea
							placeholder="Describe the action taken to resolve this penalty..."
							value={actionText}
							onChange={(e) => setActionText(e.target.value)}
							className="w-full min-h-[100px]"
							style={{ fontSize: "12px" }}
						/>
					</div>

					<div>
						<label className="block font-medium text-foreground mb-2 text-[12px]">
							Deadline
						</label>
						<Input
							type="date"
							value={deadline}
							onChange={(e) => setDeadline(e.target.value)}
							className="w-full"
							style={{ fontSize: "12px" }}
							min={new Date().toISOString().split("T")[0]}
						/>
					</div>
				</div>

				<div className="flex justify-end gap-3 pt-4 border-t border-border">
					<Button
						variant="outline"
						className="bg-transparent h-10 px-4 text-[12px]"
						onClick={() => onClose()}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={!actionText.trim()}
						className="bg-blue-600 hover:bg-blue-700 text-white h-10 text-[12px]"
					>
						<LoadingSpinner loading={btnLoading} />
						Record Action
					</Button>
				</div>
			</div>
		</Modal>
	);
}
