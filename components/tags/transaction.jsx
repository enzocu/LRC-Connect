import { Badge } from "@/components/ui/badge";
import { FaRegCalendarAlt, FaRegClock, FaMapPin } from "react-icons/fa";

export const renderResource = (transaction, isTable = false) => {
	if (!transaction) return;
	return (
		<div className="flex gap-4 items-start">
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
				className={`h-28 object-cover rounded-lg bg-gray-100 flex-shrink-0 ${
					transaction?.tr_type !== "Material" ? "w-28" : "w-20"
				}`}
			/>

			<div className="min-w-0">
				<h4
					className={`font-medium text-foreground ${
						isTable ? "text-[12px]" : "text-[14px]"
					}`}
				>
					{transaction?.tr_type === "Material"
						? transaction?.tr_resource.ma_title
						: transaction?.tr_type === "Discussion Room"
						? transaction?.tr_resource.dr_name
						: transaction?.tr_type === "Computer"
						? transaction?.tr_resource.co_name
						: "NA"}
				</h4>

				<p className="text-muted-foreground text-[12px] mb-2">
					{transaction?.tr_type === "Material"
						? "by " + transaction?.tr_resource.ma_author
						: transaction?.tr_type === "Discussion Room"
						? transaction?.tr_resource.dr_createdAt
						: transaction?.tr_type === "Computer"
						? transaction?.tr_resource.co_createdAt
						: "NA"}
				</p>

				<div className="flex flex-wrap items-center gap-2">
					<span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[11px]">
						{transaction?.tr_type}
					</span>
					{transaction?.tr_type === "Material" && (
						<>
							{transaction?.tr_format == "Hard Copy" &&
								transaction?.tr_accession && (
									<span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[11px]">
										{transaction?.tr_accession}
									</span>
								)}
							<span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[11px]">
								{transaction?.tr_format}
							</span>
						</>
					)}
				</div>

				{transaction?.tr_resource?.reportLibrary && (
					<div className="mt-2">
						<p className="text-foreground text-[12px]">Library</p>
						<p className="text-muted-foreground text-[12px]">
							{transaction?.tr_resource.reportLibrary}
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export const renderPatron = (transaction, isTable) => {
	if (!transaction) return;
	return (
		<div className="flex items-start gap-4">
			<img
				src={transaction?.us_photoURL || "/placeholder.svg"}
				alt="Avatar"
				className="w-10 h-10 rounded-full object-cover bg-gray-100 flex-shrink-0"
			/>

			<div>
				<h4
					className={`font-medium text-foreground ${
						isTable ? "text-[12px]" : "text-[14px]"
					}`}
				>
					{transaction?.us_name}
				</h4>

				<p className="text-primary-custom text-[12px] mb-2">
					{transaction?.us_type}
					<span className="text-muted-foreground">
						{" • "}
						{transaction?.us_schoolID}
					</span>
				</p>

				<div className="mb-2">
					<p className="text-foreground text-[12px]">Email</p>
					<p className="text-muted-foreground text-[12px]">
						{transaction?.us_email}
					</p>
				</div>

				<div>
					<p className="text-foreground text-[12px]">Library</p>
					<p className="text-muted-foreground text-[12px]">
						{transaction?.us_library}
					</p>
				</div>
			</div>
		</div>
	);
};

export const renderSchedule = (transaction) => {
	if (!transaction) return;
	return (
		<>
			<div className="grid grid-cols-2 gap-4">
				<div className="flex items-start gap-3">
					<FaRegCalendarAlt className="text-foreground text-[15px]  mt-[2px" />
					<div>
						<p className="text-foreground  text-[12px]">
							{transaction?.tr_dateFormatted}
						</p>
						<p className="text-muted-foreground text-[12px]">Date of Use</p>
					</div>
				</div>

				{transaction?.tr_type === "Material" && (
					<div className="flex items-start gap-3">
						<FaRegCalendarAlt className="text-foreground text-[15px]  mt-[2px]" />
						<div>
							<p className="text-foreground  text-[12px]">
								{transaction?.tr_dateDueFormatted}
							</p>
							<p className="text-muted-foreground text-[12px]">Due Date</p>
						</div>
					</div>
				)}
			</div>

			{transaction?.tr_type !== "Material" && (
				<div className="grid grid-cols-2 gap-4 mt-4">
					<div className="flex items-start gap-3">
						<FaRegClock className="text-foreground text-[15px] mt-[2px]" />
						<div>
							<p className="text-foreground text-[12px]">
								{transaction?.tr_sessionStartFormatted}
							</p>
							<p className="text-muted-foreground text-[12px]">Session Start</p>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<FaRegClock className="text-foreground text-[15px] mt-[2px]" />
						<div>
							<p className="text-foreground text-[12px]">
								{transaction?.tr_sessionEndFormatted}
							</p>
							<p className="text-muted-foreground text-[12px]">Session End</p>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export const renderLibrary = (transaction) => {
	if (!transaction) return;
	return (
		<>
			<div className="flex items-start gap-3 border border-border p-3 rounded-md">
				<FaMapPin className="text-destructive text-[15px] mt-[2px]" />
				<div>
					<p className="text-foreground  text-[12px]">
						{transaction?.tr_library || "NA"}
					</p>
					<p className="text-muted-foreground text-[12px]">Library Branch</p>
				</div>
			</div>
		</>
	);
};

export const renderStatusBadge = (transaction, tooltipAlign = "right") => {
	const toDate = (ts) =>
		ts && typeof ts.toDate === "function" ? ts.toDate() : ts;

	const status = transaction?.tr_status;
	const type = transaction?.tr_type;
	const dateUse = toDate(transaction?.tr_date);
	const dateDue = toDate(transaction?.tr_dateDue);
	const sessionStart = toDate(transaction?.tr_sessionStart);
	const sessionEnd = toDate(transaction?.tr_sessionEnd);
	const actualEnd = toDate(transaction?.tr_actualEnd);
	const updateAt = toDate(transaction?.tr_updatedAt);

	const now = new Date();

	const isSameDay = (a, b) =>
		a?.getFullYear() === b?.getFullYear() &&
		a?.getMonth() === b?.getMonth() &&
		a?.getDate() === b?.getDate();

	const isSameDateTime = (a, b) =>
		a?.getFullYear() === b?.getFullYear() &&
		a?.getMonth() === b?.getMonth() &&
		a?.getDate() === b?.getDate() &&
		a?.getHours() === b?.getHours() &&
		a?.getMinutes() === b?.getMinutes();

	const formatFullDateTime = (date) =>
		date?.toLocaleString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		}) ?? "";

	const formatDateOnly = (date) =>
		date?.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		}) ?? "";

	const daysBetween = (from, to) => {
		const ms = to - from;
		if (ms < 0) return "Today";

		const plural = (num, word) => `${num} ${word}${num === 1 ? "" : "s"}`;

		if (ms >= 86400000) {
			const days = Math.floor(ms / 86400000);
			return plural(days, "day");
		}

		const h = Math.floor(ms / 3600000);
		const m = Math.floor((ms % 3600000) / 60000);

		if (h === 0 && m === 0) return "Now";
		if (h === 0) return plural(m, "min");
		if (m === 0) return plural(h, "hr");
		return `${plural(h, "hr")} ${plural(m, "min")}`;
	};

	let badgeColor = "default";
	let tooltipTitle = "Details";
	let tooltipText = "More information about this status.";

	if (status === "Reserved") {
		if (type === "Material") {
			if (now < dateUse) {
				badgeColor = "default";
				tooltipTitle = daysBetween(now, dateUse);
				tooltipText = `This material reservation will start in ${daysBetween(
					now,
					dateUse
				)}. It is scheduled for use on ${formatDateOnly(
					dateUse
				)}. Please make sure it is ready before then.`;
			} else if (isSameDay(now, dateUse)) {
				badgeColor = "warning";
				tooltipTitle = daysBetween(now, dateUse);
				tooltipText = `Today is the start date for this reservation (${formatDateOnly(
					dateUse
				)}). The material should be in use or picked up soon.`;
			} else if (now > dateUse) {
				badgeColor = "error";
				tooltipTitle = "Pending Start";
				tooltipText = `This reservation was supposed to start on ${formatDateOnly(
					dateUse
				)}, but it hasn't started yet. It should be used before ${formatDateOnly(
					dateDue
				)} to avoid automatic cancellation.`;
			}
		} else {
			if (now < sessionStart) {
				badgeColor = "default";
				tooltipTitle = daysBetween(now, sessionStart);
				tooltipText = `This session will start in ${daysBetween(
					now,
					sessionStart
				)}. Make sure everything is ready by ${formatFullDateTime(
					sessionStart
				)}.`;
			} else if (isSameDateTime(now, sessionStart)) {
				badgeColor = "warning";
				tooltipTitle = daysBetween(now, sessionStart);
				tooltipText = `This session is scheduled to start now (${formatFullDateTime(
					sessionStart
				)}). Please proceed accordingly.`;
			} else if (now > sessionStart) {
				badgeColor = "error";
				tooltipTitle = "Pending Start";
				tooltipText = `This session was supposed to start on ${formatFullDateTime(
					sessionStart
				)}, but it hasn’t been marked as started. If not updated by ${formatFullDateTime(
					sessionEnd
				)}, it may be cancelled.`;
			}
		}
	} else if (status === "Utilized") {
		if (type === "Material") {
			if (now < dateDue) {
				badgeColor = "default";
				tooltipTitle = daysBetween(now, dateDue);
				tooltipText = `This material is currently in use and should be returned in ${daysBetween(
					now,
					dateDue
				)}. Please return it on time and in good condition.`;
			} else if (isSameDay(now, dateDue)) {
				badgeColor = "warning";
				tooltipTitle = "Due Today";
				tooltipText = `This material is due for return today (${formatDateOnly(
					dateDue
				)}). Please return it before the day ends.`;
			} else {
				badgeColor = "error";
				tooltipTitle = "Overdue";
				tooltipText = `This material was due on ${formatDateOnly(
					dateDue
				)} and is now overdue. Please return it immediately to avoid penalties.`;
			}
		} else {
			if (now < sessionEnd) {
				badgeColor = "default";
				tooltipTitle = daysBetween(now, sessionEnd);
				tooltipText = `This session is currently ongoing. It is expected to end in ${daysBetween(
					now,
					sessionEnd
				)}. Make sure it ends on time.`;
			} else {
				badgeColor = "error";
				tooltipTitle = "Overdue";
				tooltipText = `This session should have ended on ${formatFullDateTime(
					sessionEnd
				)}. Please confirm if it was completed or needs to be closed.`;
			}
		}
	} else if (status === "Cancelled") {
		badgeColor = "error";
		tooltipTitle = "Cancelled";
		tooltipText = `This transaction has been cancelled. No further actions are needed unless it will be rebooked or rescheduled. Last updated: ${formatFullDateTime(
			updateAt
		)}.`;
	} else if (status === "Completed") {
		if (type === "Material") {
			if (actualEnd < dateDue) {
				badgeColor = "success";
				tooltipTitle = "Completed Early";
				tooltipText = `The material was returned before the due date. No issues were reported. Good job! Returned at ${formatFullDateTime(
					actualEnd
				)}.`;
			} else if (isSameDay(actualEnd, dateDue)) {
				badgeColor = "success";
				tooltipTitle = "Completed On Time";
				tooltipText = `The material was returned on the scheduled due date (${formatFullDateTime(
					actualEnd
				)}). No further action is needed.`;
			} else {
				badgeColor = "error";
				tooltipTitle = `${daysBetween(dateDue, actualEnd)} Late`;
				tooltipText = `The material was returned ${daysBetween(
					dateDue,
					actualEnd
				)} late on ${formatFullDateTime(
					actualEnd
				)}. It was supposed to be returned on ${formatDateOnly(
					dateDue
				)}. Please check if any penalty applies.`;
			}
		} else {
			if (actualEnd < sessionEnd) {
				badgeColor = "success";
				tooltipTitle = "Completed Early";
				tooltipText = `The session ended earlier than scheduled. All activities were completed ahead of time. Ended at ${formatFullDateTime(
					actualEnd
				)}.`;
			} else if (isSameDateTime(actualEnd, sessionEnd)) {
				badgeColor = "success";
				tooltipTitle = "Completed On Time";
				tooltipText = `The session ended on its scheduled date (${formatFullDateTime(
					actualEnd
				)}). All tasks were completed as planned.`;
			} else {
				badgeColor = "error";
				tooltipTitle = `${daysBetween(sessionEnd, actualEnd)} Late`;
				tooltipText = `This session ended ${daysBetween(
					sessionEnd,
					actualEnd
				)} after the scheduled date. It was supposed to end on ${formatFullDateTime(
					sessionEnd
				)}, but was actually completed on ${formatFullDateTime(
					actualEnd
				)}. Review if delay needs to be recorded.`;
			}
		}
	}

	const getStatusBadge = (color) => {
		switch (color) {
			case "success":
				return "bg-green-100 text-green-700";
			case "warning":
				return "text-[#FF9A00] bg-[#FF9A00]/20";
			case "error":
				return "bg-red-100 text-red-700";
			default:
				return "bg-primary/10 text-primary";
		}
	};

	const alignmentClass = tooltipAlign === "left" ? "left-0" : "right-0";
	const arrowPosition = tooltipAlign === "left" ? "left-4" : "right-4";

	return (
		<div className="relative group inline-block">
			<Badge
				className={`${getStatusBadge(
					badgeColor
				)} text-[12px] transition-none hover:bg-inherit hover:text-inherit`}
			>
				{tooltipTitle}
			</Badge>

			<div
				className={`absolute top-full ${alignmentClass} mt-2 px-3 py-2 bg-white dark:bg-[#1e1e1e] text-gray-700 dark:text-gray-200 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-64 shadow-md border border-border`}
			>
				<div className="font-semibold mb-1">{tooltipTitle}</div>
				<div className="text-[11px]">{tooltipText}</div>
				<div
					className={`absolute -top-2 ${arrowPosition} transform border-4 border-transparent border-b-white dark:border-b-[#1e1e1e]`}
				></div>
			</div>
		</div>
	);
};
