"use client";

import { useState } from "react";
import { Modal } from "./index";
import { Button } from "@/components/ui/button";
import { FiAlertTriangle } from "react-icons/fi";

import { LoadingSpinner } from "@/components/loading";
import { ResetPassword } from "@/controller/auth/resetPassword";
export function ResetPasswordAccountModal({
	isOpen,
	onClose,
	userData,
	li_id,
	us_id,
	Alert,
}) {
	const [btnLoading, setBtnLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!li_id || !us_id) {
			Alert.showDanger("User data is missing.");
			return;
		}

		await ResetPassword(userData, li_id, us_id, setBtnLoading, Alert);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Reset Password" size="md">
			<form onSubmit={handleSubmit} className="p-6">
				<div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
					<FiAlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
					<div>
						<h4 className="font-medium text-yellow-800 mb-1 text-[12px]">
							Reset Password for {userData?.us_name}
						</h4>
						<p className="text-yellow-700 text-[11px]">
							A password reset email will be sent to{" "}
							<strong>{userData?.us_email}</strong>. The user can follow the
							link in the email to set a new password.
						</p>
					</div>
				</div>

				<div className="flex gap-3 justify-end pt-4 border-t border-border">
					<Button
						type="button"
						onClick={onClose}
						variant="outline"
						className="bg-transparent h-10 px-4 text-[12px]"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						variant="destructive"
						className="h-10 text-[12px] flex items-center gap-2"
						disabled={btnLoading}
					>
						<LoadingSpinner loading={btnLoading} />
						Send Reset Email
					</Button>
				</div>
			</form>
		</Modal>
	);
}
