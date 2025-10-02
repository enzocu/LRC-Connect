"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FiCamera } from "react-icons/fi";
import { ScannerModal } from "@/components/modal/scanner-modal";
import { EnterExit } from "@/controller/firebase/update/updateEnterExit";

import { LoadingSpinner } from "@/components/loading";

export function EntryExitUserModal({ isOpen, onClose, li_id, us_id, Alert }) {
	const [userId, setUserId] = useState("");
	const [isScannerOpen, setIsScannerOpen] = useState(false);
	const [btnLoading, setBtnLoading] = useState(false);

	const handleSubmit = async () => {
		if (!userId) return;
		await EnterExit(
			us_id,
			li_id,
			null,
			userId,
			"onSite",
			null,
			setBtnLoading,
			Alert
		);
		setUserId("");
		onClose();
	};

	const handleClose = () => {
		setUserId("");
		onClose();
	};

	if (!isOpen) return null;

	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={handleClose}
				title="Enter / Exit User"
				size="sm"
			>
				<div className="p-6 space-y-6">
					<div className="space-y-2">
						<Label
							htmlFor="user-id"
							className="block text-foreground font-medium mb-2 text-[12px]"
						>
							Enter User ID
						</Label>

						<div className="flex items-center gap-2">
							<div className="relative w-full max-w-xs">
								<Input
									id="user-id"
									type="text"
									placeholder="Enter User ID (e.g., USR-****-*)"
									value={userId}
									onChange={(e) => setUserId(e.target.value)}
									className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 pr-10"
									style={{ fontSize: "12px" }}
								/>
								<Button
									onClick={() => setIsScannerOpen(true)}
									variant="ghost"
									type="button"
									className="absolute right-1 top-1/2 -translate-y-1/2 p-2 w-7 text-muted-foreground h-9 "
								>
									<FiCamera className="w-4 h-4" />
								</Button>
							</div>

							<Button
								type="button"
								onClick={handleSubmit}
								className="h-10 px-4 text-[12px] bg-primary text-white hover:bg-primary/90 "
								disabled={!userId}
							>
								<LoadingSpinner loading={btnLoading} />
								Submit
							</Button>
						</div>
					</div>
				</div>
			</Modal>

			<ScannerModal
				isOpen={isScannerOpen}
				onClose={() => setIsScannerOpen(false)}
				setResult={setUserId}
				allowedPrefix="USR"
			/>
		</>
	);
}
