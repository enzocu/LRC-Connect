"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmptyState from "@/components/tags/empty";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { Modal } from "@/components/modal";
import { PenaltyActionModal } from "@/components/modal/penalty-action-modal";
import {
	renderPatron,
	renderResource,
	renderSchedule,
} from "@/components/tags/transaction";

import { useLoading } from "@/contexts/LoadingProvider";
import { LoadingSpinner } from "@/components/loading";

import { getReportListRealtime } from "../../controller/firebase/get/getReportList";
import { updateReportStatus } from "../../controller/firebase/update/updateReport";

export function PenaltyListModal({
	isOpen,
	onClose,
	patronId,
	userDetails,
	Alert,
}) {
	const pathname = usePathname();
	const { setLoading, setPath, loading } = useLoading();
	const [btnLoading, setBtnLoading] = useState(false);
	const [btnLoadingType, setBtnLoadingType] = useState("");

	const [activeTab, setActiveTab] = useState("Active");

	const [selectedPenalties, setSelectedPenalties] = useState([]);
	const [reportData, setReportData] = useState([]);
	const [selectedPenalty, setSelectedPenalty] = useState(null);
	const [showActionModal, setShowActionModal] = useState(false);

	//LEVEL
	const [isPersonnel, setIsPersonnel] = useState(false);

	//FILTER
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedType, setSelectedType] = useState("");

	const handleSelectAll = (checked) => {
		if (checked) {
			setSelectedPenalties(reportData?.map((p) => p.id));
		} else {
			setSelectedPenalties([]);
		}
	};

	const handleSelectPenalty = (penaltyId, checked) => {
		if (checked) {
			setSelectedPenalties([...selectedPenalties, penaltyId]);
		} else {
			setSelectedPenalties(selectedPenalties.filter((id) => id !== penaltyId));
		}
	};

	const handleStatus = async (status, report, reportID) => {
		if (reportID.length === 0 || !userDetails || !userDetails?.uid) return;
		setBtnLoadingType(status);
		await updateReportStatus(
			userDetails?.us_liID,
			userDetails?.uid,
			status,
			report,
			reportID,
			setBtnLoading,
			Alert
		);
		setSelectedPenalties([]);
		setBtnLoadingType("");
	};

	const handleActionClick = (report) => {
		setSelectedPenalty(report);
		setShowActionModal(true);
	};

	useEffect(() => {
		setIsPersonnel(!["USR-5", "USR-6"].includes(userDetails?.us_level));
	}, [userDetails]);

	useEffect(() => {
		let unsubscribe;
		setPath(pathname);

		if (isOpen && userDetails && userDetails?.us_liID) {
			unsubscribe = getReportListRealtime(
				!["USR-5", "USR-6"].includes(userDetails?.us_level),
				patronId,
				userDetails?.us_liID,
				activeTab,
				searchQuery,
				selectedType,
				setReportData,
				setLoading,
				Alert
			);
		}

		return () => {
			if (unsubscribe) {
				unsubscribe();
			}
		};
	}, [isOpen, userDetails, activeTab, searchQuery, selectedType]);

	if (!isOpen) return;
	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				title="List of Penalties"
				size="xxl"
			>
				<div className="flex flex-col h-full max-h-[90vh]">
					<div className="flex items-center flex-1 px-6 pt-6">
						<div className="relative flex-1 max-w-md">
							<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />

							<Input
								placeholder="Search transaction by QR..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10 pr-28 h-9 bg-background border-none text-foreground rounded-md shadow-sm"
								style={{ fontSize: "12px" }}
							/>

							<div className="absolute right-0 top-0 h-full flex items-center pr-2">
								<div className="relative">
									<select
										value={selectedType}
										onChange={(e) => setSelectedType(e.target.value)}
										className="h-full pl-2 pr-6 text-xs rounded-l-none border-l border-border focus:outline-none bg-background appearance-none text-[12px]"
									>
										<option disabled>Filter</option>
										<option value="">All Resource Types</option>
										<option value="Material">Material</option>
										<option value="Discussion Room">Discussion Room</option>
										<option value="Computer">Computer</option>
									</select>
									<FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-muted-foreground w-4 h-4" />
								</div>
							</div>
						</div>
					</div>

					<div className="flex-1">
						<Tabs
							value={activeTab}
							onValueChange={setActiveTab}
							className="h-full flex flex-col"
						>
							<div className="px-6 pt-6 mb-2">
								<TabsList className="grid w-full grid-cols-3">
									<TabsTrigger value="Active" className="text-[12px]">
										Active Penalty
									</TabsTrigger>
									<TabsTrigger value="Settled" className="text-[12px]">
										Penalty History
									</TabsTrigger>
									<TabsTrigger value="Waived" className="text-[12px]">
										Waived List
									</TabsTrigger>
								</TabsList>
							</div>

							<TabsContent
								value={activeTab}
								className="flex-1 px-6 pb-6 overflow-hidden"
							>
								<div className="space-y-4 h-full flex flex-col">
									{isPersonnel && selectedPenalties.length > 0 && (
										<div className="flex justify-end gap-4">
											<Button
												onClick={() =>
													handleStatus("Settled", reportData, selectedPenalties)
												}
												className="flex items-center gap-2 h-10 text-[12px]"
											>
												{btnLoadingType === "Settled" && (
													<LoadingSpinner loading={btnLoading} />
												)}
												Mark As Settled ({selectedPenalties.length})
											</Button>

											<Button
												onClick={() =>
													handleStatus("Waived", reportData, selectedPenalties)
												}
												variant="destructive"
												className="flex items-center gap-2 h-10 text-[12px]"
											>
												{btnLoadingType === "Waived" && (
													<LoadingSpinner loading={btnLoading} />
												)}
												Waive Selected ({selectedPenalties.length})
											</Button>
										</div>
									)}

									<PenaltyTable
										isPersonnel={isPersonnel}
										userDetails={userDetails}
										activeTab={activeTab}
										reportData={reportData}
										selectedPenalties={selectedPenalties}
										handleSelectAll={handleSelectAll}
										handleSelectPenalty={handleSelectPenalty}
										handleActionClick={handleActionClick}
									/>

									<EmptyState data={reportData} loading={loading} />
								</div>
							</TabsContent>
						</Tabs>
					</div>
				</div>
			</Modal>
			<PenaltyActionModal
				isOpen={showActionModal}
				onClose={() => setShowActionModal(false)}
				reportData={selectedPenalty}
				userDetails={userDetails}
				Alert={Alert}
			/>
		</>
	);
}

