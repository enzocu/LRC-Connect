"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import Lottie from "lottie-react";
import successAnimation from "@/public/lottie/success.json";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import { LoadingSpinner } from "@/components/loading";

import { insertTransaction } from "@/controller/firebase/insert/insertTransaction";
export function ReservationSummaryModal({
	isOpen,
	onClose,
	transactionDetails,
	resourceType,
	resourceData,
	patronData,
}) {
	const router = useRouter();
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const [btnLoading, setBtnLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	const handleReserve = async () => {
		if (!userDetails.uid) null;

		await insertTransaction(
			userDetails.uid,
			resourceType,
			transactionDetails,
			resourceData,
			patronData,
			setBtnLoading,
			Alert,
			router,
			setSuccess
		);
	};

	if (!isOpen) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Reservation Review"
			size="md"
		>
			<>
				<div className="p-6 space-y-6">
					<div className="border-b border-border pb-6">
						<h3 className="font-medium text-foreground text-[16px] mb-4 leading-tight">
							Patron Details
						</h3>
						<div className="flex items-start gap-4">
							{renderPatronDetails(patronData)}
						</div>
					</div>

					<div>
						<h3 className="font-medium text-foreground text-[16px] mb-4">
							Resouces Details
						</h3>
						<div className="flex items-start gap-4">
							{renderResourceInfo(resourceType, resourceData)}
						</div>
					</div>

					<div className="space-y-3">
						<div className="flex justify-between items-center py-3 border-b border-border/50">
							<Label className="text-[12px] font-medium text-foreground sm:w-1/3 shrink-0">
								Library Call Number
							</Label>
							<p className="text-[12px] text-muted-foreground">
								{getLibraryCallNumber(resourceType, resourceData)}
							</p>
						</div>

						{resourceType === "Material" && (
							<>
								<div className="flex justify-between items-center py-3 border-b border-border/50">
									<Label className="text-[12px] font-medium text-foreground sm:w-1/3 shrink-0">
										Book Format
									</Label>
									<p className="text-[12px] text-muted-foreground">
										{transactionDetails?.format || "--"}
									</p>
								</div>
								<div className="flex justify-between items-center py-3 border-b border-border/50">
									<Label className="text-[12px] font-medium text-foreground sm:w-1/3 shrink-0">
										Material Type
									</Label>
									<p className="text-[12px] text-muted-foreground">
										{resourceData?.ma_materialType}
									</p>
								</div>
								<div className="flex justify-between items-center py-3 border-b border-border/50">
									<Label className="text-[12px] font-medium text-foreground sm:w-1/3 shrink-0">
										Shelf
									</Label>
									<p className="text-[12px] text-muted-foreground">
										{resourceData?.ma_shelf}
									</p>
								</div>
							</>
						)}

						{resourceType === "Discussion Room" && (
							<div className="flex justify-between items-center py-3 border-b border-border/50">
								<Label className="text-[12px] font-medium text-foreground sm:w-1/3 shrink-0">
									Capacity
								</Label>
								<p className="text-[12px] text-muted-foreground">
									{resourceData?.dr_capacity}
								</p>
							</div>
						)}

						{resourceType === "Computer" && (
							<div className="flex justify-between items-center py-3 border-b border-border/50">
								<Label className="text-[12px] font-medium text-foreground sm:w-1/3 shrink-0">
									Asset Tag
								</Label>
								<p className="text-[12px] text-muted-foreground">
									{resourceData?.co_assetTag}
								</p>
							</div>
						)}
					</div>

					<div className="space-y-4">
						<h3 className="font-medium text-foreground text-[16px]">
							Transaction
						</h3>

						<div className="space-y-3">
							{resourceType === "Material" ? (
								<>
									<div className="flex justify-between items-center py-3 border-b border-border/50">
										<Label className="text-[12px] font-medium text-foreground sm:w-1/3 shrink-0">
											Use Date
										</Label>
										<p className="text-[12px] text-muted-foreground">
											{formatDisplayDate(transactionDetails?.date) || "--"}
										</p>
									</div>
									<div className="flex justify-between items-center py-3 border-b border-border/50">
										<Label className="text-[12px] font-medium text-foreground sm:w-1/3 shrink-0">
											Date Due
										</Label>
										<p className="text-[12px] text-muted-foreground">
											{formatDisplayDate(transactionDetails?.dateDue) || "--"}
										</p>
									</div>
								</>
							) : (
								<>
									<div className="flex justify-between items-center py-3 border-b border-border/50">
										<Label className="text-[12px] font-medium text-foreground sm:w-1/3 shrink-0">
											Use Date
										</Label>
										<p className="text-[12px] text-muted-foreground">
											{formatDisplayDate(transactionDetails?.date) || "--"}
										</p>
									</div>
									<div className="flex justify-between items-center py-3 border-b border-border/50">
										<Label className="text-[12px] font-medium text-foreground sm:w-1/3 shrink-0">
											Session Start
										</Label>
										<p className="text-[12px] text-muted-foreground">
											{formatTime(transactionDetails?.sessionStart) || "--"}
										</p>
									</div>
									<div className="flex justify-between items-center py-3 border-b border-border/50">
										<Label className="text-[12px] font-medium text-foreground sm:w-1/3 shrink-0">
											Session End
										</Label>
										<p className="text-[12px] text-muted-foreground">
											{formatTime(transactionDetails?.sessionEnd) || "--"}
										</p>
									</div>
								</>
							)}

							<div className="flex justify-between items-center py-3 border-b border-border/50">
								<Label className="text-[12px] font-medium text-foreground sm:w-1/3 shrink-0">
									Transaction Date
								</Label>
								<p className="text-[12px] text-muted-foreground">
									{new Date().toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
										year: "numeric",
									})}{" "}
									{new Date().toLocaleTimeString("en-US", {
										hour: "numeric",
										minute: "2-digit",
									})}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-red-50 border border-red-200 rounded-lg p-4">
						<p className="text-[11px]">
							<span className="font-semibold text-red-600">Note:</span>{" "}
							<span className="text-red-700">
								Reserved resource may be{" "}
								<span className="font-medium">cancelled or reassigned</span> if
								not claimed on time. All reservations follow a first-come,
								first-served policy.
							</span>
						</p>
					</div>

					<div className="flex gap-3 justify-end">
						<Button
							onClick={() => onClose()}
							variant="outline"
							className="bg-transparent h-10 px-4 text-[12px]"
						>
							Cancel
						</Button>
						<Button
							onClick={handleReserve}
							className="w-fit bg-primary-custom hover:bg-secondary-custom text-white h-10 font-medium text-[12px] "
						>
							<LoadingSpinner loading={btnLoading} />
							Reserve
						</Button>
					</div>
				</div>
				{success && (
					<div className="loading-container">
						<Lottie animationData={successAnimation} loop={true} />
					</div>
				)}
			</>
		</Modal>
	);
}

