"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import GenerateQrBarcode from "@/components/generateCode";

import {
	ArrowLeft,
	Check,
	ClipboardList,
	Zap,
	X,
	ExternalLink,
	BookOpen,
	Headphones,
} from "lucide-react";
import {
	FiBarChart,
	FiBookOpen,
	FiDownload,
	FiUser,
	FiX,
} from "react-icons/fi";

import { useAlertActions } from "@/contexts/AlertContext";
import { useLoading } from "@/contexts/LoadingProvider";
import { getTransactionDetails } from "../../../controller/firebase/get/getTransactionDetails";

export default function TransactionDetailsPage() {
	const router = useRouter();
	const pathname = usePathname();
	const { setLoading, setPath } = useLoading();
	const Alert = useAlertActions();
	const searchParams = useSearchParams();
	const id = searchParams.get("id");

	const [transactionData, setTransactionData] = useState({});
	const qrRef = useRef(null);

	useEffect(() => {
		if (!id) return;
		setPath(pathname);
		getTransactionDetails(id, setTransactionData, setLoading, Alert);
	}, [id]);

	return (
		<div className="min-h-screen bg-background transition-colors duration-300">
			<Header />

			<main className="pt-28 pb-6 px-6 sm:px-6 md:px-16 lg:px-[100px] xl:px-[150px]">
				<div className="mb-6">
					<button
						onClick={() => router.push(`/transaction`)}
						className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit text-[11px]"
					>
						<ArrowLeft className="w-3 h-3" />
						Back to Transaction
					</button>
				</div>

				<div className="animate-slide-up flex items-start justify-between mb-8">
					<div>
						<h1 className="font-semibold text-foreground text-[20px]">
							Transaction Details
						</h1>
						<p className="text-muted-foreground text-[14px]">
							Complete information about transaction {transactionData?.tr_qr}
						</p>
					</div>

					{transactionData?.tr_type === "Material" && (
						<div className="flex items-center gap-2">
							{[
								{
									text: "Read Now",
									icon: <BookOpen size={14} color="#fff" />,
									color: "bg-green-600 hover:bg-green-700",
									format: "Soft Copy",
								},
								{
									text: "Listen Now",
									icon: <Headphones size={14} color="#fff" />,
									color: "bg-blue-600 hover:bg-blue-700",
									format: "Audio Copy",
								},
							].map(({ text, icon, color, format }) => {
								const enabled =
									transactionData?.tr_status === "Utilized" &&
									transactionData?.tr_format === format;
								return (
									<Button
										onClick={() => router.push(`/transaction/view?id=${id}`)}
										key={text}
										className={`h-9 ${color} text-white border-none flex items-center gap-1 text-[12px] ${
											enabled ? "shimmer" : ""
										}`}
										disabled={!enabled}
									>
										{icon} {text}
									</Button>
								);
							})}
						</div>
					)}
				</div>

				{/* Main Content */}
				<div className="animate-slide-up-delay-1 grid grid-cols-1 lg:grid-cols-3 gap-14">
					<div className="lg:col-span-2">
						<Card className="bg-card border-border overflow-hidden">
							<CardContent className="p-0">
								{TransactionStatusBar(transactionData?.tr_status)}

								<div className="border-t border-border"></div>

								{TransactionDetailsCard(transactionData)}

								<div className="border-t border-border"></div>

								{renderResourceDetails(transactionData, router)}

								<div className="border-t border-border"></div>

								{renderPatronDetails(transactionData, router)}

								{renderCancellationDetails(transactionData)}
							</CardContent>
						</Card>
					</div>

					<div className="space-y-6">
						<Card className="bg-card border-border overflow-hidden">
							<CardHeader className="pb-4">
								<h2 className="font-semibold text-foreground text-[16px] flex items-center gap-2">
									Transaction QR Code
								</h2>
							</CardHeader>
							<CardContent className="pt-0">
								<div className="text-center">
									<div className="w-48 h-48 mx-auto mb-4 bg-white rounded-lg border border-border  flex items-center justify-center">
										<GenerateQrBarcode
											ref={qrRef}
											value={transactionData?.tr_qr}
											type="qr"
										/>
									</div>
									<p className="text-muted-foreground mb-4 text-[12px]">
										Scan this QR code to quickly access transaction details
									</p>
									<Button
										variant="outline"
										size="sm"
										className="w-full h-9 border-border text-foreground hover:bg-accent bg-transparent text-[12px]"
										onClick={() => qrRef.current?.download()}
									>
										<FiDownload className="w-3 h-3 mr-1" />
										Download QR Code
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</main>
		</div>
	);
}

