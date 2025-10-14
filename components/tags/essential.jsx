"use client";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export const toggleFilterOrderBy = (key, setFilters) => {
	setFilters((prev) => ({
		...prev,
		[key]: prev[key] === "Descending" ? "Ascending" : "Descending",
	}));
};

export const TypeSelect = ({ value, onChange, name }) => {
	return (
		<div className="space-y-2">
			<label className="block font-medium text-foreground text-[12px]">
				Select a Type
			</label>
			<select
				value={value}
				onChange={onChange}
				name={name}
				className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
			>
				{["User Type", "Section", "Year", "Program", "School"].map((type) => (
					<option key={type} value={type}>
						{type}
					</option>
				))}
			</select>
		</div>
	);
};

export const RoleSelect = ({ value, onChange, name }) => {
	const handleChange = (e) => {
		onChange(e);
	};

	return (
		<div className="space-y-2">
			<label className="block font-medium text-foreground text-[12px]">
				Select a Role
			</label>
			<select
				value={value}
				onChange={handleChange}
				name={name}
				className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
			>
				<option value="Patron">Patron</option>
				<option value="Personnel">Personnel</option>
			</select>
		</div>
	);
};

export const UserTypeSelect = ({ value, onChange, name, role = "Patron" }) => {
	const options =
		role === "Patron"
			? [
					{
						label: "Patrons",
						options: ["Student", "Faculty", "Administrator"],
					},
					{ label: "Assistants", options: ["Student Assistant"] },
			  ]
			: [
					{ label: "Assistants", options: ["Administrative Assistant"] },
					{
						label: "Librarians",
						options: ["Chief Librarian", "Head Librarian"],
					},
			  ];

	return (
		<div className="space-y-2">
			<label className="block font-medium text-foreground text-[12px]">
				Select a User Type
			</label>
			<select
				value={value}
				onChange={onChange}
				name={name}
				className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
			>
				<option value="All">All User Types</option>
				{options.map(({ label, options }) => (
					<optgroup key={label} label={label}>
						{options.map((opt) => (
							<option key={opt} value={opt}>
								{opt}
							</option>
						))}
					</optgroup>
				))}
			</select>
		</div>
	);
};

export const MaTypeSelect = ({ value, onChange, name }) => {
	return (
		<div className="space-y-2">
			<label className="block font-medium text-foreground text-[12px]">
				Select a Material Type
			</label>
			<select
				value={value}
				onChange={onChange}
				name={name}
				className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
			>
				{["Material", "Format"].map((type) => (
					<option key={type} value={type}>
						{type}
					</option>
				))}
			</select>
		</div>
	);
};

export const YearInput = ({ label, value, onChange }) => (
	<div className="space-y-2">
		<label className="block font-medium text-foreground text-[12px]">
			{label}
		</label>
		<input
			type="number"
			value={value}
			onChange={onChange}
			min="1900"
			max="2100"
			placeholder="YYYY"
			className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
		/>
	</div>
);

export const DateInput = ({ label, value, onChange }) => (
	<div className="space-y-2">
		<label className="block font-medium text-foreground text-[12px]">
			{label}
		</label>
		<input
			type="date"
			value={value}
			onChange={onChange}
			className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
		/>
	</div>
);

export const FilterFormatSelect = ({ value, onChange }) => {
	return (
		<div className="space-y-2">
			<label className="block font-medium text-foreground text-[12px]">
				Select a Format
			</label>
			<select
				value={value}
				onChange={onChange}
				className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
			>
				<option value="All">All Formats</option>
				<option value="Hard Copy">Hard Copy</option>
				<option value="Soft Copy">Soft Copy</option>
				<option value="Audio Copy">Audio Copy</option>
			</select>
		</div>
	);
};

export const FilterMaterialSelect = ({ value, onChange, materialList }) => {
	return (
		<div className="space-y-2">
			<label className="block font-medium text-foreground text-[12px]">
				Select a Material
			</label>
			<select
				value={value}
				onChange={onChange}
				className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
			>
				<option value="All">All Materials</option>
				{materialList.map((material) => (
					<option key={material.id} value={material.id}>
						{material.ma_qr}
					</option>
				))}
			</select>
		</div>
	);
};

export const FilterDRSelect = ({ value, onChange, discussionRoomList }) => {
	return (
		<div className="space-y-2">
			<label className="block font-medium text-foreground text-[12px]">
				Select a Discussion Room
			</label>
			<select
				value={value}
				onChange={onChange}
				className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
			>
				<option value="All">All Discussion Rooms</option>
				{discussionRoomList.map((room) => (
					<option key={room.id} value={room.id}>
						{room.dr_qr}
					</option>
				))}
			</select>
		</div>
	);
};

export const FilterComputerSelect = ({ value, onChange, computerList }) => {
	return (
		<div className="space-y-2">
			<label className="block font-medium text-foreground text-[12px]">
				Select a Computer
			</label>
			<select
				value={value}
				onChange={onChange}
				className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
			>
				<option value="All">All Computers</option>
				{computerList.map((computer) => (
					<option key={computer.id} value={computer.id}>
						{computer.co_qr}
					</option>
				))}
			</select>
		</div>
	);
};

export const FilterLibrarySelect = ({ value, onChange, libraryList }) => {
	return (
		<div className="space-y-2">
			<label className="block font-medium text-foreground text-[12px]">
				Select a Library
			</label>
			<select
				value={value}
				onChange={onChange}
				className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
			>
				<option value="All">All Libraries</option>
				{libraryList.map((library) => (
					<option key={library.id} value={library.id}>
						{library.li_name}
					</option>
				))}
			</select>
		</div>
	);
};

