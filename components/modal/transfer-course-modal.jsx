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

export function TransferCourseModal({
	isOpen,
	onClose,
	onTransfer,
	itemName,
	itemType,
	availableTargets = [],
}) {
	const [selectedTarget, setSelectedTarget] = useState("");

	useEffect(() => {
		if (!isOpen) {
			setSelectedTarget("");
		}
	}, [isOpen]);

	const handleTransfer = () => {
		if (selectedTarget) {
			onTransfer(selectedTarget);
			setSelectedTarget("");
			onClose();
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={`Transfer ${itemType}`}
			size="sm"
		>
			<div className="p-6 space-y-4">
				<div>
					<Label
						className="text-foreground font-medium"
						style={{ fontSize: "11px" }}
					>
						Transfer <span className="font-semibold">{itemName}</span> to:
					</Label>
					<Select value={selectedTarget} onValueChange={setSelectedTarget}>
						<SelectTrigger
							className="mt-2 h-9 bg-background border-border text-foreground"
							style={{ fontSize: "11px" }}
						>
							<SelectValue placeholder="Select destination" />
						</SelectTrigger>
						<SelectContent>
							{availableTargets.map((target, index) => (
								<SelectItem
									key={index}
									value={target}
									style={{ fontSize: "11px" }}
								>
									{target}
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
						disabled={!selectedTarget}
						className="bg-primary-custom text-white hover:opacity-90 h-9 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
						style={{ fontSize: "11px" }}
					>
						Transfer
					</Button>
				</div>
			</div>
		</Modal>
	);
}
