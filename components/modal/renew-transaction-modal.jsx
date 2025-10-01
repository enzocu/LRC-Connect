"use client";
import { Timestamp } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import {
	FiCalendar,
	FiChevronLeft,
	FiChevronRight,
	FiClock,
} from "react-icons/fi";
import { Card, CardContent } from "@/components/ui/card";

import Lottie from "lottie-react";
import successAnimation from "@/public/lottie/success.json";

import { LoadingSpinner } from "@/components/loading";
import { useLoading } from "@/contexts/LoadingProvider";

import { getLibrary } from "@/controller/firebase/get/getLibrary";
import {
	handleSessionSchedule,
	calculateDuration,
	formatDisplayDate,
} from "@/controller/custom/handleSessionSchedule";

import { renewTransaction } from "@/controller/firebase/update/updateRenew";

export function RenewTransactionModal({
	isOpen,
	onClose,
	transaction,
	userDetails,
	Alert,
}) {
	const router = useRouter();
	const pathname = usePathname();
	const { setLoading, setPath } = useLoading();
	const [btnLoading, setBtnLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [selectedDate, setSelectedDate] = useState(null);
	const [libraryDetails, setLibraryDetails] = useState({});

	useEffect(() => {
		if (!isOpen || !transaction?.tr_dateDue) return;

		let dueDateObj =
			transaction.tr_dateDue instanceof Timestamp
				? transaction.tr_dateDue.toDate()
				: new Date(transaction.tr_dateDue);

		const initialSelectedDate = new Date(dueDateObj);
		initialSelectedDate.setDate(initialSelectedDate.getDate() + 1);

		setSelectedDate(initialSelectedDate);
		setCurrentMonth(
			new Date(
				initialSelectedDate.getFullYear(),
				initialSelectedDate.getMonth(),
				1
			)
		);
	}, [isOpen, transaction?.tr_dateDue]);

	const navigateMonth = (direction) => {
		const newMonth = new Date(currentMonth);
		newMonth.setMonth(currentMonth.getMonth() + direction);
		setCurrentMonth(newMonth);
	};

	const getDaysInMonth = (date) =>
		new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

	const getFirstDayOfMonth = (date) =>
		new Date(date.getFullYear(), date.getMonth(), 1).getDay();

	const handleDateSelect = (day) => {
		setSelectedDate(
			new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
		);
	};

	const renderCalendar = () => {
		const daysInMonth = getDaysInMonth(currentMonth);
		const firstDay = getFirstDayOfMonth(currentMonth);
		const days = [];
		const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

		const trDateDue =
			transaction?.tr_dateDue instanceof Timestamp
				? transaction.tr_dateDue.toDate()
				: transaction?.tr_dateDue
				? new Date(transaction.tr_dateDue)
				: null;

		for (let i = 0; i < firstDay; i++) {
			days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
		}

		for (let day = 1; day <= daysInMonth; day++) {
			const currentDay = new Date(
				currentMonth.getFullYear(),
				currentMonth.getMonth(),
				day
			);

			const isSelected =
				selectedDate &&
				selectedDate.getDate() === day &&
				selectedDate.getMonth() === currentMonth.getMonth();

			const isPastDate = trDateDue
				? currentDay <= new Date(trDateDue.setHours(0, 0, 0, 0))
				: false;

			days.push(
				<button
					key={day}
					onClick={() => !isPastDate && handleDateSelect(day)}
					disabled={isPastDate}
					className={`w-10 h-10 rounded-lg text-[12px] font-medium transition-all duration-200 ${
						isSelected
							? "bg-primary-custom text-white shadow-md scale-105"
							: isPastDate
							? "text-muted-foreground/40 cursor-not-allowed"
							: "text-foreground hover:bg-accent hover:scale-105 hover:shadow-sm"
					}`}
				>
					{day}
				</button>
			);
		}

		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold text-primary-custom flex items-center gap-2 text-[18px]">
						<FiCalendar className="w-5 h-5" />
						{currentMonth.toLocaleDateString("en-US", {
							month: "long",
							year: "numeric",
						})}
					</h2>
					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => navigateMonth(-1)}
							className="w-9 h-9 p-0 hover:bg-accent"
						>
							<FiChevronLeft className="w-4 h-4" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => navigateMonth(1)}
							className="w-9 h-9 p-0 hover:bg-accent"
						>
							<FiChevronRight className="w-4 h-4" />
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-7 gap-2 mb-4">
					{dayNames.map((dayName) => (
						<div
							key={dayName}
							className="pl-2 text-muted-foreground text-xs font-semibold py-2"
						>
							{dayName}
						</div>
					))}
				</div>

				<div className="grid grid-cols-7 gap-2">{days}</div>
			</div>
		);
	};

	const handleConfirm = async () => {
		if (userDetails && userDetails?.uid && transaction && transaction?.id) {
			await renewTransaction(
				userDetails?.uid,
				transaction,
				selectedDate,
				setBtnLoading,
				Alert,
				router,
				setSuccess
			);
		}
	};

	useEffect(() => {
		if (!isOpen || !transaction?.tr_liID) return;

		setPath(pathname);
		const unsubscribeLibrary = getLibrary(
			transaction?.tr_liID,
			setLibraryDetails,
			setLoading,
			Alert,
			null,
			null
		);

		return () => {
			if (unsubscribeLibrary) unsubscribeLibrary();
		};
	}, [isOpen, transaction?.tr_liID]);

	useEffect(() => {
		if (!selectedDate) return;

		handleSessionSchedule({
			operatingHours: libraryDetails?.li_operating,
			resourceType: "Material",
			selectedDate,
			sessionStart: null,
			sessionEnd: null,
			minTime: null,
			maxTime: null,
			setSelectedDate,
			setSessionStart: () => {},
			setSessionEnd: () => {},
			Alert,
		});
	}, [selectedDate, libraryDetails, Alert]);

	if (!isOpen) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={`Renew Transaction ${transaction?.tr_qr}`}
			size="lg"
		>
			<>
				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					{renderCalendar()}

					{selectedDate && (
						<Card className="bg-gradient-to-r from-primary-custom/5 to-accent-custom/5 border-primary-custom/20 animate-slide-up-delay-2">
							<CardContent className="p-6">
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
									<div className="flex items-center gap-3 flex-1">
										<div className="w-10 h-10 bg-primary-custom rounded-full flex items-center justify-center flex-shrink-0">
											<FiCalendar
												className=" text-white"
												style={{ fontSize: "17px" }}
											/>
										</div>
										<div>
											<p className="text-muted-foreground text-[12px]">
												Date of Use
											</p>
											<h4 className="font-medium text-foreground text-[14px]">
												{formatDisplayDate(transaction?.tr_date)}
											</h4>
										</div>
									</div>

									<div className="flex items-center gap-3 flex-1">
										<div className="w-10 h-10 bg-secondary-custom rounded-full flex items-center justify-center flex-shrink-0">
											<FiCalendar
												className="text-white"
												style={{ fontSize: "17px" }}
											/>
										</div>
										<div>
											<p className="text-muted-foreground text-[12px]">
												Due Date
											</p>
											<h4 className="font-medium text-foreground text-[14px]">
												{formatDisplayDate(selectedDate)}
											</h4>
										</div>
									</div>

									<div className="flex items-center gap-3 flex-1">
										<div className="w-10 h-10 bg-accent-custom rounded-full flex items-center justify-center flex-shrink-0">
											<FiClock
												className=" text-white"
												style={{ fontSize: "17px" }}
											/>
										</div>
										<div>
											<p className="text-muted-foreground text-[12px]">
												Duration
											</p>
											<h4 className="font-medium text-foreground text-[14px]">
												{calculateDuration(
													transaction?.tr_date,
													selectedDate,
													null,
													null
												) || "--"}
											</h4>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{transaction && (
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
							<p className="text-blue-800 text-[12px]">
								<strong>Current Status:</strong> This resource is active. It is
								due on <strong>{transaction.tr_dateDueFormatted}</strong>
								{transaction?.tr_pastDueDate?.length > 0 && (
									<>
										{" "}
										and has been renewed{" "}
										<strong>{transaction?.tr_pastDueDate?.length}</strong> time
										{transaction.tr_pastDueDate.length > 1 && "s"}. Maximum
										renewals allowed: <strong>2</strong>
									</>
								)}
							</p>
						</div>
					)}
				</div>

				<div className="flex items-center justify-end gap-3 px-6 py-4 bg-muted/30 border-t border-border">
					<Button
						type="button"
						onClick={() => onClose()}
						variant="outline"
						className="bg-transparent h-10 px-4 text-[12px]"
					>
						Cancel
					</Button>
					<Button
						onClick={handleConfirm}
						className="bg-primary-custom hover:bg-secondary-custom text-white text-[11px] h-10 px-4 text-[12px]"
					>
						<LoadingSpinner loading={btnLoading} />
						Confirm Renewal
					</Button>
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