export const FilterMaterialTypeSelect = ({ value, onChange, mtList }) => {
	return (
		<div className="space-y-2">
			<label className="block font-medium text-foreground text-[12px]">
				Select a Material Type
			</label>
			<select
				value={value}
				onChange={onChange}
				className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
			>
				<option value="All">All Material Types</option>
				{mtList.map((mt) => (
					<option key={mt.id} value={mt.id}>
						{mt.mt_name}
					</option>
				))}
			</select>
		</div>
	);
};

export const FilterCategorySelect = ({ value, onChange, caList }) => {
	return (
		<div className="space-y-2">
			<label className="block font-medium text-foreground text-[12px]">
				Select a Category
			</label>
			<select
				value={value}
				onChange={onChange}
				className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
			>
				<option value="All">All Categories</option>
				{caList.map((ca) => (
					<option key={ca.id} value={ca.id}>
						{ca.ca_name}
					</option>
				))}
			</select>
		</div>
	);
};

export const FilterShelfSelect = ({ value, onChange, shList }) => {
	return (
		<div className="space-y-2">
			<label className="block font-medium text-foreground text-[12px]">
				Select a Shelf
			</label>
			<select
				value={value}
				onChange={onChange}
				className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
			>
				<option value="All">All Shelves</option>
				{shList.map((sh) => (
					<option key={sh.id} value={sh.id}>
						{sh.sh_name}
					</option>
				))}
			</select>
		</div>
	);
};

export const FilterCoursesSelect = ({
	value,
	onChange,
	setFilters,
	prefix = "b_",
}) => {
	const handleCourseChange = (e) => {
		const selectedCourse = e.target.value;
		onChange(e);
		setFilters((prev) => ({
			...prev,
			[`${prefix}courses`]: selectedCourse,
			[`${prefix}year`]: "All",
			[`${prefix}tracks`]: "All",
			[`${prefix}institute`]: "All",
			[`${prefix}strand`]: "All",
			[`${prefix}program`]: "All",
		}));
	};

	return (
		<div className="space-y-2">
			<label className="block font-medium text-foreground text-[12px]">
				Select a Course
			</label>
			<select
				value={value}
				onChange={handleCourseChange}
				className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
			>
				<option value="All">All Courses</option>
				{["Senior High School", "College Courses"].map((courses, index) => (
					<option key={index} value={courses}>
						{courses}
					</option>
				))}
			</select>
		</div>
	);
};

export const FilterYearSelect = ({ value, onChange, selectedCourses }) => {
	return (
		<div className="space-y-2">
			<label className="block font-medium text-foreground text-[12px]">
				Select a Year
			</label>
			<select
				value={value}
				onChange={onChange}
				className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
			>
				<option value="All">All Years</option>
				{(selectedCourses == "Senior High School"
					? ["Grade 11", "Grade 12"]
					: ["1st Year", "2nd Year", "3rd Year", "4th Year"]
				).map((year, index) => (
					<option key={index} value={year}>
						{year}
					</option>
				))}
			</select>
		</div>
	);
};

export const FilterCourseSelects = ({
	selectedCourse,
	filters,
	setFilters,
	mainList,
	subList,
	prefix = "b_",
	selectedCourseID,
	setSelectedCourseID,
}) => {
	if (selectedCourse === "All") return null;

	const mainKey =
		selectedCourse === "Senior High School"
			? `${prefix}tracks`
			: `${prefix}institute`;

	const subKey =
		selectedCourse === "Senior High School"
			? `${prefix}strand`
			: `${prefix}program`;

	return (
		<>
			{/* TRACK / INSTITUTE */}
			<div className="space-y-2">
				<label className="block font-medium text-foreground text-[12px]">
					Select a{" "}
					{selectedCourse === "Senior High School" ? "Track" : "Institute"}
				</label>
				<select
					value={selectedCourseID || ""}
					onChange={(e) => {
						const selectedID = e.target.value;
						setSelectedCourseID(selectedID);

						const selectedItem = mainList.find(
							(item) => item.id === selectedID
						);

						if (selectedItem) {
							if (selectedCourse === "Senior High School") {
								setFilters({
									...filters,
									[mainKey]: selectedItem.cs_title,
									[subKey]: "All",
								});
							} else {
								setFilters({
									...filters,
									[mainKey]: selectedItem.cs_title,
									[subKey]: "All",
								});
							}
						}
					}}
					className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
				>
					<option value="All">
						{selectedCourse === "Senior High School"
							? "All Tracks"
							: "All Institutes"}
					</option>
					{mainList.map((course) => (
						<option key={course.id} value={course.id}>
							{course.cs_title}
						</option>
					))}
				</select>
			</div>

			{/* STRAND / PROGRAM */}
			<div className="space-y-2">
				<label className="block font-medium text-foreground text-[12px]">
					Select a{" "}
					{selectedCourse === "Senior High School" ? "Strand" : "Program"}
				</label>
				<select
					value={
						selectedCourse === "Senior High School"
							? filters[`${prefix}strand`] || "All"
							: filters[`${prefix}program`] || "All"
					}
					onChange={(e) => {
						const val = e.target.value;
						if (selectedCourse === "Senior High School") {
							setFilters({ ...filters, [subKey]: val });
						} else {
							setFilters({ ...filters, [subKey]: val });
						}
					}}
					className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
				>
					<option value="All">
						{selectedCourse === "Senior High School"
							? "All Strands"
							: "All Programs"}
					</option>
					{subList.map((sub, index) => (
						<option key={index} value={sub}>
							{sub}
						</option>
					))}
				</select>
			</div>
		</>
	);
};