export const getLibraryCallNumber = (resourceType, resourceDetails) => {
	if (!resourceDetails) return null;

	switch (resourceType) {
		case "Material":
			return resourceDetails.ma_callNumber || resourceDetails.ma_qr;
		case "Discussion Room":
			return resourceDetails.dr_qr || null;
		case "Computer":
			return resourceDetails.co_qr || null;
		default:
			return null;
	}
};

export const renderResourceInfo = (resourceType, resourceData) => {
	const getImage = () => {
		if (resourceType === "Material") return resourceData?.ma_coverURL;
		if (resourceType === "Discussion Room") return resourceData?.dr_photoURL;
		if (resourceType === "Computer") return resourceData?.co_photoURL;
		return null;
	};

	const getTitle = () => {
		if (resourceType === "Material") return resourceData?.ma_title || "--";
		if (resourceType === "Discussion Room")
			return resourceData?.dr_name || "--";
		if (resourceType === "Computer") return resourceData?.co_name || "--";
		return "--";
	};

	const getSubtitle = () => {
		if (resourceType === "Material") return resourceData?.ma_author || "--";
		if (resourceType === "Discussion Room") {
			const date = resourceData?.dr_createdAt?.toDate?.();
			return date ? format(date, "MMM d, yyyy") : "--";
		}
		if (resourceType === "Computer") {
			const date = resourceData?.co_createdAt?.toDate?.();
			return date ? format(date, "MMM d, yyyy") : "--";
		}
		return "--";
	};

	const imageSizeClass =
		resourceType === "Material" ? "w-20 h-28" : "w-28 h-28";

	return (
		<>
			<div className="flex-shrink-0">
				<img
					src={getImage() || "/placeholder.svg"}
					alt={getTitle()}
					className={`${imageSizeClass} object-cover rounded-md border shadow-sm`}
				/>
			</div>
			<div className="flex-1 space-y-3">
				<div>
					<h4 className="font-medium text-foreground text-[14px]">
						{getTitle()}
					</h4>
					<p className="text-muted-foreground text-[12px] mb-2">
						{getSubtitle()}
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[11px]">
						{resourceType}
					</span>
				</div>
			</div>
		</>
	);
};

export const renderPatronDetails = (user) => {
	if (!user) return null;

	const fullName = `${user.us_lname}, ${user.us_fname} ${user.us_mname || ""} ${
		user.us_suffix || ""
	}`.trim();

	return (
		<div className="flex items-start gap-4">
			<div className="flex-shrink-0">
				<img
					src={user.us_photoURL || "/placeholder-user.jpg"}
					alt={fullName}
					className="w-20 h-20 rounded-full object-cover bg-gray-100 flex-shrink-0"
				/>
			</div>

			<div>
				<h4 className="font-medium text-foreground text-[14px]">{fullName}</h4>
				<p className="text-primary-custom text-[12px] mb-2">
					{user.us_type}
					<span className="text-muted-foreground">
						{" • "}
						{user.us_schoolID}
					</span>
				</p>

				<div>
					<p className="text-foreground text-[12px]">Email</p>
					<p className="text-muted-foreground text-[12px]">
						{user.us_email || "NA"}
					</p>
				</div>
			</div>
		</div>
	);
};

export function formatDisplayDate(date) {
	if (!date || !(date instanceof Date)) return "--";

	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export const formatTime = (time) => {
	if (!time || typeof time !== "string" || !time.includes(":")) return "--";

	const [hourStr, minute] = time.split(":");
	let hour = parseInt(hourStr, 10);

	if (isNaN(hour) || isNaN(parseInt(minute, 10))) return "--";

	const ampm = hour >= 12 ? " pm" : " am";
	hour = hour % 12 || 12;

	return `${hour}:${minute}${ampm}`;
};
