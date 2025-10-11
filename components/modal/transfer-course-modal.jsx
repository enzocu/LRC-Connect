"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { useAlertActions } from "@/contexts/AlertContext";
import { LoadingSpinner } from "@/components/loading";
import { transferCourses } from "@/controller/firebase/update/updateCourses";

export function TransferCourseModal({
	isOpen,
	onClose,
	actionData = null,
	coursesData = [],
}) {
	const Alert = useAlertActions();
	const [btnLoading, setBtnLoading] = useState(false);
	const [selectedTarget, setSelectedTarget] = useState("");

	useEffect(() => {
		if (!isOpen) {
			setSelectedTarget("");
		}
	}, [isOpen]);

	const handleTransfer = async () => {
		if (!selectedTarget) return;

		await transferCourses(
			selectedTarget,
			actionData,
			coursesData,
			setBtnLoading,
			Alert
		);
		onClose();
	};

	if (!isOpen || actionData?.mode !== "transfer") return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={`Transfer ${
				actionData?.type?.charAt(0).toUpperCase() +
					actionData?.type?.slice(1) || "Course"
			}`}
			size="sm"
		>
			<div className="p-6 space-y-4">
				<div>
					<Label
						className="text-foreground font-medium"
						style={{ fontSize: "11px" }}
					>
						Transfer <span className="font-semibold">{actionData?.title}</span>{" "}
						to:
					</Label>

					<Select value={selectedTarget} onValueChange={setSelectedTarget}>
						<SelectTrigger
							className="mt-2 h-9 bg-background border-border text-foreground"
							style={{ fontSize: "11px" }}
						>
							<SelectValue placeholder="Select destination" />
						</SelectTrigger>

						<SelectContent>
							{coursesData
								.filter((target) => target.id !== actionData?.id)
								.map((target, index) => (
									<SelectItem
										key={index}
										value={target.id}
										style={{ fontSize: "11px" }}
									>
										{target.cs_track || target.cs_institute}
									</SelectItem>
								))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex gap-3 justify-end pt-2">
					<Button
						type="button"
						onClick={onClose}
						variant="outline"
						className="h-9 px-4 border-border text-foreground hover:bg-accent bg-transparent"
						style={{ fontSize: "11px" }}
					>
						Cancel
					</Button>

					<Button
						type="button"
						onClick={handleTransfer}
						disabled={!selectedTarget || btnLoading}
						className="bg-primary-custom text-white hover:opacity-90 h-9 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
						style={{ fontSize: "11px" }}
					>
						<LoadingSpinner loading={btnLoading} />
						Transfer
					</Button>
				</div>
			</div>
		</Modal>
	);
}
