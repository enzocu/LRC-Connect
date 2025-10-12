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
			<div className="p-6 flex items-start gap-3">
				<div className="p-4 rounded-full bg-red-100">
					<FiAlertTriangle className="w-5 h-5 text-red-600" />
				</div>
				<div className="flex-1">
					<p className="text-foreground font-medium text-[12px]">
						Are you sure you want to delete{" "}
						<span className="font-semibold">{actionData?.title}</span>?
					</p>
					<p className="text-muted-foreground mt-1 text-[11px]">
						This action cannot be undone.
					</p>
				</div>
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
					onClick={handleConfirm}
					className="bg-red-600 text-white hover:bg-red-700 text-[12px] h-10 px-4"
				>
					<LoadingSpinner loading={btnLoading} />
					Delete
				</Button>
			</div>
		</Modal>
	);
}
