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

import { LoadingSpinner } from "@/components/loading";
import { transferCourses } from "@/controller/firebase/update/updateCourses";

export function TransferCourseModal({
	isOpen,
	onClose,
	actionData = null,
	coursesData = [],
	Alert,
}) {
	
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
			<div className="p-6  space-y-1">
				<Label className="font-medium text-foreground text-[12px]">
					Transfer <span className="font-semibold">{actionData?.title}</span>{" "}
					to:
				</Label>

				<Select value={selectedTarget} onValueChange={setSelectedTarget}>
					<SelectTrigger className="h-9 bg-background border-border text-foreground text-[12px]">
						<SelectValue placeholder="Select destination" />
					</SelectTrigger>

					<SelectContent>
						{coursesData
							.filter((target) => target.id !== actionData?.id)
							.map((target, index) => (
								<SelectItem
									key={index}
									value={target.id}
									className="text-[12px]"
								>
									{target.cs_title}
								</SelectItem>
							))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex items-center justify-end gap-3 px-6 py-4 bg-muted/30 border-t border-border">
				<Button
					type="button"
					onClick={onClose}
					variant="outline"
					className="bg-transparent h-10 px-4 text-[12px]"
				>
					Cancel
				</Button>

				<Button
					type="button"
					onClick={handleTransfer}
					disabled={!selectedTarget || btnLoading}
					className="bg-primary-custom hover:bg-secondary-custom text-white text-[12px] h-10 px-4"
				>
					<LoadingSpinner loading={btnLoading} />
					Transfer
				</Button>
			</div>
		</Modal>
	);
}
