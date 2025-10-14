import { Timestamp } from "firebase/firestore";
import crypto from "crypto";
import { format } from "date-fns";

export const getRelativeTime = (timestamp) => {
	if (!timestamp) return "";

	const date = new Date(timestamp.toDate());
	const now = new Date();
	const diff = Math.floor((now - date) / 1000);

	if (diff < 60) return "just now";
	if (diff < 3600) {
		const mins = Math.floor(diff / 60);
		return `${mins} min${mins !== 1 ? "s" : ""} ago`;
	}
	if (diff < 86400) {
		const hours = Math.floor(diff / 3600);
		return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
	}
	if (diff < 604800) {
		const days = Math.floor(diff / 86400);
		return `${days} day${days !== 1 ? "s" : ""} ago`;
	}

	// If more than a week, show full date
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "2-digit",
		year: "numeric",
	});
};

export const formatYear = (timestamp) =>
	timestamp ? new Date(timestamp.toDate()).getFullYear() : "";

export const formatDate = (timestamp) =>
	timestamp
		? new Date(timestamp.toDate()).toLocaleDateString("en-US", {
				month: "short",
				day: "2-digit",
				year: "numeric",
		  })
		: "";

export const formatTime = (timestamp) =>
	timestamp
		? new Date(timestamp.toDate()).toLocaleTimeString("en-US", {
				hour: "numeric",
				minute: "2-digit",
				hour12: true,
		  })
		: "";

export const formatTimeField = (timestamp) => {
	if (timestamp?.toDate) {
		const date = timestamp.toDate();
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		return `${hours}:${minutes}`;
	}
	return "";
};

export const formatDateTime = (ts) => {
	const d =
		ts instanceof Date
			? ts
			: ts?.seconds
			? new Date(ts.seconds * 1000)
			: new Date(ts);

	return isNaN(d)
		? "ss"
		: d.toLocaleString("en-US", {
				month: "short",
				day: "2-digit",
				year: "numeric",
				hour: "numeric",
				minute: "2-digit",
				hour12: true,
		  });
};

export const formatDateField = (timestamp) => {
	if (!timestamp?.toDate) return "";
	const date = timestamp.toDate();
	return date.toISOString().split("T")[0];
};

export const formatDuration = (timestamp) => {
	if (!timestamp?.toDate) return "";
	const date = timestamp.toDate();
	const hrs = date.getHours();
	const mins = date.getMinutes();

	let str = "";

	if (hrs) str += `${hrs}hr${hrs > 1 ? "s" : ""}`;
	if (mins) str += (str ? " " : "") + `${mins}min${mins > 1 ? "s" : ""}`;

	return str || "0min";
};

export const calculateDuration = (timeIn, timeOut, status) => {
	if (!timeIn) return "NA";

	const start = timeIn.toDate();
	const end = status === "Inactive" ? timeOut?.toDate() || start : new Date();
	const diffMs = end - start;
	const totalMinutes = Math.floor(diffMs / 60000);

	const days = Math.floor(totalMinutes / (24 * 60));
	const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
	const minutes = totalMinutes % 60;

	let result = [];
	if (days > 0) result.push(`${days} day${days > 1 ? "s" : ""}`);
	if (hours > 0) result.push(`${hours} hour${hours > 1 ? "s" : ""}`);
	if (minutes > 0) result.push(`${minutes} min${minutes > 1 ? "s" : ""}`);

	return result.length > 0 ? result.join(", ") : "0 min";
};

export const formatDurationFromMs = (ms) => {
	const totalMinutes = Math.floor(ms / 60000);
	const days = Math.floor(totalMinutes / 1440);
	const hours = Math.floor((totalMinutes % 1440) / 60);
	const minutes = totalMinutes % 60;

	let result = "";
	if (days > 0) result += `${days} day${days > 1 ? "s" : ""}, `;
	if (hours > 0) result += `${hours} hour${hours > 1 ? "s" : ""}, `;
	if (minutes > 0 || result === "")
		result += `${minutes} min${minutes > 1 ? "s" : ""}`;

	return result.replace(/,\s*$/, "");
};

export const convertYearToTimestamp = (dateStr) => {
	if (!dateStr) return null;
	return Timestamp.fromDate(new Date(dateStr));
};

