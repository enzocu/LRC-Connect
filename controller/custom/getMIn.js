function formatTo12Hour(timeStr) {
	const [hourStr, minute] = timeStr.split(":");
	let hour = parseInt(hourStr, 10);
	const ampm = hour >= 12 ? "PM" : "AM";
	hour = hour % 12 || 12;
	return `${hour}:${minute} ${ampm}`;
}

function parseDateTime(dateStr, timeStr) {
	const [year, month, day] = dateStr.split("-").map(Number);
	const [hour, minute] = timeStr.split(":").map(Number);
	return new Date(year, month - 1, day, hour, minute);
}

function convertTimeStrToMinutes(timeStr) {
	const [hours, minutes] = timeStr.split(":").map(Number);
	return hours * 60 + minutes;
}

export function getMinTimeWithOffset(
	minDateStr,
	open = "07:00",
	selectedDateStr = null,
	selectedTimeStr = null,
	maxTime = "21:00",
	specificMin = "",
	Alert
) {
	let minTime;
	const now = new Date();

	if (!minDateStr || !selectedDateStr) return false;

	const currentTime = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
		now.getHours(),
		now.getMinutes()
	);

	const openTime = parseDateTime(minDateStr, open);

	if (
		now.toDateString() === new Date(minDateStr).toDateString() &&
		currentTime > openTime
	) {
		if (specificMin !== "") {
			const offsetMinutes = convertTimeStrToMinutes(specificMin);
			minTime = new Date(currentTime.getTime() + offsetMinutes * 60000);
		} else {
			minTime = currentTime;
		}
	} else {
		minTime = openTime;
	}

	if (selectedTimeStr) {
		const baseDateStr = selectedDateStr || minDateStr;
		const selectedTime = parseDateTime(baseDateStr, selectedTimeStr);

		if (selectedTime < minTime) {
			const hh = minTime.getHours().toString().padStart(2, "0");
			const mm = minTime.getMinutes().toString().padStart(2, "0");
			Alert.showDanger(
				"Minimum time allowed is " + formatTo12Hour(`${hh}:${mm}`)
			);
			return false;
		}

		let maxAllowed;

		if (specificMin !== "") {
			const maxOffsetMinutes = convertTimeStrToMinutes(maxTime);
			maxAllowed = new Date(openTime.getTime() + maxOffsetMinutes * 60000);
		} else {
			maxAllowed = parseDateTime(baseDateStr, maxTime);
		}

		if (selectedTime > maxAllowed) {
			const hh = maxAllowed.getHours().toString().padStart(2, "0");
			const mm = maxAllowed.getMinutes().toString().padStart(2, "0");
			Alert.showDanger(
				"Maximum time allowed is " + formatTo12Hour(`${hh}:${mm}`)
			);
			return false;
		}
	}

	return true;
}

export const getMaxReturnDate = (pickupDate, borrowDays) => {
	if (!pickupDate || !borrowDays) return "";

	const pickup = new Date(pickupDate);
	pickup.setDate(pickup.getDate() + borrowDays - 1);

	// Format as YYYY-MM-DD
	const yyyy = pickup.getFullYear();
	const mm = String(pickup.getMonth() + 1).padStart(2, "0");
	const dd = String(pickup.getDate()).padStart(2, "0");

	return `${yyyy}-${mm}-${dd}`;
};

export function isDateEnabled(date, openHours) {
	if (!date || !openHours) return false;

	const dayName = new Date(date)
		.toLocaleDateString("en-US", { weekday: "long" })
		.toLowerCase();

	const dayKey = `oh_${dayName}`;
	const dayData = openHours[dayKey];

	// If Sunday or any missing dayKey, considered as closed (disabled)
	return !!dayData?.enabled;
}

export function getOperatingHoursForDate(date, openHours) {
	if (!date || !openHours) return { open: "07:00", close: "21:00" };

	const dayName = new Date(date)
		.toLocaleDateString("en-US", { weekday: "long" })
		.toLowerCase();

	const dayKey = `oh_${dayName}`;
	const dayData = openHours[dayKey];

	if (dayData?.enabled) {
		return {
			open: dayData.open || "07:00",
			close: dayData.close || "21:00",
		};
	}

	return null;
}
