"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/modal";
import { Input } from "@/components/ui/input";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import { LoadingSpinner } from "@/components/loading";

import { updateReportAction } from "../../controller/firebase/update/updateReport";
export function PenaltyActionModal({ isOpen, onClose, reportData }) {
	const Alert = useAlertActions();
	const { userDetails } = useUserAuth();
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
				{renderReportResource(reportData)}

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

export const renderReportResource = (report) => {
	return (
		<div className="flex gap-4 items-start">
			{/* Image */}
			<img
				src={
					report?.tr_type === "Material"
						? report?.tr_resource.ma_photoURL
						: report?.tr_type === "Discussion Room"
						? report?.tr_resource.dr_photoURL
						: report?.tr_type === "Computer"
						? report?.tr_resource.co_photoURL
						: "/placeholder.svg?height=112&width=80"
				}
				alt={report.tr_qr}
				className={`h-28 object-cover rounded-lg bg-gray-100 ${
					report.tr_type !== "Material" ? "w-28" : "w-20"
				}`}
			/>

			{/* Details */}
			<div className="min-w-0">
				<p className="text-foreground font-medium text-[14px]">
					{report?.tr_type === "Material"
						? report?.tr_resource.ma_title
						: report?.tr_type === "Discussion Room"
						? report?.tr_resource.dr_name
						: report?.tr_type === "Computer"
						? report?.tr_resource.co_name
						: "NA"}
				</p>

				<p className="text-muted-foreground text-[12px] mb-2">
					{report?.tr_type === "Material"
						? "by " + report?.tr_resource.ma_author
						: report?.tr_type === "Discussion Room"
						? report?.tr_resource.dr_createdAt
						: report?.tr_type === "Computer"
						? report?.tr_resource.co_createdAt
						: "NA"}
				</p>

				<div className="flex flex-wrap items-center gap-2">
					<span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[11px]">
						{report?.tr_type}
					</span>
					{report?.tr_type === "Material" && (
						<span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[11px]">
							{report?.tr_format}
						</span>
					)}
				</div>
			</div>
		</div>
	);
};