export const convertTimeToTimestamp = (timeStr) => {
	if (!timeStr) return "";
	const [hours, minutes] = timeStr.split(":").map(Number);
	const now = new Date();
	now.setHours(hours, minutes, 0, 0);
	return Timestamp.fromDate(now);
};

export const timeStringToTimestamp = (timeStr) => {
	const [hour, minute] = timeStr.split(":").map(Number);
	const now = new Date();
	now.setHours(hour, minute, 0, 0);
	return Timestamp.fromDate(new Date(now));
};

export const handleChange = (e, setFormData) => {
	const { name, value, files, type } = e.target;
	if (type === "file") {
		setFormData((prev) => ({
			...prev,
			[name]: files[0],
		}));
	} else {
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	}
};

export const getDateOnly = (ts) => {
	const d = ts?.toDate?.() || ts;
	return d instanceof Date
		? new Date(d.getFullYear(), d.getMonth(), d.getDate())
		: null;
};

export const isEmptyObject = (obj) => {
	return (
		obj === null || (typeof obj === "object" && Object.keys(obj).length === 0)
	);
};

export const handleProceedWithReservation = (
	router,
	resourceType,
	resourceID,
	us_id
) => {
	const queryParams = new URLSearchParams({
		type: resourceType,
		reID: resourceID,
		paID: us_id,
	}).toString();

	router.push(`/resources/reserve?${queryParams}`);
};

//AI
export const copyMessageToClipboard = (content) => {
	navigator.clipboard
		.writeText(content)
		.then(() => {
			console.log("Message copied to clipboard");
		})
		.catch((err) => {
			console.error("Failed to copy message: ", err);
		});
};

export const toggleTextToSpeech = (messageIndex, messages, setMessages) => {
	const message = messages[messageIndex];
	if (!message) return;

	if ("speechSynthesis" in window) {
		if (message.isSpeaking) {
			window.speechSynthesis.cancel();
			setMessages((prev) =>
				prev.map((msg, index) =>
					index === messageIndex ? { ...msg, isSpeaking: false } : msg
				)
			);
		} else {
			const utterance = new SpeechSynthesisUtterance(message.parts[0].text);
			utterance.onend = () => {
				setMessages((prev) =>
					prev.map((msg, index) =>
						index === messageIndex ? { ...msg, isSpeaking: false } : msg
					)
				);
			};

			setMessages((prev) =>
				prev.map((msg, index) =>
					index === messageIndex ? { ...msg, isSpeaking: true } : msg
				)
			);

			window.speechSynthesis.speak(utterance);
		}
	} else {
		alert("Sorry, your browser doesn't support text-to-speech functionality.");
	}
};

export const toggleSpeechRecognition = (
	speechSupported,
	isListening,
	setIsListening,
	recognitionRef
) => {
	if (!speechSupported) {
		alert(
			"Speech recognition is not supported in your browser. Please try Chrome or Edge."
		);
		return;
	}

	if (isListening) {
		recognitionRef.current.stop();
		setIsListening(false);
	} else {
		recognitionRef.current.start();
		setIsListening(true);
	}
};

export const getFieldValue = (fields, title) => {
	return fields.find((f) => f.mt_title === title)?.mt_value || "N/A";
};

export const extractFieldsFromSections = (sections) => {
	const remainingSections = sections.slice(1);

	return remainingSections.flatMap((section) =>
		section.mt_fields
			.map((field) => {
				let value = field.mt_value || "";

				// if type is Date convert format
				if (field.mt_type === "Date" && value) {
					const date = new Date(value);
					value = date.toLocaleDateString("en-US", {
						year: "numeric",
						month: "short",
						day: "numeric",
					});
				}

				// return null if empty
				if (value === "") return null;

				return {
					mt_title: field.mt_title,
					mt_value: value,
				};
			})
			.filter((field) => field !== null)
	);
};

export const stringToNumberIfNumeric = (value) => {
	// check kung string at numeric
	if (typeof value === "string" && !isNaN(value) && value.trim() !== "") {
		return Number(value);
	}
	return value;
};

