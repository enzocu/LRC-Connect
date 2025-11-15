"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/modal";
import {
	renderLibrary,
	renderPatron,
	renderResource,
	renderSchedule,
} from "@/components/tags/transaction";
import { LoadingSpinner } from "@/components/loading";
import { markCompleted } from "../../controller/firebase/update/updateCompleted";

const MarkCompletedModal = ({
	isOpen,
	onClose,
	transaction,
	setActiveTab,
	userDetails,
	Alert,
}) => {
	const [btnLoading, setBtnLoading] = useState(false);

	//LEVEL
	const [isPersonnel, setIsPersonnel] = useState(false);

	const handleConfirm = async () => {
		if (userDetails && userDetails?.uid && transaction && transaction?.id) {
			await markCompleted(userDetails?.uid, transaction, setBtnLoading, Alert);
			onClose();
			setActiveTab("Completed");
		}
	};

	useEffect(() => {
		setIsPersonnel(!["USR-5", "USR-6"].includes(userDetails?.us_level));
	}, [userDetails]);

	if (!isOpen) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={`Mark as Completed - ${transaction.tr_qr}`}
			size="md"
		>
			<div className="flex-1 overflow-y-auto p-6 space-y-6">
				<div>
					<h5 className="font-medium text-foreground mb-4 text-[13px]">
						Resources Details
					</h5>
					{renderResource(transaction)}
				</div>

				{isPersonnel && (
					<div>
						<h5 className="font-medium text-foreground mb-4 text-[13px]">
							Patron Details
						</h5>
						{renderPatron(transaction.tr_patron)}
					</div>
				)}

				<div>
					<h5 className="font-medium text-foreground mb-4 text-[13px]">
						Schedule
					</h5>
					{renderSchedule(transaction)}
				</div>

				{!isPersonnel && renderLibrary(transaction)}

				<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
					<p className="text-blue-800 text-[12px]">
						<strong>Note:</strong> This action will mark the transaction as
						completed and cannot be undone. The resource will be available for
						new reservations.
					</p>
				</div>
			</div>

			<div className="flex items-center justify-end gap-3 px-6 py-4 bg-muted/30 border-t border-border">
				<Button
					onClick={() => onClose()}
					variant="outline"
					className="bg-transparent h-10 px-4 text-[12px]"
				>
					Cancel
				</Button>
				<Button
					onClick={handleConfirm}
					className="bg-primary-custom hover:bg-secondary-custom text-white h-10 text-[12px]"
				>
					<LoadingSpinner loading={btnLoading} />
					Mark as Completed
				</Button>
			</div>
		</Modal>
	);
};

export default MarkCompletedModal;
