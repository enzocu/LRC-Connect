import {
	format,
	isSameDay,
	addMinutes,
	parse,
	differenceInMinutes,
} from "date-fns";

export const formatTime = (time) => {
	const [hourStr, minute] = time.split(":");
	let hour = parseInt(hourStr, 10);
	const ampm = hour >= 12 ? " pm" : " am";
	hour = hour % 12 || 12;
	return `${hour.toString().padStart(1, "0")}:${minute}${ampm}`;
};

export function getBorrowDaysByType(li_borrowing, userType) {
	if (!li_borrowing || !userType) return 0;

	switch (userType) {
		case "Student":
		case "Student Assistant":
			return li_borrowing.br_student?.borrowDays ?? 0;

		case "Faculty":
			return li_borrowing.br_faculty?.borrowDays ?? 0;

		case "Administrator":
			return li_borrowing.br_administrator?.borrowDays ?? 0;

		default:
			return 0;
	}
}

export function getOperatingDetails(selectedDate, operatingHours) {
	if (!selectedDate || !operatingHours) return null;

	const dayMap = [
		"sunday",
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday",
	];

	const dayKey = `oh_${dayMap[selectedDate.getDay()]}`;
	const operating = operatingHours[dayKey];

	if (!operating || !operating.enabled) {
		return {
			isAvailable: false,
			message: "Selected date is not available for booking.",
		};
	}

	const openDate =
		typeof operating.open?.toDate === "function"
			? operating.open.toDate()
			: null;
	const closeDate =
		typeof operating.close?.toDate === "function"
			? operating.close.toDate()
			: null;

	if (!openDate || !closeDate) {
		return {
			isAvailable: false,
			message: "Invalid operating hours data.",
		};
	}

	return {
		isAvailable: true,
		dayKey,
		open: {
			_24hr: format(openDate, "HH:mm"),
			_12hr: format(openDate, "h:mm a"),
		},
		close: {
			_24hr: format(closeDate, "HH:mm"),
			_12hr: format(closeDate, "h:mm a"),
		},
	};
}

export function handleSessionSchedule({
	operatingHours,
	resourceType,
	selectedDate = null,
	sessionStart = null,
	sessionEnd = null,
	minTime = null,
	maxTime = null,
	setSelectedDate,
	setSelectedEndDate,
	setSessionStart = () => {},
	setSessionEnd = () => {},
	Alert,
}) {
	if (!selectedDate || !operatingHours) return null;

	const operatingDetails = getOperatingDetails(selectedDate, operatingHours);

	if (!operatingDetails?.isAvailable) {
		setSelectedDate(null);
		setSelectedEndDate(null);
		Alert?.showDanger(operatingDetails?.message);
		return operatingDetails;
	}

	const { open, close } = operatingDetails;
	const openStr24 = open._24hr;
	const closeStr24 = close._24hr;
	const openStr = open._12hr;
	const closeStr = close._12hr;

	const openTime = parse(openStr24, "HH:mm", selectedDate);
	const closeTime = parse(closeStr24, "HH:mm", selectedDate);

	if (["Discussion Room", "Computer"].includes(resourceType)) {
		if (sessionStart && !sessionEnd) {
			const start = parse(sessionStart, "HH:mm", selectedDate);

			if (start >= openTime && start < closeTime) {
				if (isSameDay(selectedDate, new Date())) {
					const nowStr = format(new Date(), "HH:mm");
					const nowTime = parse(nowStr, "HH:mm", selectedDate);

					if (start >= nowTime) {
						setSessionStart(sessionStart);
					} else {
						setSessionStart(null);
						Alert?.showWarning("Start time must be in the future.");
					}
				} else {
					setSessionStart(sessionStart);
				}
			} else {
				setSessionStart(null);

				Alert?.showWarning(
					`Start time must be within library hours: ${openStr} - ${closeStr}.`
				);
			}
		} else if (sessionStart && sessionEnd) {
			const start = parse(sessionStart, "HH:mm", selectedDate);
			const end = parse(sessionEnd, "HH:mm", selectedDate);

			const min = minTime
				? minTime.toDate().getHours() * 60 + minTime.toDate().getMinutes()
				: 0;
			const max = maxTime
				? maxTime.toDate().getHours() * 60 + maxTime.toDate().getMinutes()
				: 0;

			const minAllowed = addMinutes(start, min);
			const maxAllowed = addMinutes(start, max);

			const minStr = format(minAllowed, "h:mm a");
			const maxStr = format(maxAllowed, "h:mm a");

			if (end > openTime && end < closeTime) {
				if (end >= minAllowed && end <= maxAllowed) {
					setSessionEnd(sessionEnd);
				} else {
					setSessionEnd(null);
					Alert?.showWarning(
						`End time must be between ${minStr} and ${maxStr}, based on your start time.`
					);
				}
			} else {
				setSessionEnd(null);
				Alert?.showWarning(
					`End time must be within library hours: ${openStr} - ${closeStr}.`
				);
			}
		}
	} else {
		setSelectedDate(selectedDate);
	}
}