export const FilterSectionInput = ({ value, onChange }) => {
	return (
		<div className="space-y-2">
			<label className="block font-medium text-foreground text-[12px]">
				Section Name
			</label>
			<Input
				placeholder="Enter Section..."
				value={value}
				onChange={onChange}
				className="h-9 bg-card text-foreground border-border"
				style={{ fontSize: "12px" }}
			/>
		</div>
	);
};

export const StatusSelect = ({ label, value, onChange, all = false }) => {
	return (
		<div className="space-y-2">
			<label className="block font-medium text-foreground text-[12px]">
				Select {label}
			</label>
			<select
				value={value}
				onChange={onChange}
				className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
			>
				{all && <option value="All">All Status</option>}
				<option value="Active">Active</option>
				<option value="Inactive">Inactive</option>
			</select>
		</div>
	);
};

export const formatDateRangeFields = (filters, keys) => {
	const formatted = { ...filters };
	keys.forEach((key) => {
		const value = filters[key];
		if (value) {
			const date = new Date(value);
			if (!isNaN(date)) {
				formatted[key] = date.toLocaleDateString("en-US", {
					month: "short",
					day: "2-digit",
					year: "numeric",
				});
			}
		}
	});
	return formatted;
};

//Material
export const getActiveFiltersMA = (
	filters,
	activeSection,
	materialTypes,
	categories,
	shelves
) => {
	const activeFilters = [];

	const formattedFilters = formatDateRangeFields(filters, [
		"a_dateRangeStart",
		"a_dateRangeEnd",
	]);

	const sectionMap = {
		A: [
			{ key: "a_type", label: "Type", defaultValue: "" },
			{ key: "a_roomOnly", label: "Room Only", defaultValue: false },
			{ key: "a_userType", label: "User Type", defaultValue: "All" },
			{ key: "a_dateRangeStart", label: "Start Date", defaultValue: "" },
			{ key: "a_dateRangeEnd", label: "End Date", defaultValue: "" },
			{ key: "a_orderBy", label: "Order By", defaultValue: "Descending" },
		],
		B: [
			{
				key: "b_materialStatus",
				label: "Material Status",
				defaultValue: "",
			},
			{
				key: "b_materialFormat",
				label: "Material Format",
				defaultValue: "All",
			},
			{
				key: "b_materialType",
				label: "Material Type",
				defaultValue: "All",
				transform: (id) =>
					materialTypes.find((m) => m.id === id)?.mt_name || "Unknown",
			},
			{
				key: "b_category",
				label: "Category",
				defaultValue: "All",
				transform: (id) =>
					categories.find((c) => c.id === id)?.ca_name || "Unknown",
			},
			{
				key: "b_shelf",
				label: "Shelf",
				defaultValue: "All",
				transform: (id) =>
					shelves.find((s) => s.id === id)?.sh_name || "Unknown",
			},
			{ key: "b_yearRangeStart", label: "Year Start", defaultValue: "" },
			{ key: "b_yearRangeEnd", label: "Year End", defaultValue: "" },
			{ key: "b_orderBy", label: "Order By", defaultValue: "Descending" },
		],
	};

	const fields = sectionMap[activeSection] || [];

	fields.forEach(({ key, label, defaultValue, check, transform }) => {
		const value = formattedFilters[key];
		if (check ? check() : value !== defaultValue) {
			activeFilters.push({
				key,
				label,
				value: transform ? transform(value) : value,
			});
		}
	});

	return activeFilters;
};

export const renderFiltersMA = (
	setFilters,
	filters,
	sections,
	activeSection,
	materialTypes,
	categories,
	shelves
) => {
	const section = sections.find((s) => s.id === activeSection);

	switch (section.id) {
		case "A":
			return (
				<div className="space-y-4">
					<MaTypeSelect
						value={filters.a_type}
						onChange={(e) => setFilters({ ...filters, a_type: e.target.value })}
					/>

					<div className="space-y-2">
						<label className="flex items-center gap-2 cursor-pointer text-[11px]">
							<Checkbox
								checked={filters.a_roomOnly}
								onCheckedChange={(checked) =>
									setFilters({ ...filters, a_roomOnly: checked })
								}
							/>
							<span className="text-foreground text-[11px]">
								Show only materials used in Library
							</span>
						</label>
					</div>

					<UserTypeSelect
						value={filters.a_userType}
						onChange={(e) =>
							setFilters({ ...filters, a_userType: e.target.value })
						}
					/>
					<DateInput
						label="Date Range - Start"
						value={filters.a_dateRangeStart}
						onChange={(e) =>
							setFilters({ ...filters, a_dateRangeStart: e.target.value })
						}
					/>
					<DateInput
						label="Date Range - End"
						value={filters.a_dateRangeEnd}
						onChange={(e) =>
							setFilters({ ...filters, a_dateRangeEnd: e.target.value })
						}
					/>
				</div>
			);

		case "B":
			return (
				<div className="space-y-4">
					<StatusSelect
						label="a Material Status"
						value={filters.b_materialStatus}
						onChange={(e) =>
							setFilters({ ...filters, b_materialStatus: e.target.value })
						}
					/>

					<FilterFormatSelect
						value={filters.b_materialFormat}
						onChange={(e) =>
							setFilters({
								...filters,
								b_materialFormat: e.target.value,
							})
						}
					/>

					<FilterMaterialTypeSelect
						value={filters.b_materialType}
						onChange={(e) =>
							setFilters({ ...filters, b_materialType: e.target.value })
						}
						mtList={materialTypes}
					/>

					<FilterCategorySelect
						value={filters.b_category}
						onChange={(e) =>
							setFilters({ ...filters, b_category: e.target.value })
						}
						caList={categories}
					/>

					<FilterShelfSelect
						value={filters.b_shelf}
						onChange={(e) =>
							setFilters({ ...filters, b_shelf: e.target.value })
						}
						shList={shelves}
					/>

					<YearInput
						label="Copyright Range - Start"
						value={filters.b_yearRangeStart}
						onChange={(e) =>
							setFilters({ ...filters, b_yearRangeStart: e.target.value })
						}
					/>
					<YearInput
						label="Copyright Range - End"
						value={filters.b_yearRangeEnd}
						onChange={(e) =>
							setFilters({ ...filters, b_yearRangeEnd: e.target.value })
						}
					/>
				</div>
			);

		default:
			return null;
	}
};

