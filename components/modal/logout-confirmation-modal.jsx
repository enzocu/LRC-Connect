"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import { LoadingSpinner } from "@/components/loading";
import { FiLogOut } from "react-icons/fi";

import { handleLogout } from "@/controller/auth/logout";
const LogoutConfirmationModal = ({ isOpen, onClose }) => {
	const router = useRouter();
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const [btnLoading, setBtnLoading] = useState(false);

	const handleConfirm = () => {
		handleLogout({
			userDetails,
			setBtnLoading,
			alert: Alert,
			router,
			onClose,
		});
	};

	if (!isOpen) return null;

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Confirm Logout" size="sm">
			<div className="p-6 space-y-6">
				<p className="text-muted-foreground  text-[12px]">
					Are you sure you want to log out of your account? You will need to
					sign in again to continue.
				</p>

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
						{!btnLoading && <FiLogOut className="text-[14px]" />}
						Logout
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default LogoutConfirmationModal;