export function calculateDuration(
	operatingHours,
	selectedDate,
	selectedEndDate,
	sessionStart,
	sessionEnd
) {
	if (!selectedDate) return null;

	if (selectedDate?.toDate) selectedDate = selectedDate.toDate();
	if (selectedEndDate?.toDate) selectedEndDate = selectedEndDate.toDate();

	let totalMinutes = 0;

	if (!sessionStart && !sessionEnd && selectedEndDate) {
		if (selectedDate.toDateString() !== selectedEndDate.toDateString()) {
			const diffInMs = selectedEndDate - selectedDate + 24 * 60 * 60 * 1000;
			totalMinutes = diffInMs / (1000 * 60);
		} else {
			const operating = getOperatingDetails(selectedDate, operatingHours);
			if (!operating?.isAvailable) return null;

			const now = new Date();
			const nowStr = format(now, "HH:mm");
			const nowTime = parse(nowStr, "HH:mm", now);

			const closeTime = parse(operating.close._24hr, "HH:mm", now);

			totalMinutes = differenceInMinutes(closeTime, nowTime);
		}
	} else if (sessionStart && sessionEnd) {
		const baseDate = selectedEndDate || selectedDate;
		const startTime = parse(sessionStart, "HH:mm", selectedDate);
		const endTime = parse(sessionEnd, "HH:mm", baseDate);
		totalMinutes = differenceInMinutes(endTime, startTime);
	}

	if (totalMinutes <= 0) return null;

	const days = Math.floor(totalMinutes / (60 * 24));
	const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
	const minutes = totalMinutes % 60;

	let parts = [];

	if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);
	if (hours > 0) parts.push(`${hours} hr${hours > 1 ? "s" : ""}`);
	if (minutes > 0) parts.push(`${minutes} min${minutes > 1 ? "s" : ""}`);

	return parts.join(", ");
}

export function formatDisplayDate(date) {
	if (!date) return "--";

	if (typeof date.toDate === "function") {
		date = date.toDate();
	}

	if (typeof date === "number") {
		date = new Date(date);
	}

	if (typeof date === "string") {
		date = new Date(date);
	}

	if (!(date instanceof Date) || isNaN(date)) return "--";

	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export function getFormattedBorrowDuration(
	resourceType,
	patronType,
	li_borrowing,
	resourceDetails
) {
	if (resourceType === "Material") {
		let maxDays = 0;

		if (patronType === "Student" || patronType === "Student Assistant") {
			maxDays = li_borrowing?.br_student?.borrowDays ?? 0;
		} else if (patronType === "Faculty") {
			maxDays = li_borrowing?.br_faculty?.borrowDays ?? 0;
		} else if (patronType === "Administrator") {
			maxDays = li_borrowing?.br_administrator?.borrowDays ?? 0;
		}

		return `${maxDays} Day${maxDays !== 1 ? "s" : ""}`;
	} else if (resourceType === "Discussion Room") {
		return resourceDetails?.dr_maxDurationFormatted ?? "N/A";
	} else if (resourceType === "Computer") {
		return resourceDetails?.co_maxDurationFormatted ?? "N/A";
	}

	return "N/A";
}