//DR
export const getActiveFiltersDR = (filters, activeSection) => {
	const activeFilters = [];

	const formattedFilters = formatDateRangeFields(filters, [
		"a_dateRangeStart",
		"a_dateRangeEnd",
		"b_dateRangeStart",
		"b_dateRangeEnd",
	]);

	const sectionMap = {
		A: [
			{ key: "a_userType", label: "User Type", defaultValue: "All" },
			{ key: "a_dateRangeStart", label: "Start Date", defaultValue: "" },
			{ key: "a_dateRangeEnd", label: "End Date", defaultValue: "" },
			{ key: "a_orderBy", label: "Order By", defaultValue: "Descending" },
		],
		B: [
			{ key: "b_roomStatus", label: "Room Status", defaultValue: "" },
			{ key: "b_dateRangeStart", label: "Start Date", defaultValue: "" },
			{ key: "b_dateRangeEnd", label: "End Date", defaultValue: "" },
			{ key: "b_orderBy", label: "Order By", defaultValue: "Descending" },
		],
	};

	const fields = sectionMap[activeSection] || [];

	fields.forEach(({ key, label, defaultValue, check }) => {
		const value = formattedFilters[key];
		if (check ? check() : value !== defaultValue) {
			activeFilters.push({ key, label, value });
		}
	});

	return activeFilters;
};

export const renderFiltersDR = (
	setFilters,
	filters,
	sections,
	activeSection
) => {
	const section = sections.find((s) => s.id === activeSection);

	switch (section.id) {
		case "A": // Summary
			return (
				<div className="space-y-4">
					<UserTypeSelect
						value={filters.a_userType}
						onChange={(e) =>
							setFilters({ ...filters, a_userType: e.target.value })
						}
					/>
					<DateInput
						label="Date Range - Start"
						value={filters.a_dateRangeStart}
						onChange={(e) =>
							setFilters({ ...filters, a_dateRangeStart: e.target.value })
						}
					/>
					<DateInput
						label="Date Range - End"
						value={filters.a_dateRangeEnd}
						onChange={(e) =>
							setFilters({ ...filters, a_dateRangeEnd: e.target.value })
						}
					/>
				</div>
			);
		case "B": // Total Discussion Rooms
			return (
				<div className="space-y-4">
					<StatusSelect
						label="a Room Status"
						value={filters.b_roomStatus}
						onChange={(e) =>
							setFilters({ ...filters, b_roomStatus: e.target.value })
						}
					/>
					<DateInput
						label="Date Range - Start"
						value={filters.b_dateRangeStart}
						onChange={(e) =>
							setFilters({ ...filters, b_dateRangeStart: e.target.value })
						}
					/>
					<DateInput
						label="Date Range - End"
						value={filters.b_dateRangeEnd}
						onChange={(e) =>
							setFilters({ ...filters, b_dateRangeEnd: e.target.value })
						}
					/>
				</div>
			);

		default:
			return null;
	}
};

//Computer
export const getActiveFiltersCO = (filters, activeSection) => {
	const activeFilters = [];

	const formattedFilters = formatDateRangeFields(filters, [
		"a_dateRangeStart",
		"a_dateRangeEnd",
		"b_dateRangeStart",
		"b_dateRangeEnd",
	]);

	const sectionMap = {
		A: [
			{ key: "a_userType", label: "User Type", defaultValue: "All" },
			{ key: "a_dateRangeStart", label: "Start Date", defaultValue: "" },
			{ key: "a_dateRangeEnd", label: "End Date", defaultValue: "" },
			{ key: "a_orderBy", label: "Order By", defaultValue: "Descending" },
		],
		B: [
			{
				key: "b_computerStatus",
				label: "Computer Status",
				defaultValue: "",
			},
			{ key: "b_dateRangeStart", label: "Start Date", defaultValue: "" },
			{ key: "b_dateRangeEnd", label: "End Date", defaultValue: "" },
			{ key: "b_orderBy", label: "Order By", defaultValue: "Descending" },
		],
	};

	const fields = sectionMap[activeSection] || [];

	fields.forEach(({ key, label, defaultValue, check }) => {
		const value = formattedFilters[key];
		if (check ? check() : value !== defaultValue) {
			activeFilters.push({ key, label, value });
		}
	});

	return activeFilters;
};

