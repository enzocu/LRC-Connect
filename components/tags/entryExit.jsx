import { FiClock, FiCalendar } from "react-icons/fi";

export const renderuserDetails = (user, isTable = false) => {
	if (!user) return;
	return (
		<div className="flex items-start gap-4">
			<img
				src={
					user?.lo_user?.us_photoURL || "/placeholder.svg?height=40&width=40"
				}
				alt="user"
				className="w-14 h-14 rounded-full object-cover bg-gray-100  flex-shrink-0"
			/>

			<div className="min-w-0">
				<h4
					className={`text-foreground font-medium break-words whitespace-normal  ${
						isTable ? "text-[12px]" : "text-[14px]"
					}`}
				>
					{user?.lo_user?.us_name || "user Name"}
				</h4>
				<p className="text-primary-custom text-[12px] mb-2 break-words whitespace-normal">
					{user?.lo_user?.us_type || "Type"}
					<span className="text-muted-foreground break-words whitespace-normal">
						{" • "}
						{user?.lo_user?.us_schoolID || "ID"}
					</span>
				</p>
				<div className="mb-2">
					<p className="text-foreground text-[12px]">Email</p>
					<p className="text-muted-foreground text-[12px] break-words whitespace-normal">
						{user?.lo_user?.us_email || "NA"}
					</p>
				</div>
				<div>
					<p className="text-foreground text-[12px]">Library</p>
					<p className="text-muted-foreground text-[12px] break-words whitespace-normal">
						{user?.lo_user?.us_library || "NA"}
					</p>
				</div>
			</div>
			{!isTable && (
				<Badge className={`text-[12px] ${getStatusColor(user?.lo_status)}`}>
					{user?.lo_status}
				</Badge>
			)}
		</div>
	);
};

export const renderlibraryDetails = (library, isTable = false) => {
	return (
		<div className="flex items-start gap-4">
			<img
				src={
					library?.lo_library?.li_photoURL ||
					"/placeholder.svg?height=40&width=40"
				}
				alt="library"
				className="w-[90px] h-[90px] rounded-lg object-cover bg-gray-100 flex-shrink-0"
			/>

			<div className="min-w-0">
				<h4
					className={`text-foreground font-medium break-words whitespace-normal  ${
						isTable ? "text-[12px]" : "text-[14px]"
					}`}
				>
					{library?.lo_library?.li_name || "Library Name"}
				</h4>
				<p className="text-primary-custom text-[12px] mb-2 break-words whitespace-normal">
					{library?.lo_library?.li_qr || "QR"}
					<span className="text-muted-foreground break-words whitespace-normal">
						{" • "}
						{library?.lo_library?.li_schoolID || "ID"}
					</span>
				</p>

				<div className="mb-2">
					<p className="text-foreground text-[12px]">School Name</p>
					<p className="text-muted-foreground text-[12px] break-words whitespace-normal">
						{library?.lo_library?.li_schoolName || "NA"}
					</p>
				</div>

				<div>
					<p className="text-foreground text-[12px]">Address</p>
					<p className="text-muted-foreground text-[12px] break-words whitespace-normal">
						{library?.lo_library?.li_address || "NA"}
					</p>
				</div>
			</div>
			{!isTable && (
				<Badge className={`text-[12px] ${getStatusColor(library.lo_status)}`}>
					{library.lo_status}
				</Badge>
			)}
		</div>
	);
};

export const renderuserLog = (user) => {
	return (
		<div className="space-y-4 mb-4">
			<div className="flex items-start gap-3">
				<FiCalendar className="text-foreground text-[15px] mt-[2px]" />
				<div>
					<p className="text-foreground text-[12px] break-words whitespace-normal">
						{user?.lo_createdAt || "NA"}
					</p>
					<p className="text-muted-foreground text-[12px]">Date</p>
				</div>
			</div>

			<div className="grid grid-cols-3 gap-3">
				<div className="flex items-start gap-2">
					<FiClock className="flex-shrink-0 text-foreground text-[15px] mt-[2px]" />
					<div>
						<p className="text-foreground  text-[12px] break-words whitespace-normal">
							{user?.lo_timeIn || "NA"}
						</p>
						<p className="text-muted-foreground text-[12px]">Time In</p>
					</div>
				</div>

				<div className="flex items-start gap-2">
					<FiClock className="flex-shrink-0 text-foreground text-[15px] mt-[2px]" />
					<div>
						<p className="text-foreground  text-[12px] break-words whitespace-normal">
							{user?.lo_timeOut || "NA"}
						</p>
						<p className="text-muted-foreground text-[12px]">Time Out</p>
					</div>
				</div>

				<div className="flex items-start gap-2">
					<FiClock className="flex-shrink-0 text-foreground text-[15px] mt-[2px]" />
					<div>
						<p className="text-foreground text-[12px] break-words whitespace-normal">
							{user?.lo_duration || "NA"}
						</p>
						<p className="text-muted-foreground text-[12px]">Duration</p>
					</div>
				</div>
			</div>
		</div>
	);
};
