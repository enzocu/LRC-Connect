"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/tags/empty";
import { FiUpload, FiFileText, FiRefreshCw } from "react-icons/fi";

import { getStatusColor } from "@/controller/custom/getStatusColor";
import { processExcelFile } from "@/controller/custom/processExcelFile";
import { useAlertActions } from "@/contexts/AlertContext";
import { insertUserExcel } from "@/controller/firebase/insert/insertUserExcel";

export function ExcelImportModal({ isOpen, onClose, li_id, modifiedBy }) {
	const Alert = useAlertActions();
	const [step, setStep] = useState("upload");
	const [selectedFile, setSelectedFile] = useState(null);
	const [btnLoading, setBtnloading] = useState(false);
	const [userData, setUserData] = useState([]);
	const [selectedAccounts, setSelectedAccounts] = useState([]);

	const handleFileSelect = (event) => {
		const file = event.target.files?.[0];
		if (file) setSelectedFile(file);
	};

	const excelHeader = [
		"School ID",
		"Status",
		"Type",
		"First Name",
		"Middle Name",
		"Last Name",
		"Suffix",
		"Sex",
		"Birthday",
		"Email",
		"Phone Number",
		"Street",
		"Barangay",
		"Municipal",
		"Province",
		"Courses",
		"Year",
		"Tracks",
		"Strand",
		"Institute",
		"Program",
		"Section",
	];

	const handleImport = async () => {
		if (li_id) {
			await insertUserExcel(
				li_id,
				modifiedBy,
				selectedAccounts,
				setBtnloading,
				Alert
			);
			handleClose();
		}
	};

	const handleProcessFile = async () => {
		if (!selectedFile) return;
		processExcelFile(
			selectedFile,
			excelHeader,
			setUserData,
			setSelectedAccounts,
			setStep,
			setBtnloading,
			Alert
		);
	};

	const handleAccountToggle = (accountId) => {
		setSelectedAccounts((prev) => {
			const isSelected = prev.some((acc) => acc.us_schoolID === accountId);
			if (isSelected) {
				return prev.filter((acc) => acc.us_schoolID !== accountId);
			} else {
				const user = userData.find((u) => u.us_schoolID === accountId);
				return user ? [...prev, user] : prev;
			}
		});
	};

	const handleClose = () => {
		setStep("upload");
		setSelectedFile(null);
		setSelectedAccounts([]);
		setBtnloading(false);
		setUserData([]);
		onClose();
	};

	const isAllSelected =
		userData.length > 0 &&
		userData.every((acc) =>
			selectedAccounts.some((sel) => sel.us_schoolID === acc.us_schoolID)
		);

	const toggleSelectAll = (checked) => {
		if (checked) {
			setSelectedAccounts(userData);
		} else {
			setSelectedAccounts([]);
		}
	};

	const allHeaders = userData.length ? Object.keys(userData[0]) : [];

	if (!isOpen) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title="Import Patron from Excel"
			size="xl"
		>
			<div className="p-6">
				{step === "upload" && (
					<div className="space-y-6">
						<div className="text-center">
							<div className="mx-auto w-16 h-16 bg-primary-custom/10 rounded-full flex items-center justify-center mb-4">
								<FiFileText className="w-8 h-8 text-primary-custom" />
							</div>
							<h3 className="font-semibold text-foreground mb-2 text-[16px]">
								Upload Excel File
							</h3>
							<p className="text-muted-foreground text-[12px]">
								Select an Excel file (.xlsx, .xls) containing account
								information
							</p>
							<p className="text-muted-foreground text-[11px]">
								Excel files only (Max 10MB)
							</p>
							<Input
								type="file"
								accept=".xlsx,.xls"
								onChange={handleFileSelect}
								className="mt-4 cursor-pointer"
								style={{ fontSize: "12px" }}
							/>
						</div>

						{selectedFile && (
							<div className="bg-card border border-border rounded-lg p-4">
								<div className="flex items-center gap-3">
									<FiFileText className="w-5 h-5 text-primary-custom" />
									<div className="flex-1">
										<p className="font-medium text-foreground text-[12px]">
											{selectedFile.name}
										</p>
										<p className="text-muted-foreground text-[11px]">
											{(selectedFile.size / 1024 / 1024).toFixed(2)} MB
										</p>
									</div>
								</div>
							</div>
						)}

						<div className="flex gap-3 justify-end">
							<Button
								onClick={handleClose}
								variant="outline"
								className="h-10 w-fit text-[12px]"
							>
								Cancel
							</Button>
							<Button
								onClick={handleProcessFile}
								disabled={!selectedFile || btnLoading}
								className="bg-primary-custom hover:bg-secondary-custom text-white h-10 w-fit text-[12px]"
							>
								{btnLoading ? (
									<>
										<FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
										Processing...
									</>
								) : (
									<>
										<FiUpload className="w-4 h-4 mr-2" />
										Process File
									</>
								)}
							</Button>
						</div>
					</div>
				)}

				{step === "preview" && (
					<div className="space-y-6">
						{userData.length === 0 ? (
							<EmptyState data={userData} loading={btnLoading} />
						) : (
							<>
								<span className="text-foreground font-medium text-[12px]">
									{selectedAccounts.length} of {userData.length} valid accounts
									selected
								</span>

								<div className="border border-border rounded-lg max-h-96 overflow-auto">
									<table className="w-full table-auto">
										<thead>
											<tr className="border-b border-border bg-muted/50">
												<th className="py-3 px-4">
													<Checkbox
														checked={isAllSelected}
														onCheckedChange={toggleSelectAll}
													/>
												</th>
												{excelHeader.map((header) => (
													<th
														key={header}
														className="text-left py-4 px-6 font-semibold text-[12px] text-foreground"
													>
														{header}
													</th>
												))}
											</tr>
										</thead>
										<tbody>
											{userData.map((user, index) => {
												const isChecked = selectedAccounts.some(
													(sel) => sel.us_schoolID === user.us_schoolID
												);
												return (
													<tr
														key={index}
														className={`border-b border-border transition-colors ${
															index % 2 === 0 ? "bg-background" : "bg-muted/20"
														}`}
													>
														<td className="py-3 px-4">
															<Checkbox
																checked={isChecked}
																onCheckedChange={() =>
																	handleAccountToggle(user.us_schoolID)
																}
															/>
														</td>
														{allHeaders.map((key) => (
															<td
																key={key}
																className="py-4 px-6 text-[12px] min-w-[100px]"
															>
																{key === "us_status" ? (
																	<Badge
																		className={`${getStatusColor(user[key])}`}
																	>
																		{user[key]}
																	</Badge>
																) : key === "us_birthday" && user[key] ? (
																	(() => {
																		let formattedDate = "";

																		if (typeof user[key] === "number") {
																			const excelEpoch = new Date(1899, 11, 30);
																			const dateObj = new Date(
																				excelEpoch.getTime() +
																					user[key] * 86400000
																			);

																			formattedDate =
																				dateObj.toLocaleDateString("en-US", {
																					year: "numeric",
																					month: "short",
																					day: "numeric",
																				});
																		}

																		return formattedDate || user[key];
																	})()
																) : (
																	user[key]
																)}
															</td>
														))}
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>

								<div className="flex justify-end gap-3">
									<Button
										variant="outline"
										className="bg-transparent h-10 px-4 text-[12px]"
										onClick={() => setStep("upload")}
									>
										Back
									</Button>
									<Button
										className="bg-primary-custom hover:bg-secondary-custom text-white h-10 w-fit text-[12px]"
										onClick={handleImport}
										disabled={selectedAccounts.length === 0}
									>
										{btnLoading ? (
											<>
												<FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
												Processing registration...
											</>
										) : (
											<>
												<FiUpload className="w-4 h-4 mr-2" />
												Upload and Register
											</>
										)}
									</Button>
								</div>
							</>
						)}
					</div>
				)}
			</div>
		</Modal>
	);
}