export const renderFiltersCO = (
	setFilters,
	filters,
	sections,
	activeSection
) => {
	const section = sections.find((s) => s.id === activeSection);

	switch (section.id) {
		case "A": // Summer
			return (
				<div className="space-y-4">
					<UserTypeSelect
						value={filters.a_userType}
						onChange={(e) =>
							setFilters({ ...filters, a_userType: e.target.value })
						}
					/>
					<DateInput
						label="Date Range - Start"
						value={filters.a_dateRangeStart}
						onChange={(e) =>
							setFilters({ ...filters, a_dateRangeStart: e.target.value })
						}
					/>
					<DateInput
						label="Date Range - End"
						value={filters.a_dateRangeEnd}
						onChange={(e) =>
							setFilters({ ...filters, a_dateRangeEnd: e.target.value })
						}
					/>
				</div>
			);

		case "B": // Total Computers
			return (
				<div className="space-y-4">
					<StatusSelect
						label="a Computer Status"
						value={filters.b_computerStatus}
						onChange={(e) =>
							setFilters({ ...filters, b_computerStatus: e.target.value })
						}
					/>
					<DateInput
						label="Date Range - Start"
						value={filters.b_dateRangeStart}
						onChange={(e) =>
							setFilters({ ...filters, b_dateRangeStart: e.target.value })
						}
					/>
					<DateInput
						label="Date Range - End"
						value={filters.b_dateRangeEnd}
						onChange={(e) =>
							setFilters({ ...filters, b_dateRangeEnd: e.target.value })
						}
					/>
				</div>
			);

		default:
			return null;
	}
};

//User
export const getActiveFiltersUS = (
	filters,
	activeSection,
	libraryList,
	materialList,
	discussionRoomList,
	computerList
) => {
	const activeFilters = [];

	const formattedFilters = formatDateRangeFields(filters, [
		"a_dateRangeStart",
		"a_dateRangeEnd",
		"b_dateRangeStart",
		"b_dateRangeEnd",
		"c_dateRangeStart",
		"c_dateRangeEnd",
		"d_dateRangeStart",
		"d_dateRangeEnd",
	]);

	const sectionMap = {
		A: [
			{ key: "a_type", label: "Type", defaultValue: "All" },
			{ key: "a_status", label: "Status", defaultValue: "" },
			{ key: "a_dateRangeStart", label: "Start Date", defaultValue: "" },
			{ key: "a_dateRangeEnd", label: "End Date", defaultValue: "" },
			{ key: "a_orderBy", label: "Order By", defaultValue: "Descending" },
		],

		B: [
			{ key: "b_role", label: "Role", defaultValue: "" },
			{ key: "b_userType", label: "User Type", defaultValue: "All" },
			{ key: "b_status", label: "Status", defaultValue: "Active" },
			{ key: "b_courses", label: "Course", defaultValue: "All" },
			{ key: "b_year", label: "Year", defaultValue: "All" },
			{ key: "b_tracks", label: "Track", defaultValue: "All" },
			{ key: "b_strand", label: "Strand", defaultValue: "All" },
			{ key: "b_institute", label: "Institute", defaultValue: "All" },
			{ key: "b_program", label: "Program", defaultValue: "All" },
			{ key: "b_section", label: "Section", defaultValue: "" },
			{ key: "b_dateRangeStart", label: "Start Date", defaultValue: "" },
			{ key: "b_dateRangeEnd", label: "End Date", defaultValue: "" },
		],

		C: [
			{ key: "c_role", label: "Role", defaultValue: "" },
			{ key: "c_userType", label: "User Type", defaultValue: "All" },
			{ key: "c_status", label: "Status", defaultValue: "Active" },
			{ key: "c_courses", label: "Course", defaultValue: "All" },
			{ key: "c_year", label: "Year", defaultValue: "All" },
			{ key: "c_tracks", label: "Track", defaultValue: "All" },
			{ key: "c_strand", label: "Strand", defaultValue: "All" },
			{ key: "c_institute", label: "Institute", defaultValue: "All" },
			{ key: "c_program", label: "Program", defaultValue: "All" },
			{ key: "c_section", label: "Section", defaultValue: "" },
			{
				key: "c_libraryList",
				label: "Library",
				defaultValue: "All",
				transform: (id) =>
					libraryList.find((l) => l.id === id)?.li_name || "Unknown",
			},
			{ key: "c_resourceType", label: "Resource Type", defaultValue: "All" },
			{
				key: "c_materialFormat",
				label: "Material Format",
				defaultValue: "All",
			},
			{
				key: "c_materialList",
				label: "Material",
				defaultValue: "All",
				transform: (id) =>
					materialList.find((m) => m.id === id)?.ma_qr || "Unknown",
			},
			{
				key: "c_drList",
				label: "Room",
				defaultValue: "All",
				transform: (id) =>
					discussionRoomList.find((d) => d.id === id)?.dr_qr || "Unknown",
			},
			{
				key: "c_computerList",
				label: "Computer",
				defaultValue: "All",
				transform: (id) =>
					computerList.find((c) => c.id === id)?.co_qr || "Unknown",
			},
			{ key: "c_dateRangeStart", label: "Start Date", defaultValue: "" },
			{ key: "c_dateRangeEnd", label: "End Date", defaultValue: "" },
			{ key: "c_orderBy", label: "Order By", defaultValue: "Descending" },
		],
		D: [
			{ key: "d_role", label: "Role", defaultValue: "" },
			{ key: "d_userType", label: "User Type", defaultValue: "All" },
			{ key: "d_status", label: "Status", defaultValue: "Active" },
			{ key: "d_courses", label: "Course", defaultValue: "All" },
			{ key: "d_year", label: "Year", defaultValue: "All" },
			{ key: "d_tracks", label: "Track", defaultValue: "All" },
			{ key: "d_strand", label: "Strand", defaultValue: "All" },
			{ key: "d_institute", label: "Institute", defaultValue: "All" },
			{ key: "d_program", label: "Program", defaultValue: "All" },
			{ key: "d_section", label: "Section", defaultValue: "" },
			{
				key: "d_libraryList",
				label: "Library",
				defaultValue: "All",
				transform: (id) =>
					libraryList.find((l) => l.id === id)?.li_name || "Unknown",
			},
			{ key: "d_dateRangeStart", label: "Start Date", defaultValue: "" },
			{ key: "d_dateRangeEnd", label: "End Date", defaultValue: "" },
			{ key: "d_orderBy", label: "Order By", defaultValue: "Descending" },
		],
	};

	const fields = sectionMap[activeSection] || [];

	fields.forEach(({ key, label, defaultValue, transform }) => {
		const value = formattedFilters[key];
		if (value !== defaultValue) {
			activeFilters.push({
				key,
				label,
				value: transform ? transform(value) : value,
			});
		}
	});

	return activeFilters;
};

