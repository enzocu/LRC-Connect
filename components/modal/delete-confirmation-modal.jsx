"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import { LoadingSpinner } from "@/components/loading";
import { FiTrash2 } from "react-icons/fi";

import { updateFaqsStatus } from "../../controller/firebase/update/updateFaqs";
import { updateNewsAnnouncementStatus } from "../../controller/firebase/update/updateNewsAnnouncement";

const DeleteConfirmationModal = ({
	isOpen,
	onClose,
	type,
	title,
	description,
	id,
}) => {
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const [btnLoading, setBtnLoading] = useState(false);

	const handleConfirm = async (e) => {
		e.preventDefault();
		if (!userDetails.uid) return;

		if (type === "Feedback") {
			await updateFaqsStatus(
				id,
				userDetails.us_liID,
				userDetails.uid,
				setBtnLoading,
				Alert
			);
		} else {
			await updateNewsAnnouncementStatus(
				id,
				userDetails.us_liID,
				userDetails.uid,
				setBtnLoading,
				Alert
			);
		}
		onClose();
	};

	if (!isOpen) return null;

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
			<div className="p-6 space-y-6">
				<p className="text-muted-foreground text-[12px]">{description}</p>

				<div className="flex justify-end gap-3 pt-4 border-t border-border">
					<Button
						variant="outline"
						className="bg-transparent h-10 px-4 text-[12px]"
						onClick={() => onClose()}
					>
						Cancel
					</Button>
					<Button
						onClick={handleConfirm}
						className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1 h-10 text-[12px]"
					>
						<LoadingSpinner loading={btnLoading} />
						{!btnLoading && <FiTrash2 className="text-[14px]" />}
						Delete
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default DeleteConfirmationModal;
