"use client";

import { useState, useEffect } from "react";
import { Modal } from "./index";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FiAlertTriangle, FiX } from "react-icons/fi";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { LoadingSpinner } from "@/components/loading";
import { useAlertActions } from "@/contexts/AlertContext";

import { getLibraryFeatureList } from "@/controller/firebase/get/getLibraryFeatureList";
import {
	changeUserStatus,
	transferUserLibrary,
} from "@/controller/firebase/update/updateUserStatus";

export function RemoveAccountModal({ isOpen, onClose, li_id, userData }) {
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const [btnLoading, setBtnLoading] = useState(false);

	const [libraryData, setLibraryData] = useState([]);
	const [reason, setReason] = useState("");
	const [transferToOtherLibrary, setTransferToOtherLibrary] = useState(false);
	const [selectedLibrary, setSelectedLibrary] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (userData && userData.us_id) {
			if (transferToOtherLibrary) {
				if (!selectedLibrary || !userDetails?.uid) return;
				await transferUserLibrary(
					li_id,
					userDetails?.uid,
					selectedLibrary,
					userData.us_id,
					userData.us_name,
					userData.us_level,
					userData.us_type,
					userData.us_library,
					setBtnLoading,
					Alert
				);
			} else {
				if (!userDetails?.uid) return;
				await changeUserStatus(
					li_id,
					userData.us_id,
					userData.us_name,
					userData.us_level,
					userData.us_library,
					userDetails?.uid,
					"Inactive",
					reason,
					setBtnLoading,
					Alert
				);
			}
		}

		// Reset state
		setReason("");
		setTransferToOtherLibrary(false);
		setSelectedLibrary("");
		onClose();
	};

	const handleCancel = () => {
		setReason("");
		setTransferToOtherLibrary(false);
		setSelectedLibrary("");
		onClose();
	};

	useEffect(() => {
		if (transferToOtherLibrary && li_id) {
			getLibraryFeatureList(setLibraryData, Alert, li_id);
		}
	}, [transferToOtherLibrary]);

	if (!isOpen) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleCancel}
			title="Deactivate Account"
			size="md"
		>
			<form onSubmit={handleSubmit} className="p-6">
				<div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
					<FiAlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
					<div>
						<h4 className="font-medium text-red-800 mb-1 text-[12px]">
							Deactivate{" "}
							{["USR-6"].includes(userData?.us_level) ? "Patron" : "Personnel"}
						</h4>
						<p className="text-red-700 text-[11px]">
							You are about to deactivate <strong>{userData.us_name}</strong>{" "}
							from this library.
							{!transferToOtherLibrary &&
								" This action will permanently remove their access to this library."}
						</p>
					</div>
				</div>

				{!transferToOtherLibrary && (
					<div className="mb-6">
						<label className="block text-foreground font-medium mb-2 text-[12px]">
							Reason for Deactivating <span className="text-red-500">*</span>
						</label>
						<Textarea
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							placeholder="Please provide a reason for removing this account..."
							rows={3}
							className="bg-card border-border text-foreground"
							style={{ fontSize: "12px" }}
							required
						/>
					</div>
				)}

				<div className="mb-6">
					<div className="flex items-center space-x-2 mb-4">
						<Checkbox
							id="transfer-library"
							checked={transferToOtherLibrary}
							onCheckedChange={(checked) => {
								setTransferToOtherLibrary(checked);
								if (!checked) setSelectedLibrary("");
							}}
						/>
						<label
							htmlFor="transfer-library"
							className="text-foreground font-medium cursor-pointer text-[12px]"
						>
							Transfer to another library
						</label>
					</div>

					{transferToOtherLibrary && (
						<div className="ml-6">
							<label className="block text-foreground font-medium mb-2 text-[12px]">
								Select Library <span className="text-red-500">*</span>
							</label>
							<select
								value={selectedLibrary}
								onChange={(e) => setSelectedLibrary(e.target.value)}
								className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 text-[12px]"
								required={transferToOtherLibrary}
							>
								<option value="">Choose a library...</option>
								{libraryData.map((library) => (
									<option
										key={library.id}
										value={library.id}
										disabled={library.id === li_id}
									>
										{library.li_name} - {library.li_school}
										{library.id === li_id && " (Already Active)"}
									</option>
								))}
							</select>
							<p className="text-muted-foreground mt-1 text-[11px]">
								The account will be transferred to the selected library and
								maintain access there.
							</p>
						</div>
					)}
				</div>

				<div className="flex gap-3 justify-end pt-4 border-t border-border">
					<Button
						type="button"
						onClick={handleCancel}
						variant="outline"
						className="bg-transparent h-10 px-4 text-[12px]"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						variant="destructive"
						className="h-10 text-[12px]"
					>
						<LoadingSpinner loading={btnLoading} />
						{transferToOtherLibrary ? "Transfer Account" : "Deactivate Account"}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