const PenaltyTable = ({
	isPersonnel,
	userDetails,
	activeTab,
	reportData,
	selectedPenalties,
	handleSelectAll,
	handleSelectPenalty,
	handleActionClick,
}) => {
	const getColumns = () => {
		const common = [
			"Transaction",
			"Resource Details",
			...(isPersonnel ? ["Patron Details"] : []),
			"Schedule",
			"Reason",
			"Action to Take",
			"Deadline",
		];
		switch (activeTab) {
			case "Active":
				return [
					...(isPersonnel && ["USR-2", "USR-3"].includes(userDetails?.us_level)
						? ["Check Box"]
						: []),
					...common,
					...(isPersonnel && ["USR-2", "USR-3"].includes(userDetails?.us_level)
						? ["Actions"]
						: []),
				];
			case "Settled":
				return [
					...common.slice(0, 3),
					"Personnel Details",
					...common.slice(3),
					"Settlement Date",
				];
			case "Waived":
				return [
					...common.slice(0, 3),
					"Personnel Details",
					...common.slice(3),
					"Date Waived",
				];
			default:
				return [];
		}
	};

	const columns = getColumns();

	return (
		<div className="flex-1 overflow-auto border border-border rounded-lg">
			<table className="w-full">
				<thead className="bg-muted/30 sticky top-0">
					<tr className="border-b border-border">
						{columns.map((col, idx) => (
							<th
								key={idx}
								className="text-left py-4 px-6 font-semibold text-foreground text-[12px]"
							>
								{col === "Check Box" ? (
									<Checkbox
										checked={
											selectedPenalties.length === reportData?.length &&
											reportData?.length > 0
										}
										onCheckedChange={(checked) => handleSelectAll(checked)}
									/>
								) : (
									col
								)}
							</th>
						))}
					</tr>
				</thead>
				<tbody className="align-top">
					{reportData?.map((report, index) => (
						<tr
							key={report.id}
							className={`border-b border-border hover:bg-accent/30 transition-colors ${
								index % 2 === 0 ? "bg-background" : "bg-muted/10"
							}`}
						>
							{columns.map((col, colIndex) => {
								switch (col) {
									case "Check Box":
										return (
											<td key={colIndex} className="py-4 px-6">
												<Checkbox
													checked={selectedPenalties.includes(report?.id)}
													onCheckedChange={(checked) =>
														handleSelectPenalty(report?.id, checked)
													}
												/>
											</td>
										);
									case "Transaction":
										return (
											<td key={colIndex} className="py-4 px-6 min-w-[150px]">
												<p className="font-medium text-foreground text-[12px]">
													{report.tr_qr}
												</p>
												<p className="text-muted-foreground mb-2 text-[12px]">
													{report?.tr_createdAt}
												</p>
											</td>
										);
									case "Resource Details":
										return (
											<td key={colIndex} className="py-4 px-6 min-w-[400px]">
												{renderResource(report, true)}
											</td>
										);
									case "Patron Details":
										return (
											<td
												key={colIndex}
												className="py-4 px-6 min-w-[200px] text-[11px]"
											>
												{report?.tr_patron
													? renderPatron(report.tr_patron, true)
													: "No patron details available."}
											</td>
										);

									case "Personnel Details":
										return (
											<td
												key={colIndex}
												className="py-4 px-6 min-w-[200px] text-[11px]"
											>
												{renderPatron(report?.tr_personnel, true) ||
													"No personnel assigned."}
											</td>
										);
									case "Schedule":
										return (
											<td key={colIndex} className="py-4 px-6 min-w-[250px]">
												{renderSchedule(report)}
											</td>
										);
									case "Reason":
										return (
											<td
												key={colIndex}
												className="py-4 px-6 min-w-[350px] text-[12px]"
											>
												<ul className="list-disc pl-4">
													{report?.re_remarks.map((remark, i) => (
														<li key={i}>{remark}</li>
													))}
												</ul>
											</td>
										);
									case "Action to Take":
										return (
											<td
												key={colIndex}
												className="py-4 px-6 min-w-[200px] text-[12px] text-foreground"
											>
												{report?.re_instruction || "No instruction provided."}
											</td>
										);
									case "Deadline":
										return (
											<td
												key={colIndex}
												className="py-4 px-6 min-w-[150px] text-[12px] text-foreground"
											>
												{report?.re_deadline || "No deadline."}
											</td>
										);
									case "Settlement Date":
									case "Date Waived":
										return (
											<td
												key={colIndex}
												className="py-4 px-6 text-[12px]  min-w-[150px] text-foreground"
											>
												{report?.re_dateSettled || report?.tr_dateWaived || "—"}
											</td>
										);
									case "Actions":
										return (
											<td key={colIndex} className="py-4 px-6">
												<Button
													onClick={() => handleActionClick(report)}
													variant="outline"
													size="sm"
													className="h-9 px-2 text-[12px]"
												>
													Take Action
												</Button>
											</td>
										);
									default:
										return null;
								}
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};