export function TransactionStatusBar(status) {
	const statusConfig = {
		Reserved: {
			icon: ClipboardList,
			description: "Transaction created",
		},
		Utilized: {
			icon: Zap,
			description: "Resource in use",
		},
		Cancelled: {
			icon: X,
			description: "Transaction cancelled",
		},
		Completed: {
			icon: Check,
			description: "Transaction finished",
		},
	};

	const getColorClass = (key, status) => {
		if (key == "Cancelled" && status === "Cancelled") {
			return {
				container: "bg-red-50 text-red-700 border border-red-500",
				iconBg: "bg-red-200",
				iconColor: "text-red-700",
				label: "text-red-700",
				desc: "text-red-500",
			};
		}

		const shouldHighlightPrimary =
			(status === "Completed" &&
				["Reserved", "Utilized", "Completed"].includes(key)) ||
			(status === "Utilized" && ["Reserved", "Utilized"].includes(key)) ||
			(status === "Cancelled" && key === "Reserved") ||
			(status === "Reserved" && key === "Reserved");

		if (shouldHighlightPrimary) {
			return {
				container: "bg-primary-custom text-white shadow-sm",
				iconBg: "bg-white/20",
				iconColor: "text-white",
				label: "text-white",
				desc: "text-white/80",
			};
		}

		return {
			container: "bg-background text-foreground border border-border",
			iconBg: "bg-background",
			iconColor: "text-muted-foreground",
			label: "text-foreground",
			desc: "text-muted-foreground",
		};
	};

	return (
		<div className="p-6">
			<h2 className="font-semibold text-foreground text-[16px] flex items-center gap-2 mb-4">
				<FiBarChart className="w-4 h-4" />
				Transaction Status
			</h2>

			<div className="flex items-center gap-4  overflow-x-auto">
				{Object.entries(statusConfig).map(([key, config]) => {
					const IconComponent = config.icon;
					const color = getColorClass(key, status);
					const isActive = key === status;

					return (
						<div
							key={key}
							className={`flex items-center gap-2 px-4 py-3 rounded-md transition-all duration-200 min-w-fit flex-shrink-0 ${color.container}`}
						>
							<div
								className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${color.iconBg}`}
							>
								<IconComponent className={`w-4 h-4 ${color.iconColor}`} />
							</div>
							<div className="text-left">
								<p className={`font-medium text-[14px] ${color.label}`}>
									{key}
								</p>
								<p className={` text-[12px] ${color.desc}`}>
									{config.description}
								</p>
							</div>
							{isActive && (
								<div className="w-2 h-2 bg-foreground rounded-full animate-pulse ml-1"></div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

export function TransactionDetailsCard(transaction) {
	return (
		<div className="p-6">
			<h2 className="font-semibold text-foreground text-[16px] flex items-center gap-2 mb-4">
				<div className="flex items-start gap-2">
					<FiBookOpen className="w-4 h-4 flex-shrink-0 mt-1" />
					{transaction?.tr_library || "Library"} {" • "}
					{transaction?.tr_schoolName || "School Name"}
				</div>
			</h2>

			<div className="flex flex-wrap gap-8">
				{transaction?.tr_type === "Material" &&
					transaction?.tr_format === "Hard Copy" &&
					transaction?.tr_accession && (
						<div className="flex flex-col">
							<Label className="text-foreground text-[14px]">
								{transaction?.tr_accession || "NA"}
							</Label>
							<p className="text-muted-foreground text-[12px]">
								Accession Number
							</p>
						</div>
					)}
				<div className="flex flex-col">
					<Label className="text-foreground text-[14px]">
						{transaction?.tr_dateFormatted || "NA"}
					</Label>
					<p className="text-muted-foreground text-[12px]">Use Date</p>
				</div>

				{transaction?.tr_type === "Material" && (
					<div className="flex flex-col">
						<Label className="text-foreground text-[14px]">
							{transaction?.tr_dateDueFormatted || "NA"}
						</Label>
						<p className="text-muted-foreground text-[12px]">
							{transaction?.tr_pastDueDate?.length > 0
								? "Renewed Due Date"
								: "Due Date"}
						</p>
					</div>
				)}

				{transaction?.tr_type === "Material" &&
					transaction?.tr_pastDueDate?.length > 0 && (
						<div className="relative group inline-block">
							<div className="flex flex-col">
								<Label className="text-foreground text-[14px]">
									{transaction?.tr_pastDueDate?.length || "0"}
									{transaction?.tr_pastDueDate?.length === 1
										? " Count"
										: " Counts"}
								</Label>
								<p className="text-muted-foreground text-[12px]">
									Previous Due Date
									{transaction?.tr_pastDueDate?.length > 1 && "s"}
								</p>
							</div>

							{/* Tooltip */}
							<div
								className={`absolute top-full right-0 mt-2 px-3 py-2 bg-white dark:bg-[#1e1e1e] text-gray-700 dark:text-gray-200 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-64 shadow-md border border-border`}
							>
								<div className="font-semibold mb-1">
									Previous Due Date
									{transaction?.tr_pastDueDate.length > 1 && "s"}
								</div>
								<div className="text-[11px] space-y-1">
									{transaction?.tr_pastDueDate.map((label, idx) => (
										<p key={idx}>• {label}</p>
									))}
								</div>

								<div className="absolute -top-2 right-4 transform border-4 border-transparent border-b-white dark:border-b-[#1e1e1e]"></div>
							</div>
						</div>
					)}

				{["Computer", "Discussion Room"].includes(transaction?.tr_type) && (
					<div className="flex flex-col">
						<Label className="text-foreground text-[14px]">
							{transaction?.tr_sessionStartFormatted || "NA"} {" - "}
							{transaction?.tr_sessionEndFormatted || "NA"}
						</Label>
						<p className="text-muted-foreground text-[12px]">
							Session Start - End
						</p>
					</div>
				)}

				<div className="flex flex-col">
					<Label className="text-foreground text-[14px]">
						{transaction?.tr_createdAt || "NA"}
					</Label>
					<p className="text-muted-foreground text-[12px]">Transaction Date</p>
				</div>

				{transaction?.tr_status == "Cancelled" && (
					<div className="flex flex-col">
						<Label className="text-foreground text-[14px]">
							{transaction?.tr_updatedAtFormmated}
						</Label>
						<p className="text-muted-foreground text-[12px]">Cancelled Date</p>
					</div>
				)}

				{transaction?.tr_status == "Completed" && (
					<div className="flex flex-col">
						<Label className="text-foreground text-[14px]">
							{transaction?.tr_actualEndFormmated}
						</Label>
						<p className="text-muted-foreground text-[12px]">Actual End Date</p>
					</div>
				)}
			</div>
		</div>
	);
}

const renderResourceDetails = (transaction, router) => {
	return (
		<div className="p-6">
			<div className="flex items-center justify-between mb-4">
				<h2 className="font-semibold text-foreground text-[16px] flex items-center gap-2 mb-4">
					<FiBookOpen className="w-4 h-4" />
					{transaction?.tr_type || "Type"} Resource Details
				</h2>
				<Button
					onClick={() =>
						router.push(
							`/resources/material/details/?id=${transaction?.tr_resource.id}`
						)
					}
					variant="ghost"
					size="sm"
					className="h-8 px-3 text-muted-foreground hover:text-foreground hover:bg-accent"
					style={{ fontSize: "10px" }}
				>
					<ExternalLink className="w-3 h-3 mr-1" />
					View Resource
				</Button>
			</div>

			<div className="flex gap-6">
				<img
					src={
						transaction?.tr_type === "Material"
							? transaction?.tr_resource.ma_coverURL
							: transaction?.tr_type === "Discussion Room"
							? transaction?.tr_resource.dr_photoURL
							: transaction?.tr_type === "Computer"
							? transaction?.tr_resource.co_photoURL
							: "/placeholder.svg?height=112&width=80"
					}
					alt={transaction?.tr_qr}
					className={`h-28 object-cover rounded-lg bg-gray-100 ${
						transaction?.tr_type !== "Material" ? "w-28" : "w-20"
					}`}
				/>

				<div className="flex-1">
					<h4 className="font-medium text-foreground text-[14px]">
						{transaction?.tr_type === "Material"
							? transaction?.tr_resource.ma_title
							: transaction?.tr_type === "Discussion Room"
							? transaction?.tr_resource.dr_name
							: transaction?.tr_type === "Computer"
							? transaction?.tr_resource.co_name
							: "NA"}
					</h4>
					<p className="text-muted-foreground text-[12px] mb-4">
						{transaction?.tr_type === "Material"
							? "by " + transaction?.tr_resource.ma_author
							: transaction?.tr_type === "Discussion Room"
							? transaction?.tr_resource.dr_createdAt
							: transaction?.tr_type === "Computer"
							? transaction?.tr_resource.co_createdAt
							: "NA"}
					</p>

					<div className="flex flex-wrap gap-x-8 gap-y-2">
						<div>
							<Label className="text-foreground text-[12px]">Call Number</Label>
							<p className="text-muted-foreground text-[12px]">
								{transaction?.tr_type === "Material"
									? transaction?.tr_resource.ma_callNumber
									: transaction?.tr_type === "Discussion Room"
									? transaction?.tr_resource.dr_qr
									: transaction?.tr_type === "Computer"
									? transaction?.tr_resource.co_qr
									: "NA"}
							</p>
						</div>

						<div>
							<Label className="text-foreground text-[12px]">
								{transaction?.tr_type === "Material"
									? "Format"
									: transaction?.tr_type === "Discussion Room"
									? "Capacity"
									: transaction?.tr_type === "Computer"
									? "Asset Tag"
									: "NA"}
							</Label>
							<p className="text-muted-foreground text-[12px]">
								{transaction?.tr_type === "Material"
									? transaction?.tr_format
									: transaction?.tr_type === "Discussion Room"
									? transaction?.tr_resource.dr_capacity
									: transaction?.tr_type === "Computer"
									? transaction?.tr_resource.co_assetTag
									: "NA"}
							</p>
						</div>

						<div>
							<Label className="text-foreground text-[12px]">Description</Label>
							<p className="text-muted-foreground text-[12px]">
								{transaction?.tr_type === "Material"
									? transaction?.tr_resource.ma_description
									: transaction?.tr_type === "Discussion Room"
									? transaction?.tr_resource.dr_description
									: transaction?.tr_type === "Computer"
									? transaction?.tr_resource.co_description
									: "NA"}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export const renderPatronDetails = (transaction, router) => {
	if (!transaction?.tr_patron) return null;

	const patron = transaction?.tr_patron;

	return (
		<div className="p-6">
			<div className="flex items-center justify-between mb-4">
				<h2 className="font-semibold text-foreground text-[16px] flex items-center gap-2 mb-4">
					<FiUser className="w-4 h-4" />
					Patron Details
				</h2>
				<Button
					onClick={() =>
						router.push(`/account/details?id=${transaction?.tr_patron.id}`)
					}
					variant="ghost"
					size="sm"
					className="h-8 px-3 text-muted-foreground hover:text-foreground hover:bg-accent"
					style={{ fontSize: "10px" }}
				>
					<ExternalLink className="w-3 h-3 mr-1" />
					View Profile
				</Button>
			</div>

			<div className="flex gap-6">
				<div className="w-20 h-20 bg-muted rounded-full overflow-hidden border-2 border-border flex-shrink-0">
					<img
						src={patron?.us_photoURL || "/placeholder.svg"}
						alt={patron?.us_name}
						className="w-full h-full object-cover"
					/>
				</div>
				<div className="flex-1">
					<h4 className="font-medium text-foreground text-[14px]">
						{patron?.us_name}
					</h4>
					<p className="text-primary-custom text-[12px] mb-4">
						{patron?.us_type} • {patron?.us_schoolID}
					</p>

					<div className="flex flex-wrap gap-x-8 gap-y-2">
						<div>
							<Label className="text-foreground text-[12px]">Email</Label>
							<p className="text-muted-foreground text-[12px]">
								{patron?.us_email || "NA"}
							</p>
						</div>

						<div>
							<Label className="text-foreground text-[12px]">Academic</Label>
							<p className="text-muted-foreground text-[12px]">
								{[
									patron?.us_section,
									patron?.us_year,
									patron?.us_program,
									patron?.us_school,
								]
									.filter(Boolean)
									.join(", ")}
							</p>
						</div>
						<div>
							<Label className="text-foreground text-[12px]">
								Associated Library
							</Label>
							<p className="text-muted-foreground text-[12px]">
								{patron?.us_library || "NA"}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export const renderCancellationDetails = (transaction) => {
	if (transaction?.tr_status !== "Cancelled") return null;

	return (
		<>
			<div className="border-t border-border"></div>
			<div className="p-6">
				<h2 className="font-semibold text-foreground text-[16px] flex items-center gap-2 mb-4">
					<FiX className="w-4 h-4" />
					Cancellation Reason(s)
				</h2>

				<div className="flex flex-wrap gap-2 mt-1">
					{transaction?.tr_remarks.map((reason, index) => (
						<span
							key={index}
							className="bg-muted text-foreground px-3 py-2 rounded-md text-[12px]"
						>
							{reason}
						</span>
					))}
				</div>
			</div>
		</>
	);
};