export const renderFiltersUS = (
	setFilters,
	filters,
	sections,
	activeSection,
	libraryList,
	materialList,
	discussionRoomList,
	computerList,
	filterCoursesData,
	subCoursesData,
	selectedCourseID,
	setSelectedCourseID
) => {
	const section = sections.find((s) => s.id === activeSection);

	switch (section.id) {
		case "A": // Total Number of Users per Type
			return (
				<div className="space-y-4">
					<TypeSelect
						value={filters.a_type}
						onChange={(e) => setFilters({ ...filters, a_type: e.target.value })}
					/>

					<StatusSelect
						label="an Account Status"
						value={filters.a_status}
						onChange={(e) =>
							setFilters({ ...filters, a_status: e.target.value })
						}
					/>
					<DateInput
						label="Date Range - Start"
						value={filters.a_dateRangeStart}
						onChange={(e) =>
							setFilters({ ...filters, a_dateRangeStart: e.target.value })
						}
					/>
					<DateInput
						label="Date Range - End"
						value={filters.a_dateRangeEnd}
						onChange={(e) =>
							setFilters({ ...filters, a_dateRangeEnd: e.target.value })
						}
					/>
				</div>
			);

		case "B":
			return (
				<div className="space-y-4">
					<RoleSelect
						value={filters.b_role}
						onChange={(e) => setFilters({ ...filters, b_role: e.target.value })}
					/>

					<UserTypeSelect
						value={filters.b_userType}
						onChange={(e) =>
							setFilters({ ...filters, b_userType: e.target.value })
						}
						role={filters.b_role}
					/>

					<StatusSelect
						label="an Account Status"
						value={filters.b_status}
						onChange={(e) =>
							setFilters({ ...filters, b_status: e.target.value })
						}
					/>

					{filters.b_role === "Patron" && (
						<>
							<FilterCoursesSelect
								value={filters.b_courses}
								onChange={(e) =>
									setFilters({ ...filters, b_courses: e.target.value })
								}
								setFilters={setFilters}
								prefix="b_"
							/>

							<FilterYearSelect
								value={filters.b_year}
								onChange={(e) =>
									setFilters({ ...filters, b_year: e.target.value })
								}
								selectedCourses={filters.b_courses}
							/>

							{filters.b_courses !== "All" && (
								<FilterCourseSelects
									selectedCourse={filters.b_courses}
									filters={filters}
									setFilters={setFilters}
									mainList={filterCoursesData}
									subList={subCoursesData}
									prefix="b_"
									selectedCourseID={selectedCourseID}
									setSelectedCourseID={setSelectedCourseID}
								/>
							)}

							<FilterSectionInput
								value={filters.b_section}
								onChange={(e) =>
									setFilters({ ...filters, b_section: e.target.value })
								}
							/>
						</>
					)}
					<DateInput
						label="Date Range - Start"
						value={filters.b_dateRangeStart}
						onChange={(e) =>
							setFilters({ ...filters, b_dateRangeStart: e.target.value })
						}
					/>
					<DateInput
						label="Date Range - End"
						value={filters.b_dateRangeEnd}
						onChange={(e) =>
							setFilters({ ...filters, b_dateRangeEnd: e.target.value })
						}
					/>
				</div>
			);

		case "C": // Most Active Users
			return (
				<div className="space-y-4">
					<RoleSelect
						value={filters.c_role}
						onChange={(e) => setFilters({ ...filters, c_role: e.target.value })}
					/>

					<UserTypeSelect
						value={filters.c_userType}
						onChange={(e) =>
							setFilters({ ...filters, c_userType: e.target.value })
						}
						role={filters.c_role}
					/>

					<StatusSelect
						label="an Account Status"
						value={filters.c_status}
						onChange={(e) =>
							setFilters({ ...filters, c_status: e.target.value })
						}
					/>
					{filters.c_role === "Patron" && (
						<>
							<FilterCoursesSelect
								value={filters.c_courses}
								onChange={(e) =>
									setFilters({ ...filters, c_courses: e.target.value })
								}
								setFilters={setFilters}
								prefix="c_"
							/>

							<FilterYearSelect
								value={filters.c_year}
								onChange={(e) =>
									setFilters({ ...filters, c_year: e.target.value })
								}
								selectedCourses={filters.c_courses}
							/>

							{filters.c_courses !== "All" && (
								<FilterCourseSelects
									selectedCourse={filters.c_courses}
									filters={filters}
									setFilters={setFilters}
									mainList={filterCoursesData}
									subList={subCoursesData}
									prefix="c_"
									selectedCourseID={selectedCourseID}
									setSelectedCourseID={setSelectedCourseID}
								/>
							)}

							<FilterSectionInput
								value={filters.c_section}
								onChange={(e) =>
									setFilters({ ...filters, c_section: e.target.value })
								}
							/>
						</>
					)}

					<FilterLibrarySelect
						value={filters.c_libraryList}
						onChange={(e) =>
							setFilters({ ...filters, c_libraryList: e.target.value })
						}
						libraryList={libraryList}
					/>

					<div className="space-y-2">
						<label className="block font-medium text-foreground text-[12px]">
							Resource Type
						</label>
						<select
							value={filters.c_resourceType}
							onChange={(e) =>
								setFilters({ ...filters, c_resourceType: e.target.value })
							}
							className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-[12px]"
						>
							<option value="All">All</option>
							<option value="Material">Material</option>
							<option value="Discussion Room">Discussion Room</option>
							<option value="Computer">Computer</option>
						</select>
					</div>

					{filters.c_resourceType === "Material" && (
						<>
							<FilterFormatSelect
								value={filters.c_materialFormat}
								onChange={(e) =>
									setFilters({
										...filters,
										c_materialFormat: e.target.value,
									})
								}
							/>

							<FilterMaterialSelect
								value={filters.c_materialList}
								onChange={(e) =>
									setFilters({ ...filters, c_materialList: e.target.value })
								}
								materialList={materialList}
							/>
						</>
					)}

					{filters.c_resourceType === "Discussion Room" && (
						<FilterDRSelect
							value={filters.c_drList}
							onChange={(e) =>
								setFilters({ ...filters, c_drList: e.target.value })
							}
							discussionRoomList={discussionRoomList}
						/>
					)}

					{filters.c_resourceType === "Computer" && (
						<FilterComputerSelect
							value={filters.c_computerList}
							onChange={(e) =>
								setFilters({ ...filters, c_computerList: e.target.value })
							}
							computerList={computerList}
						/>
					)}

					<DateInput
						label="Date Range - Start"
						value={filters.c_dateRangeStart}
						onChange={(e) =>
							setFilters({ ...filters, c_dateRangeStart: e.target.value })
						}
					/>
					<DateInput
						label="Date Range - End"
						value={filters.c_dateRangeEnd}
						onChange={(e) =>
							setFilters({ ...filters, c_dateRangeEnd: e.target.value })
						}
					/>
				</div>
			);

		case "D": // Users with Most Reports Associated
			return (
				<div className="space-y-4">
					<RoleSelect
						value={filters.d_role}
						onChange={(e) => setFilters({ ...filters, d_role: e.target.value })}
					/>

					<UserTypeSelect
						value={filters.d_userType}
						onChange={(e) =>
							setFilters({ ...filters, d_userType: e.target.value })
						}
						role={filters.d_role}
					/>

					<StatusSelect
						label="an Account Status"
						value={filters.d_status}
						onChange={(e) =>
							setFilters({ ...filters, d_status: e.target.value })
						}
					/>
					{filters.d_role === "Patron" && (
						<>
							<FilterCoursesSelect
								value={filters.d_courses}
								onChange={(e) =>
									setFilters({ ...filters, d_courses: e.target.value })
								}
								setFilters={setFilters}
								prefix="d_"
							/>

							<FilterYearSelect
								value={filters.d_year}
								onChange={(e) =>
									setFilters({ ...filters, d_year: e.target.value })
								}
								selectedCourses={filters.d_courses}
							/>

							{filters.d_courses !== "All" && (
								<FilterCourseSelects
									selectedCourse={filters.d_courses}
									filters={filters}
									setFilters={setFilters}
									mainList={filterCoursesData}
									subList={subCoursesData}
									prefix="d_"
									selectedCourseID={selectedCourseID}
									setSelectedCourseID={setSelectedCourseID}
								/>
							)}

							<FilterSectionInput
								value={filters.d_section}
								onChange={(e) =>
									setFilters({ ...filters, d_section: e.target.value })
								}
							/>
						</>
					)}
					<FilterLibrarySelect
						value={filters.d_dateRangeEnd_libraryList}
						onChange={(e) =>
							setFilters({ ...filters, d_libraryList: e.target.value })
						}
						libraryList={libraryList}
					/>

					<DateInput
						label="Date Range - Start"
						value={filters.d_dateRangeStart}
						onChange={(e) =>
							setFilters({ ...filters, d_dateRangeStart: e.target.value })
						}
					/>
					<DateInput
						label="Date Range - End"
						value={filters.c_dateRangeEnd}
						onChange={(e) =>
							setFilters({ ...filters, d_dateRangeEnd: e.target.value })
						}
					/>
				</div>
			);

		default:
			return null;
	}
};

