"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Modal } from "./index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/tags/empty";
import { Checkbox } from "@/components/ui/checkbox";

import { FiSearch, FiCamera, FiUserPlus, FiChevronDown } from "react-icons/fi";

import { LoadingSpinner } from "@/components/loading";
import { useAlertActions } from "@/contexts/AlertContext";
import { useLoading } from "@/contexts/LoadingProvider";
import { ScannerModal } from "@/components/modal/scanner-modal";

import { getInactiveUserList } from "@/controller/firebase/get/getInactiveUser";
import { activateUsers } from "@/controller/firebase/update/updateActivateUsers";

export function ManualSearchModal({
	isOpen,
	onClose,
	userType,
	li_id,
	modifiedBy,
}) {
	const { setLoading, setPath, loading } = useLoading();
	const pathname = usePathname();
	const Alert = useAlertActions();
	const [btnLoading, setBtnLoading] = useState(false);

	const [userData, setUserData] = useState([]);
	const [selectedAccounts, setSelectedAccounts] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedStatus, setSelectedStatus] = useState("All");
	const [selectedType, setSelectedType] = useState("All");

	//SCANNER
	const [isScannerOpen, setIsScannerOpen] = useState(false);

	const handleSelectAccount = (account) => {
		setSelectedAccounts((prev) => {
			const exists = prev.find((item) => item.us_id === account?.us_id);
			return exists
				? prev.filter((item) => item.us_id !== account?.us_id)
				: [...prev, account];
		});
	};

	const handleAddSelected = async () => {
		if (li_id) {
			await activateUsers(
				li_id,
				modifiedBy,
				selectedAccounts,
				setBtnLoading,
				Alert
			);
			setUserData([]);
			setSelectedAccounts([]);
			onClose();
		}
	};

	useEffect(() => {
		if (!isOpen) return;

		setPath(pathname);
		const unsubscribe = getInactiveUserList(
			li_id,
			setUserData,
			searchQuery,
			userType,
			selectedType,
			selectedStatus,
			setLoading,
			Alert
		);

		return () => {
			if (unsubscribe) unsubscribe();
		};
	}, [searchQuery, selectedType, selectedStatus, userType, isOpen]);

	useEffect(() => {
		setUserData([]);
		setSelectedAccounts([]);
		setSelectedType("All");
		setSelectedStatus("All");
	}, [isOpen]);

	if (!isOpen) return null;
	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				title="Add Existing Account"
				size="xl"
			>
				<div className="p-6">
					<div className="flex items-center gap-4 mb-6 justify-between">
						<div
							className={`relative flex-1 ${
								userType === "patron" ? "max-w-sm" : "max-w-lg"
							}`}
						>
							<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
							<Input
								placeholder="Search users..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10 pr-10 h-9 bg-background border-none text-foreground rounded-md shadow-sm"
								style={{ fontSize: "12px" }}
							/>
							<div className="absolute right-0 top-0 h-full flex items-center gap-1 pr-2">
								{/* User Type Filter */}
								<div className="relative">
									<select
										value={selectedType}
										onChange={(e) => setSelectedType(e.target.value)}
										className="h-full pl-2 pr-6 text-xs border-l border-border focus:outline-none bg-background appearance-none text-[12px]"
									>
										{userType === "patron" ? (
											<>
												<option value="All">All Type</option>
												<optgroup label="Patrons">
													<option value="Student">Student</option>
													<option value="Faculty">Faculty</option>
													<option value="Administrator">Administrator</option>
												</optgroup>
											</>
										) : (
											<>
												<option value="All">All Type</option>
												<optgroup label="Assistants">
													<option value="Student Assistant">
														Student Assistant
													</option>
													<option value="Administrative Assistant">
														Administrative Assistant
													</option>
												</optgroup>
												<optgroup label="Librarians">
													<option value="Chief Librarian">
														Chief Librarian
													</option>
													<option value="Head Librarian">Head Librarian</option>
												</optgroup>
											</>
										)}
									</select>
									<FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-muted-foreground w-4 h-4" />
								</div>

								{/* Status Filter */}
								{userType !== "patron" && (
									<div className="relative">
										<select
											value={selectedStatus}
											onChange={(e) => setSelectedStatus(e.target.value)}
											className="h-full pl-2 pr-6 text-xs border-l border-border focus:outline-none bg-background appearance-none text-[12px]"
										>
											<option value="All">All</option>
											<option value="Active">Active</option>
											<option value="Inactive">Inactive</option>
										</select>
										<FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-muted-foreground w-4 h-4" />
									</div>
								)}
							</div>
						</div>

						<Button
							onClick={() => setIsScannerOpen(true)}
							variant="outline"
							className="bg-transparent border-border hover:bg-accent text-foreground h-10 w-fit text-[12px]"
						>
							<FiCamera className="w-4 h-4 mr-2" />
							Switch to Scanner
						</Button>
					</div>

					<div className="flex items-center justify-between mb-4">
						<p className="text-primary text-[12px]">
							{userData?.length} accounts found
							{selectedAccounts.length > 0 &&
								` • ${selectedAccounts.length} selected`}
						</p>

						{selectedAccounts.length > 0 && (
							<Button
								onClick={handleAddSelected}
								className="bg-primary-custom hover:bg-secondary-custom text-white h-9 w-fit text-[12px]"
							>
								{!btnLoading ? (
									<FiUserPlus className="w-4 h-4 mr-2" />
								) : (
									<LoadingSpinner loading={btnLoading} />
								)}
								Add Selected ({selectedAccounts.length})
							</Button>
						)}
					</div>

					<div className="space-y-3  overflow-x-auto">
						<table className="w-full">
							<thead className="bg-muted/100">
								<tr className="border-b border-border">
									{[
										<Checkbox
											checked={
												selectedAccounts.length === userData?.length
													? true
													: selectedAccounts.length > 0
													? "indeterminate"
													: false
											}
											onCheckedChange={(checked) => {
												if (checked === true) {
													setSelectedAccounts(userData);
												} else {
													setSelectedAccounts([]);
												}
											}}
										/>,
										"Avatar",
										"Fullname",
										"Status",
										"User Type",
										"School ID",
										"Email",
										"Section",
										"Year",
										"Program",
										"Institute",
									].map((header) => (
										<th
											key={header}
											className="text-left py-4 px-6 font-semibold text-foreground text-[12px]"
										>
											{header}
										</th>
									))}
								</tr>
							</thead>
							<tbody className="align-top">
								{userData?.map((account, index) => (
									<tr
										key={index}
										className={`border-b border-border hover:bg-accent/30 transition-colors ${
											index % 2 === 0 ? "bg-background" : "bg-muted/10"
										}`}
									>
										<td className="py-4 px-6">
											<Checkbox
												checked={
													!!selectedAccounts.find(
														(a) => a.us_id === account?.us_id
													)
												}
												onCheckedChange={() => handleSelectAccount(account)}
											/>
										</td>
										<td className="py-4 px-6 flex">
											<img
												src={account?.us_photoURL || "/placeholder.svg"}
												alt="avatar"
												className="w-12 h-12 rounded-full object-cover bg-gray-100 flex-shrink-0"
											/>
										</td>
										<td className="py-4 px-6 min-w-[200px] text-[12px] text-foreground font-medium">
											{account?.us_name}
										</td>
										<td className="py-4 px-6 min-w-[200px] text-[12px] text-foreground">
											<Badge
												className={getStatColor(account?.us_status)}
												style={{ fontSize: "10px" }}
											>
												{account?.us_status}
											</Badge>
										</td>
										<td className="py-4 px-6 min-w-[200px] text-[12px] text-foreground">
											<Badge
												className={getTypeColor(account?.us_type)}
												style={{ fontSize: "10px" }}
											>
												{account?.us_type}
											</Badge>
										</td>
										<td className="py-4 px-6 min-w-[150px] text-[12px] text-foreground">
											{account?.us_schoolID}
										</td>
										<td className="py-4 px-6 min-w-[150px] text-[12px] text-foreground">
											{account?.us_email}
										</td>
										<td className="py-4 px-6 min-w-[150px] text-[12px] text-foreground">
											{account?.us_section}
										</td>
										<td className="py-4 px-6 min-w-[150px] text-[12px] text-foreground">
											{account?.us_year}
										</td>
										<td className="py-4 px-6 min-w-[150px] text-[12px] text-foreground">
											{account?.us_program}
										</td>
										<td className="py-4 px-6 min-w-[150px] text-[12px] text-foreground">
											{account?.us_institute}
										</td>
									</tr>
								))}
							</tbody>
						</table>

						<EmptyState data={userData} loading={loading} />
					</div>
				</div>
			</Modal>

			<ScannerModal
				isOpen={isScannerOpen}
				onClose={() => setIsScannerOpen(false)}
				setResult={setSearchQuery}
				allowedPrefix="USR"
			/>
		</>
	);
}

const getTypeColor = (type) => {
	switch (type) {
		case "Student":
			return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
		case "Faculty":
			return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
		default:
			return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
	}
};

const getStatColor = (type) => {
	switch (type) {
		case "Active":
			return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
		default:
			return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
	}
};
