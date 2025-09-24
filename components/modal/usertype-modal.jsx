"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { useAlertActions } from "@/contexts/AlertContext";
import { LoadingSpinner } from "@/components/loading";

import { changeUserType } from "@/controller/firebase/update/updateUserStatus";

export function UserTypeModal({
	isOpen,
	onClose,
	li_id,
	userData,
	modifiedBy,
}) {
	const Alert = useAlertActions();
	const [userType, setUserType] = useState("");
	const [btnLoading, setBtnLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!userData.us_id) return;
		await changeUserType(
			li_id,
			modifiedBy,
			userData.us_id,
			userData.us_name,
			userData.us_level,
			userType,
			userData.us_library,
			setBtnLoading,
			Alert
		);
		resetForm();
	};

	const resetForm = () => {
		setUserType("");
		onClose();
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	if (!isOpen) return null;

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Change User Type" size="sm">
			<form
				onSubmit={handleSubmit}
				onKeyDown={handleKeyDown}
				className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
			>
				<div>
					<label className="block text-foreground font-medium mb-2 text-[12px]">
						Select New User Type
					</label>
					<select
						name="us_type"
						value={userType}
						onChange={(e) => setUserType(e.target.value)}
						className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 text-[12px]"
						required
					>
						<option value="">Select User Type</option>

						{["USR-6", "USR-5"].includes(userData?.us_level) && (
							<optgroup label="Patrons">
								{["Student", "Faculty", "Administrator"].map((type) => (
									<option
										key={type}
										value={type}
										disabled={userData?.us_type === type}
									>
										{type} {userData?.us_type === type && "(Already Active)"}
									</option>
								))}
							</optgroup>
						)}

						<optgroup label="Assistants">
							{["USR-6", "USR-5"].includes(userData?.us_level) ? (
								<option
									value="Student Assistant"
									disabled={userData?.us_type === "Student Assistant"}
								>
									Student Assistant
									{userData?.us_type === "Student Assistant" &&
										" (Already Active)"}
								</option>
							) : (
								<option
									value="Administrative Assistant"
									disabled={userData?.us_type === "Administrative Assistant"}
								>
									Administrative Assistant
									{userData?.us_type === "Administrative Assistant" &&
										" (Already Active)"}
								</option>
							)}
						</optgroup>

						{!["USR-6", "USR-5"].includes(userData?.us_level) && (
							<optgroup label="Librarians">
								{["Chief Librarian", "Head Librarian"].map((type) => (
									<option
										key={type}
										value={type}
										disabled={userData?.us_type === type}
									>
										{type} {userData?.us_type === type && "(Already Active)"}
									</option>
								))}
							</optgroup>
						)}
					</select>
				</div>

				<div className="flex gap-3 justify-end pt-2">
					<Button
						type="button"
						onClick={resetForm}
						variant="outline"
						className="bg-transparent h-10 px-4 text-[12px]"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={btnLoading || userType === userData?.us_type}
						className="bg-primary-custom text-white hover:opacity-90 h-10 px-4 text-[12px] disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<LoadingSpinner loading={btnLoading} />
						Save Changes
					</Button>
				</div>
			</form>
		</Modal>
	);
}