export const secureText = (type, text) => {
	const key = Buffer.from("12345678901234567890123456789012"); // 32 chars
	const iv = Buffer.from("1234567890123456"); // 16 chars

	if (!type || !text) return null;

	if (type.toLowerCase() === "encrypt") {
		const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
		let encrypted = cipher.update(text, "utf8", "base64");
		encrypted += cipher.final("base64");
		return encrypted;
	} else if (type.toLowerCase() === "decrypt") {
		try {
			const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
			let decrypted = decipher.update(text, "base64", "utf8");
			decrypted += decipher.final("utf8");
			return decrypted;
		} catch (err) {
			return "Decryption error";
		}
	}

	return null;
};

export const isLate = (t, now) => {
	if (t.tr_status === "Utilized") {
		return t.tr_type === "Material"
			? t.tr_dateDue?.toDate() < getDateOnly(now)
			: t.tr_sessionEnd?.toDate() < now;
	}
	if (t.tr_status === "Completed" && t.tr_actualEnd) {
		return t.tr_type === "Material"
			? t.tr_dateDue?.toDate() < getDateOnly(t.tr_actualEnd.toDate())
			: t.tr_sessionEnd?.toDate() < t.tr_actualEnd.toDate();
	}
	return false;
};

export const toSafeString = (value, defaultValue = null) => {
	return value != null && value !== "" ? String(value) : defaultValue;
};

export const isSameDate = (d1, d2) => {
	const date1 = d1?.toDate();
	const date2 = d2?.toDate();
	return (
		date1?.getFullYear() === date2?.getFullYear() &&
		date1?.getMonth() === date2?.getMonth() &&
		date1?.getDate() === date2?.getDate()
	);
};

export const calculatePastDue = (pastDueDates = []) => {
	if (!Array.isArray(pastDueDates)) return [];

	const results = [];

	pastDueDates.forEach((entry) => {
		if (!entry?.previousDue || !entry?.renewedAt) return;

		const prevDue =
			entry.previousDue instanceof Timestamp
				? entry.previousDue.toDate()
				: new Date(entry.previousDue);

		const renewed =
			entry.renewedAt instanceof Timestamp
				? entry.renewedAt.toDate()
				: new Date(entry.renewedAt);

		const prevDateOnly = new Date(prevDue.toDateString());
		const renewedDateOnly = new Date(renewed.toDateString());

		const diffDays = Math.floor(
			(renewedDateOnly - prevDateOnly) / (1000 * 60 * 60 * 24)
		);

		const formatted = format(prevDateOnly, "dd MMM yyyy");

		if (renewedDateOnly > prevDateOnly) {
			const label =
				diffDays === 1
					? `${formatted} (Overdue for 1 day)`
					: `${formatted} (Overdue for ${diffDays} days)`;
			results.push(label);
		} else {
			results.push(formatted);
		}
	});

	return results;
};

export const handleDownload = (filePath, fileName) => {
	const link = document.createElement("a");
	link.href = filePath;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};

export const toPHDate = (date) =>
	date
		? new Date(date.getTime() - date.getTimezoneOffset() * 60000)
				.toISOString()
				.split("T")[0]
		: "";

export const convertDateToTimestamp = (value) => {
	if (!value) return null;

	if (value?.seconds) {
		const dateOnly = value.toDate();
		dateOnly.setHours(0, 0, 0, 0);
		return Timestamp.fromDate(dateOnly);
	}

	if (value instanceof Date) {
		const dateOnly = new Date(
			value.getFullYear(),
			value.getMonth(),
			value.getDate()
		);
		return Timestamp.fromDate(dateOnly);
	}

	const parsed = new Date(value);
	const dateOnly = new Date(
		parsed.getFullYear(),
		parsed.getMonth(),
		parsed.getDate()
	);
	return Timestamp.fromDate(dateOnly);
};

export const combineDateAndTimeToTimestamp = (dateSource, timeSource) => {
	if (!dateSource || !timeSource) return null;

	const date =
		dateSource?.toDate?.() ||
		(dateSource instanceof Date ? dateSource : new Date(dateSource));

	let time;

	if (typeof timeSource === "string") {
		const [hours, minutes, seconds = 0] = timeSource.split(":").map(Number);
		time = new Date();
		time.setHours(hours, minutes, seconds, 0);
	} else {
		time =
			timeSource?.toDate?.() ||
			(timeSource instanceof Date ? timeSource : new Date(timeSource));
	}

	const merged = new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
		time.getHours(),
		time.getMinutes(),
		time.getSeconds(),
		0
	);

	return Timestamp.fromDate(merged);
};