//Enter & Exit
export const getActiveFiltersEE = (
	filters,
	sections,
	activeSection,
	libraryList
) => {
	const section = sections.find((s) => s.id === activeSection);
	if (!section) return [];

	const formattedFilters = formatDateRangeFields(filters, [
		"a_dateRangeStart",
		"a_dateRangeEnd",
		"b_dateRangeStart",
		"b_dateRangeEnd",
	]);

	const sectionMap = {
		A: [
			{ key: "a_status", label: "Currently", defaultValue: "All" },
			{ key: "a_type", label: "Type", defaultValue: "All" },
			{
				key: "a_libraryList",
				label: "Library",
				defaultValue: "All",
				transform: (id) =>
					libraryList.find((l) => l.id === id)?.li_name || "Unknown",
			},
			{ key: "a_dateRangeStart", label: "Start Date", defaultValue: "" },
			{ key: "a_dateRangeEnd", label: "End Date", defaultValue: "" },
			{ key: "a_orderBy", label: "Order By", defaultValue: "Descending" },
		],
		B: [
			{ key: "b_status", label: "Currently", defaultValue: "All" },
			{ key: "b_role", label: "Role", defaultValue: "" },
			{ key: "b_userType", label: "User Type", defaultValue: "All" },

			{ key: "b_courses", label: "Course", defaultValue: "All" },
			{ key: "b_year", label: "Year", defaultValue: "All" },
			{ key: "b_tracks", label: "Track", defaultValue: "All" },
			{ key: "b_strand", label: "Strand", defaultValue: "All" },
			{ key: "b_institute", label: "Institute", defaultValue: "All" },
			{ key: "b_program", label: "Program", defaultValue: "All" },
			{ key: "b_section", label: "Section", defaultValue: "" },
			{
				key: "b_libraryList",
				label: "Library",
				defaultValue: "All",
				transform: (id) =>
					libraryList.find((l) => l.id === id)?.li_name || "Unknown",
			},
			{ key: "b_dateRangeStart", label: "Start Date", defaultValue: "" },
			{ key: "b_dateRangeEnd", label: "End Date", defaultValue: "" },
			{ key: "b_orderBy", label: "Order By", defaultValue: "Descending" },
		],
	};

	return (sectionMap[section.id] || []).reduce(
		(acc, { key, label, defaultValue = "", check, transform }) => {
			const value = formattedFilters[key];
			if (check ? check() : value !== defaultValue) {
				acc.push({ key, label, value: transform ? transform(value) : value });
			}
			return acc;
		},
		[]
	);
};

