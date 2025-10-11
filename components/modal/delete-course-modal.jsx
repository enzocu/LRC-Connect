"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { FiAlertTriangle } from "react-icons/fi";

import { useAlertActions } from "@/contexts/AlertContext";
import { LoadingSpinner } from "@/components/loading";
import { deleteCourses } from "@/controller/firebase/update/updateCourses";

export function DeleteCourseModal({
	isOpen,
	onClose,
	actionData = null,
	coursesData = null,
}) {
	const Alert = useAlertActions();
	const [btnLoading, setBtnLoading] = useState(false);

	const handleConfirm = async () => {
		await deleteCourses(actionData, coursesData, setBtnLoading, Alert);
		onClose();
	};

	if (!isOpen || actionData?.mode !== "delete") return null;

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion" size="sm">
			<div className="p-6 space-y-4">
				<div className="flex items-start gap-3">
					<div className="p-2 rounded-full bg-red-100">
						<FiAlertTriangle className="w-5 h-5 text-red-600" />
					</div>
					<div className="flex-1">
						<p className="text-foreground" style={{ fontSize: "11px" }}>
							Are you sure you want to delete{" "}
							<span className="font-semibold">{actionData?.title}</span>?
						</p>
						<p
							className="text-muted-foreground mt-1"
							style={{ fontSize: "10px" }}
						>
							This action cannot be undone.
						</p>
					</div>
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
						onClick={handleConfirm}
						className="bg-red-600 text-white hover:bg-red-700 h-9 px-4"
						style={{ fontSize: "11px" }}
					>
						<LoadingSpinner loading={btnLoading} />
						Delete
					</Button>
				</div>
			</div>
		</Modal>
	);
}
