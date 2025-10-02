export const handleCourseSelection = (
	selectedCourses,
	selectedTrack,
	selectedInstitute,
	setTracksData,
	setStrandData,
	setInstituteData,
	setProgramData
) => {
	const Courses = [
		{
			main: "Senior High School",
			sub: [
				{
					tracks: "Academic tracks",
					strand: [
						"Accountancy, Business and Management (ABM)",
						"General Academic Strand (GAS)",
						"Humanities and Social Sciences (HUMSS)",
						"Science, Technology, Engineering, and Mathematics (STEM)",
					],
				},
				{
					tracks: "Technical vocational livelihood track",
					strand: [
						"Home Economics",
						"Industrial Arts",
						"Information and Communication Technology (Computer Hardware Servicing NC II)",
						"Computer Programming (NC IV)",
					],
				},
			],
		},
		{
			main: "College Courses",
			sub: [
				{
					institute: "Institute of education (IE)",
					programs: [
						"Bachelor of Elementary Education (BEEd)",
						"Bachelor of Secondary Education (BSED)",
					],
				},
				{
					institute: "Institute of hospitality and tourism management (IHTM)",
					programs: [
						"Bachelor of Science in Hospitality Management (BSHM)",
						"Bachelor of Science in Tourism Management (BSTM)",
					],
				},
				{
					institute: "Institute of business and accountancy",
					programs: [
						"Bachelor of Science in Accountancy (BSA)",
						"Bachelor of Science in Accounting Technology (BSAcT)",
						"Bachelor of Science in Accounting Information Systems (BSAIS)",
						"Bachelor of Science in Management Accounting",
						"Bachelor of Science in Internal Auditing",
						"Bachelor of Science in Financial Management",
						"Bachelor of Science in Marketing Management",
						"Bachelor of Science in Human Resources Management",
					],
				},
				{
					institute: "Institute of information technology & innovations",
					programs: [
						"Bachelor of Science in Information Technology (BSIT)",
						"Bachelor of Science in Computer Science (BSCS)",
						"Associate in Computer Technology",
					],
				},
				{
					institute: "Institute of art & sciences",
					programs: [
						"Bachelor of Science in Mathematics",
						"Bachelor of Arts in History",
					],
				},
				{
					institute: "Community college",
					programs: [
						"Food and Beverages Services NCII",
						"Bookkeeping NCII",
						"Events Management Services NCII",
						"Front Office Services NCII",
					],
				},
			],
		},
	];

	const selected = Courses.find((c) => c.main === selectedCourses);
	if (!selected) return;

	if (selectedCourses === "Senior High School") {
		if (setTracksData) {
			setTracksData(selected.sub.map((track) => track.tracks));
		}

		if (selectedTrack) {
			const trackObj = selected.sub.find((t) => t.tracks === selectedTrack);
			if (trackObj && setStrandData) {
				setStrandData(trackObj.strand);
			}
		}
	} else if (selectedCourses === "College Courses") {
		if (setInstituteData) {
			setInstituteData(selected.sub.map((inst) => inst.institute));
		}

		if (selectedInstitute) {
			const instObj = selected.sub.find(
				(i) => i.institute === selectedInstitute
			);
			if (instObj && setProgramData) {
				setProgramData(instObj.programs);
			}
		}
	}
};