export const renderFiltersEE = (
	setFilters,
	filters,
	sections,
	activeSection,
	libraryList,
	filterCoursesData,
	subCoursesData,
	selectedCourseID,
	setSelectedCourseID
) => {
	const section = sections.find((s) => s.id === activeSection);
	if (!section) return null;

	switch (section.id) {
		case "A":
			return (
				<div className="space-y-4">
					<StatusSelect
						label="a Status"
						value={filters.a_status}
						onChange={(e) =>
							setFilters({ ...filters, a_status: e.target.value })
						}
						all={true}
					/>
					<TypeSelect
						value={filters.a_type}
						onChange={(e) => setFilters({ ...filters, a_type: e.target.value })}
					/>
					<FilterLibrarySelect
						value={filters.a_dateRangeEnd_libraryList}
						onChange={(e) =>
							setFilters({ ...filters, a_libraryList: e.target.value })
						}
						libraryList={libraryList}
					/>
					<DateInput
						label="Date Range - Start"
						value={filters.a_dateRangeStart}
						onChange={(e) =>
							setFilters({ ...filters, a_dateRangeStart: e.target.value })
						}
					/>
					<DateInput
						label="Date Range - End"
						value={filters.a_dateRangeEnd}
						onChange={(e) =>
							setFilters({ ...filters, a_dateRangeEnd: e.target.value })
						}
					/>
				</div>
			);

		case "B":
			return (
				<div className="space-y-4">
					<StatusSelect
						label="an Account Status"
						value={filters.b_status}
						onChange={(e) =>
							setFilters({ ...filters, b_status: e.target.value })
						}
						all={true}
					/>

					<RoleSelect
						value={filters.b_role}
						onChange={(e) => setFilters({ ...filters, b_role: e.target.value })}
					/>
					{filters.b_role === "Patron" && (
						<>
							<UserTypeSelect
								value={filters.b_userType}
								onChange={(e) =>
									setFilters({ ...filters, b_userType: e.target.value })
								}
								role={filters.b_role}
							/>

							<FilterCoursesSelect
								value={filters.b_courses}
								onChange={(e) => {
									setFilters({ ...filters, b_courses: e.target.value });
								}}
								setFilters={setFilters}
								prefix="b_"
							/>

							<FilterYearSelect
								value={filters.b_year}
								onChange={(e) =>
									setFilters({ ...filters, b_year: e.target.value })
								}
								selectedCourses={filters.b_courses}
							/>

							{filters.b_courses !== "All" && (
								<FilterCourseSelects
									selectedCourse={filters.b_courses}
									filters={filters}
									setFilters={setFilters}
									mainList={filterCoursesData}
									subList={subCoursesData}
									prefix="b_"
									selectedCourseID={selectedCourseID}
									setSelectedCourseID={setSelectedCourseID}
								/>
							)}
							<FilterSectionInput
								value={filters.b_section}
								onChange={(e) =>
									setFilters({ ...filters, b_section: e.target.value })
								}
							/>
						</>
					)}

					<FilterLibrarySelect
						value={filters.b_dateRangeEnd_libraryList}
						onChange={(e) =>
							setFilters({ ...filters, b_libraryList: e.target.value })
						}
						libraryList={libraryList}
					/>

					<DateInput
						label="Date Range - Start"
						value={filters.b_dateRangeStart}
						onChange={(e) =>
							setFilters({ ...filters, b_dateRangeStart: e.target.value })
						}
					/>

					<DateInput
						label="Date Range - End"
						value={filters.b_dateRangeEnd}
						onChange={(e) =>
							setFilters({ ...filters, b_dateRangeEnd: e.target.value })
						}
					/>
				</div>
			);

		default:
			return null;
	}
};
