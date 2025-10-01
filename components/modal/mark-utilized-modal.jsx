"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/modal";
import {
	renderPatron,
	renderResource,
	renderSchedule,
} from "@/components/tags/transaction";

import { LoadingSpinner } from "@/components/loading";
import { useLoading } from "@/contexts/LoadingProvider";

import { getAffectedList } from "../../controller/firebase/get/getAffected";
import { markUtilized } from "../../controller/firebase/update/updateMarkUtilized";

const MarkUtilizedModal = ({
	isOpen,
	onClose,
	transaction,
	setActiveTab,
	userDetails,
	Alert,
}) => {
	const pathname = usePathname();
	const { setLoading, setPath } = useLoading();
	const [btnLoading, setBtnLoading] = useState(false);

	const [available, setAvailable] = useState(true);
	const [selectedAccession, setSelectedAccession] = useState("");
	const [hasAffectedTransactions, setAffectedTransactions] = useState([]);

	const handleConfirm = async () => {
		if (userDetails && userDetails?.uid && transaction?.id) {
			await markUtilized(
				transaction,
				userDetails?.uid,
				selectedAccession,
				hasAffectedTransactions,
				setBtnLoading,
				Alert
			);
			onClose();
			setActiveTab("Utilized");
		}
	};

	useEffect(() => {
		setPath(pathname);
		if (isOpen && transaction && transaction?.tr_status == "Reserved") {
			getAffectedList(
				transaction,
				setAffectedTransactions,
				setAvailable,
				setLoading,
				Alert
			);
		}
	}, [transaction, isOpen]);

	if (!isOpen) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={`Mark As Utilized - ${transaction?.tr_qr} `}
			size="md"
		>
			<div className="flex-1 overflow-y-auto p-6 space-y-6">
				<div>
					<h5 className="font-medium text-foreground mb-4 text-[13px]">
						Resources Details
					</h5>
					{renderResource(transaction)}
				</div>
				{/* Patron Details */}
				<div>
					<h5 className="font-medium text-foreground mb-4 text-[13px]">
						Patron Details
					</h5>
					{renderPatron(transaction?.tr_patron)}
				</div>
				<div>
					<h5 className="font-medium text-foreground mb-4 text-[13px]">
						Schedule
					</h5>
					{renderSchedule(transaction)}
				</div>

				{transaction?.tr_type === "Material" &&
					transaction?.tr_format === "Hard Copy" &&
					available &&
					transaction?.tr_resource?.ma_holdings?.length > 0 && (
						<div>
							<h5 className="font-medium text-foreground mb-2 text-[13px]">
								Select Accession
							</h5>
							<select
								className="w-full border border-gray-300 rounded-md p-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500"
								value={selectedAccession}
								onChange={(e) => setSelectedAccession(e.target.value)}
							>
								<option value="" disabled>
									Choose accession...
								</option>
								{transaction?.tr_resource.ma_holdings.map((holding) => (
									<option key={holding} value={holding}>
										{holding}
									</option>
								))}
							</select>
						</div>
					)}

				{hasAffectedTransactions?.length > 0 && (
					<div className="space-y-3">
						<div className="flex items-center space-x-2">
							<AlertTriangle className="w-4 h-4 text-amber-500" />
							<p className="font-medium text-foreground text-[12px]">
								The following transactions will be cancelled:
							</p>
						</div>

						<div className="border border-gray-200 rounded-lg overflow-hidden">
							<div className="max-h-48 overflow-y-auto">
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-50">
										<tr>
											<th
												scope="col"
												className="px-4 py-3 text-left text-gray-500 font-medium text-[12px]"
											>
												Transaction ID
											</th>
											<th
												scope="col"
												className="px-4 py-3 text-left text-gray-500 font-medium text-[12px]"
											>
												Use Date
											</th>
											{transaction?.tr_type == "Material" && (
												<th
													scope="col"
													className="px-4 py-3 text-left text-gray-500 font-medium text-[12px]"
												>
													Date Due
												</th>
											)}
											{transaction?.tr_type !== "Material" && (
												<>
													<th
														scope="col"
														className="px-4 py-3 text-left text-gray-500 font-medium text-[12px]"
													>
														Session Start
													</th>

													<th
														scope="col"
														className="px-4 py-3 text-left text-gray-500 font-medium text-[12px]"
													>
														Session End
													</th>
												</>
											)}
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{hasAffectedTransactions?.map((transaction) => (
											<tr key={transaction?.id}>
												<td className="px-4 py-2 whitespace-nowrap text-gray-900 text-[12px]">
													{transaction?.tr_qr}
												</td>
												<td className="px-4 py-2 whitespace-nowrap text-gray-600 text-[12px]">
													{transaction?.tr_date}
												</td>
												{transaction?.tr_type == "Material" && (
													<td className="px-4 py-2 whitespace-nowrap text-gray-600 text-[12px]">
														{transaction?.tr_dateDue}
													</td>
												)}
												{transaction?.tr_type !== "Material" && (
													<>
														<td className="px-4 py-2 whitespace-nowrap text-gray-600 text-[12px]">
															{transaction?.tr_sessionStart}
														</td>
														<td className="px-4 py-2 whitespace-nowrap text-gray-600 text-[12px]">
															{transaction?.tr_sessionEnd}
														</td>
													</>
												)}
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				)}
				<div
					className={`${
						hasAffectedTransactions ? "bg-amber-50" : "bg-blue-50"
					} border ${
						hasAffectedTransactions ? "border-amber-200" : "border-blue-200"
					} rounded-lg p-3`}
				>
					<p
						className={`${
							hasAffectedTransactions ? "text-amber-800" : "text-blue-800"
						}`}
						style={{ fontSize: "12px" }}
					>
						<strong>Note:</strong>{" "}
						{hasAffectedTransactions && hasAffectedTransactions?.length > 0
							? "Marking this transaction as utilized will automatically cancel the listed transactions due to limited quantity (1)."
							: "This action will mark the transaction as utilized and cannot be undone."}
					</p>
				</div>
			</div>

			{/* Footer */}
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
					disabled={
						!available ||
						(selectedAccession == "" &&
							transaction?.tr_type === "Material" &&
							transaction?.tr_format === "Hard Copy")
					}
				>
					<LoadingSpinner loading={btnLoading} />
					Mark as Utilized
				</Button>
			</div>
		</Modal>
	);
};

export default MarkUtilizedModal;
