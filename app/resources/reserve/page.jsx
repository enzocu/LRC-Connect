"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
	FiArrowLeft,
	FiChevronLeft,
	FiChevronRight,
	FiCalendar,
	FiClock,
	FiInfo,
} from "react-icons/fi";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import ProtectedRoute from "@/contexts/ProtectedRoute";
import { useLoading } from "@/contexts/LoadingProvider";

import { ReservationSummaryModal } from "@/components/modal/reservation-summary-modal";

import { getUser } from "@/controller/firebase/get/getUser";
import { getLibrary } from "@/controller/firebase/get/getLibrary";

import { getMaterialWithMarctag } from "@/controller/firebase/get/getMaterialWithMarctag";
import { getDiscussionroom } from "@/controller/firebase/get/getDiscussionroom";
import { getComputer } from "@/controller/firebase/get/getComputer";
import { getActiveTransactionCount } from "@/controller/firebase/get/getActiveTransactionCounts";
import { toPHDate } from "@/controller/custom/customFunction";

import {
	handleSessionSchedule,
	calculateDuration,
	formatDisplayDate,
	getFormattedBorrowDuration,
	getBorrowDaysByType,
	formatTime,
} from "@/controller/custom/handleSessionSchedule";

export default function ReservationPage() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const { setLoading, setPath } = useLoading();

	const resourceType = searchParams.get("type") || "Material";
	const patronID = searchParams.get("paID") || null;
	const resourceID = searchParams.get("reID") || null;

	//USER & RESOURCE DETAILS
	const [patronDetails, setPatronDetails] = useState({});
	const [resourceDetails, setResourceDetails] = useState({});
	const [libraryDetails, setLibraryDetails] = useState({});
	const [openHours, setOpenHours] = useState({});
	const [trnCount, setTrnCount] = useState({});

	//RESERVATION
	const [selectedDate, setSelectedDate] = useState(null);
	const [selectedEndDate, setSelectedEndDate] = useState(null);
	const [sessionStart, setSessionStart] = useState("");
	const [sessionEnd, setSessionEnd] = useState("");
	const [selectedFormat, setSelectedFormat] = useState("");

	//CALENDAR
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [roomUse, setRoomUse] = useState(false);
	const [sessionLimits, setSessionLimits] = useState(0);
	const [showReservationModal, setShowReservationModal] = useState(false);
	const [showUtilizedModal, setShowUtilizedModal] = useState(false);

	useEffect(() => {
		setPath(pathname);
		if (!patronID) return;

		const unsubscribeUser = getUser(
			patronID,
			false,
			setPatronDetails,
			null,
			null,
			null,
			setLoading,
			Alert
		);

		return () => {
			if (unsubscribeUser) unsubscribeUser();
		};
	}, [patronID]);

	useEffect(() => {
		if (!resourceID) return;

		if (resourceType === "Material") {
			getMaterialWithMarctag(
				resourceID,
				setResourceDetails,
				setLoading,
				Alert,
				false
			);
		} else if (resourceType === "Discussion Room") {
			getDiscussionroom(resourceID, setResourceDetails, setLoading, Alert);
		} else if (resourceType === "Computer") {
			getComputer(resourceID, setResourceDetails, setLoading, Alert);
		}
	}, [resourceID]);

	useEffect(() => {
		let liID = null;

		if (resourceType === "Material") {
			liID = resourceDetails?.ma_liID;
		} else if (resourceType === "Discussion Room") {
			liID = resourceDetails?.dr_liID;
		} else if (resourceType === "Computer") {
			liID = resourceDetails?.co_liID;
		}

		if (!liID) return;

		const unsubscribeLibrary = getLibrary(
			liID,
			setLibraryDetails,
			setLoading,
			Alert,
			null,
			setOpenHours
		);

		return () => {
			if (unsubscribeLibrary) unsubscribeLibrary();
		};
	}, [resourceDetails, resourceType]);

	useEffect(() => {
		if (
			patronID &&
			userDetails?.us_liID &&
			libraryDetails?.li_borrowing &&
			patronDetails?.us_type
		) {
			setSessionLimits(
				getBorrowDaysByType(
					libraryDetails?.li_borrowing,
					patronDetails?.us_type
				) || 0
			);

			getActiveTransactionCount(
				patronID,
				userDetails?.us_liID,
				patronDetails?.us_type,
				libraryDetails?.li_borrowing,
				setTrnCount,
				Alert
			);
		}
	}, [patronDetails, libraryDetails]);

	useEffect(() => {
		if (!selectedDate) return;

		handleSessionSchedule({
			operatingHours: libraryDetails?.li_operating,
			resourceType,
			selectedDate,
			sessionStart,
			sessionEnd,
			minTime:
				resourceType === "Discussion Room"
					? resourceDetails?.dr_minDurationDate
					: resourceDetails?.co_minDurationDate,
			maxTime:
				resourceType === "Discussion Room"
					? resourceDetails?.dr_maxDurationDate
					: resourceDetails?.co_maxDurationDate,
			setSelectedDate,
			setSelectedEndDate,
			setSessionStart,
			setSessionEnd,
			Alert,
		});
	}, [selectedDate, sessionStart, sessionEnd]);

	const handleDateSelect = (day, borrowDays = 5) => {
		const selected = new Date(
			currentMonth.getFullYear(),
			currentMonth.getMonth(),
			day
		);

		setSelectedDate(selected);
		setSelectedEndDate(null);
		setSessionStart("");
		setSessionEnd("");

		if (resourceType === "Material") {
			if (roomUse && isToday(selected)) {
				setSelectedEndDate(selected);
			} else {
				const end = new Date(selected);
				end.setDate(end.getDate() + (borrowDays - 1));
				setSelectedEndDate(end);
			}
		}
	};

	//Helper functions
	const isToday = (date) => {
		if (!date) return false;
		const today = new Date();
		return (
			date.getDate() === today.getDate() &&
			date.getMonth() === today.getMonth() &&
			date.getFullYear() === today.getFullYear()
		);
	};

	const isCurrentTime = (time) => {
		if (!time) return false;
		const now = new Date();
		const currentHour = now.getHours();
		const currentMinute = now.getMinutes();
		const [hour, minute] = time.split(":").map(Number);
		return hour === currentHour && minute === currentMinute;
	};

	const getButtonText = () => {
		if (["USR-5", "USR-6"].includes(userDetails?.us_level)) {
			return "Reserve";
		}

		if (resourceType === "Material") {
			return isToday(selectedDate) ? "Utilize" : "Reserve";
		} else if (
			resourceType === "Computer" ||
			resourceType === "Discussion Room"
		) {
			return isToday(selectedDate) && isCurrentTime(sessionStart)
				? "Utilize"
				: "Reserve";
		}
	};

	//Calendar
	const navigateMonth = (direction) => {
		const newMonth = new Date(currentMonth);
		newMonth.setMonth(currentMonth.getMonth() + direction);
		setCurrentMonth(newMonth);
	};

	const getDaysInMonth = (date) => {
		return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
	};

	const getFirstDayOfMonth = (date) => {
		return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
	};

	const renderCalendar = (borrowDays = 5) => {
		const daysInMonth = getDaysInMonth(currentMonth);
		const firstDay = getFirstDayOfMonth(currentMonth);
		const days = [];
		const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

		for (let i = 0; i < firstDay; i++) {
			days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
		}

		for (let day = 1; day <= daysInMonth; day++) {
			const isSelected = selectedDate && selectedDate.getDate() === day;
			const isselectedEndDate =
				selectedEndDate &&
				selectedEndDate.getDate() === day &&
				selectedEndDate.getMonth() === currentMonth.getMonth();
			const isPastDate =
				new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) <
				new Date().setHours(0, 0, 0, 0);

			days.push(
				<button
					key={day}
					onClick={() => !isPastDate && handleDateSelect(day, borrowDays)}
					disabled={isPastDate}
					className={`w-10 h-10 rounded-lg text-[12px] font-medium transition-all duration-200 ${
						isSelected || isselectedEndDate
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

	return (
		<ProtectedRoute
			allowedRoles={["USR-2", "USR-3", "USR-4", "USR-5", "USR-6"]}
		>
			<div className="min-h-screen bg-background transition-colors duration-300">
				<Header />

				<main className="pt-28 pb-6 px-6 sm:px-6 md:px-16 lg:px-[100px] xl:px-[150px]">
					<div className="mb-6 animate-fade-in">
						<button
							onClick={() => router.back()}
							className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit group text-[11px]"
						>
							<FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
							Back to Previous page
						</button>
					</div>

					<div className="mb-10 animate-slide-up">
						<h1 className="font-semibold text-foreground text-[20px]">
							{libraryDetails?.li_name || "Library Name"}
						</h1>
						<p className="text-muted-foreground text-[14px]">
							{libraryDetails?.li_schoolname || "School Name"}
						</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-14">
						{/* Left Side - Calendar */}
						<div className="lg:col-span-2 space-y-6">
							<Card className="bg-card border-border animate-slide-up-delay-1 shadow-sm">
								<CardContent className="pt-6">
									{renderCalendar(sessionLimits)}
								</CardContent>
							</Card>

							{((selectedDate && resourceType == "Material") ||
								(selectedDate && sessionStart && sessionEnd)) && (
								<Card className="border-border animate-slide-up-delay-2">
									<CardContent className="p-6">
										<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
											<div className="flex items-center gap-3 flex-1">
												<div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
													<FiCalendar
														className=" text-white"
														style={{ fontSize: "17px" }}
													/>
												</div>
												<div>
													<p className="text-muted-foreground text-[12px] mb-1">
														Date of Use
													</p>
													<h4 className="font-medium text-foreground text-[14px]">
														{formatDisplayDate(selectedDate)}
													</h4>
												</div>
											</div>

											{resourceType === "Material" && selectedEndDate && (
												<div className="flex items-center gap-3 flex-1">
													<div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
														<FiCalendar
															className="text-white"
															style={{ fontSize: "17px" }}
														/>
													</div>
													<div>
														<p className="text-muted-foreground text-[12px] mb-1">
															Due Date
														</p>
														<h4 className="font-medium text-foreground text-[14px]">
															{formatDisplayDate(selectedEndDate)}
														</h4>
													</div>
												</div>
											)}

											<div className="flex items-center gap-3 flex-1">
												<div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
													<FiClock
														className=" text-white"
														style={{ fontSize: "17px" }}
													/>
												</div>
												<div>
													<p className="text-muted-foreground text-[12px] mb-1">
														Duration
													</p>
													<h4 className="font-medium text-foreground text-[14px]">
														{calculateDuration(
															libraryDetails?.li_operating,
															selectedDate,
															selectedEndDate,
															sessionStart,
															sessionEnd
														) || "--"}
													</h4>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							)}

							<Card className="bg-card border-border animate-slide-up-delay-3 shadow-sm">
								<CardHeader className="pb-2">
									<CardTitle className="text-[16px] leading-none">
										Configure Reservation
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-6">
									{resourceType === "Material" && (
										<>
											{["USR-2", "USR-3", "USR-4"].includes(
												userDetails?.us_level
											) &&
												selectedDate &&
												isToday(selectedDate) && (
													<div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200 mt-2">
														<div className="flex-1">
															<Label className="text-gray-900 font-medium block mb-1 text-[14px]">
																Room Use
															</Label>
															<p className="text-xs text-gray-600">
																Enable if material will be used within the
																library premises only
															</p>
														</div>

														<Switch
															checked={roomUse}
															onCheckedChange={() => {
																setRoomUse(!roomUse);
																setSelectedEndDate(selectedDate);
															}}
															className="ml-4"
														/>
													</div>
												)}
											<div>
												<Label className="text-foreground font-medium block mb-2 text-[12px]">
													Choose a Material Format
												</Label>
												<div className="grid  grid-cols-3 gap-3">
													{["Hard Copy", "Soft Copy", "Audio Copy"].map(
														(format) => {
															const formatMap = {
																"Hard Copy":
																	resourceDetails?.ma_formats?.coverCopy,
																"Soft Copy":
																	resourceDetails?.ma_formats?.softCopy,
																"Audio Copy":
																	resourceDetails?.ma_formats?.audioCopy,
															};

															const isDisabled = !formatMap[format];

															return (
																<label
																	key={format}
																	className={`h-11 flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200
																${
																	isDisabled
																		? "border-border bg-muted cursor-not-allowed opacity-50"
																		: selectedFormat === format
																		? "border-primary-custom bg-primary-custom/5"
																		: "border-border cursor-pointer hover:border-primary-custom/50 hover:bg-accent/50"
																}`}
																>
																	<input
																		type="radio"
																		name="format"
																		value={format}
																		checked={selectedFormat === format}
																		onChange={(e) =>
																			setSelectedFormat(e.target.value)
																		}
																		className="w-4 h-4 text-primary border-gray-400 checked:bg-primary checked:border-primary focus:ring-primary"
																		disabled={isDisabled}
																	/>
																	<span className="text-foreground font-medium text-[12px]">
																		{format}
																	</span>
																</label>
															);
														}
													)}
												</div>
											</div>

											{["USR-2", "USR-3", "USR-4"].includes(
												userDetails?.us_level
											) &&
												selectedDate &&
												!roomUse && (
													<div>
														<Label className="text-foreground font-medium block mb-2 text-[12px]">
															End Date (Editable)
														</Label>
														<Input
															type="date"
															value={toPHDate(selectedEndDate)}
															onChange={(e) =>
																setSelectedEndDate(new Date(e.target.value))
															}
															disabled={!selectedDate}
															min={toPHDate(selectedDate)}
															max={toPHDate(
																new Date(
																	selectedDate.getTime() +
																		(sessionLimits - 1) * 24 * 60 * 60 * 1000
																)
															)}
															className="h-11 border-border text-foreground"
															style={{ fontSize: "12px" }}
														/>
														<p className="text-xs text-gray-500 mt-1">
															You can adjust the return date within{" "}
															{sessionLimits} days from start date
														</p>
													</div>
												)}
										</>
									)}

									{(resourceType === "Discussion Room" ||
										resourceType === "Computer") && (
										<div className="grid grid-cols-2 gap-4">
											<div>
												<Label className="text-foreground font-medium text-[12px]">
													Start Time
												</Label>
												<Input
													type="time"
													value={sessionStart || ""}
													onChange={(e) => setSessionStart(e.target.value)}
													className="h-11 bg-background border-border text-foreground mt-2 focus:border-primary-custom"
													style={{ fontSize: "12px" }}
													disabled={!selectedDate}
												/>
											</div>
											<div>
												<Label className="text-foreground font-medium text-[12px]">
													End Time
												</Label>
												<Input
													type="time"
													value={sessionEnd || ""}
													onChange={(e) => setSessionEnd(e.target.value)}
													className="h-11 bg-background border-border text-foreground mt-2 focus:border-primary-custom"
													style={{ fontSize: "12px" }}
													disabled={!selectedDate || !sessionStart}
												/>
											</div>
										</div>
									)}

									<Button
										onClick={() =>
											getButtonText() === "Reserve"
												? setShowReservationModal(true)
												: setShowUtilizedModal(true)
										}
										disabled={
											trnCount?.remaining <= 0 ||
											(trnCount?.remaining > 0 &&
												(!selectedDate ||
													(resourceType === "Material" && !selectedFormat) ||
													(["Discussion Room", "Computer"].includes(
														resourceType
													) &&
														(!sessionStart || !sessionEnd))))
										}
										className={`h-11 w-full ${
											getButtonText() === "Utilize"
												? "bg-green-600 hover:bg-green-700 text-white"
												: "bg-primary hover:bg-secondary-custom text-white"
										} text-white border-none disabled:opacity-50 text-[12px]`}
									>
										{getButtonText()} {resourceType}
									</Button>
								</CardContent>
							</Card>
						</div>

						{/* Right Side - Information */}
						<div className="space-y-6">
							<Card className="bg-card border-border animate-slide-up-delay-1 shadow-sm">
								<CardHeader className="pb-4">
									<CardTitle className="flex items-center gap-2 text-[16px]">
										<FiInfo className="w-5 h-5 text-primary-custom" />
										{resourceType === "Material"
											? "Borrowing Information (Days)"
											: "Session Information (Hours)"}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<div className="flex justify-between items-center py-2 border-b border-border/50">
											<span className="text-muted-foreground text-[12px]">
												Minimum Duration
											</span>
											<span className="text-foreground  text-[12px]">
												{resourceType === "Material"
													? "1 Day"
													: resourceType === "Discussion Room"
													? resourceDetails?.dr_minDurationFormatted
													: resourceDetails?.co_minDurationFormatted}
											</span>
										</div>
										<div className="flex justify-between items-center py-2 border-b border-border/50">
											<span className="text-muted-foreground text-[12px]">
												Maximum Duration
											</span>
											<span className="text-foreground  text-[12px]">
												{getFormattedBorrowDuration(
													resourceType,
													patronDetails?.us_type,
													libraryDetails?.li_borrowing,
													resourceDetails
												)}
											</span>
										</div>

										<div className="flex justify-between items-center py-2">
											<span className="text-muted-foreground text-[12px]">
												Reservations Left
											</span>
											<span className="text-primary-custom font-semibold text-[12px]">
												{trnCount?.remaining} of {trnCount?.max} available (
												{trnCount?.total} used)
											</span>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="bg-card border-border animate-slide-up-delay-2 shadow-sm">
								<CardHeader className="pb-4">
									<CardTitle className="flex items-center gap-2 text-[16px]">
										<FiClock className="w-5 h-5 text-primary-custom" />
										Operating Hours
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										{openHours &&
											Object.entries(openHours).map(([key, value]) => {
												const day = key.replace("oh_", "");
												const capitalizedDay =
													day.charAt(0).toUpperCase() + day.slice(1);

												const openTime = value.open || "07:00";
												const closeTime = value.close || "21:00";

												const today = new Date()
													.toLocaleDateString("en-US", {
														weekday: "long",
													})
													.toLowerCase();

												const isToday = day === today;

												return (
													<div
														key={key}
														className={`flex justify-between items-center py-2 border-b border-border/30 last:border-b-0 ${
															isToday
																? "border border-primary rounded-md px-4 py-3"
																: ""
														}`}
													>
														<span className="text-foreground text-[12px]">
															{capitalizedDay}
														</span>
														<span
															className={
																value.enabled
																	? "text-muted-foreground"
																	: "text-red-500"
															}
															style={{ fontSize: "12px" }}
														>
															{value.enabled
																? `${formatTime(openTime)} - ${formatTime(
																		closeTime
																  )}`
																: "Closed"}
														</span>
													</div>
												);
											})}
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</main>
			</div>
		</ProtectedRoute>
	);
}
