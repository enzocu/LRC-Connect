export async function fetchLOC(
	setCongressData,
	searchQuery,
	selectedLanguage,
	selectedSubject,
	selectedCollection,
	currentPage,
	setCtrPage,
	setLoading,
	Alert
) {
	try {
		setLoading(true);

		const params = new URLSearchParams({
			q: searchQuery || "",
			sp: currentPage || 1,
		});

		if (selectedLanguage && selectedLanguage !== "All") {
			params.append("language", selectedLanguage);
		}
		if (selectedSubject && selectedSubject !== "All") {
			params.append("subject", selectedSubject);
		}
		if (selectedCollection && selectedCollection !== "All") {
			params.append("collection", selectedCollection);
		}

		const res = await fetch(`/api/loc?${params.toString()}`);
		const data = await res.json();

		if (data.pagination?.total && data.pagination?.perpage) {
			const totalPages = Math.ceil(
				data.pagination.total / data.pagination.perpage
			);
			setCtrPage(totalPages);
		} else {
			setCtrPage(1);
		}

		if (!Array.isArray(data.results)) {
			Alert.showDanger("No valid results returned from LOC.");
			setCongressData([]);
			return;
		}

		const congressItems = data.results.map((item) => ({
			co_photoURL:
				item.image_url?.[0] ||
				"https://via.placeholder.com/300x200.png?text=No+Image",

			co_title: item.title || "No title",

			co_author: Array.isArray(item.creator)
				? item.creator.join(", ")
				: item.creator ||
				  (Array.isArray(item.contributor)
						? item.contributor.join(", ")
						: item.contributor || "Unknown author"),

			co_description: item.description?.[0] || "No description available.",
			co_date: item.date || "Unknown date",

			co_subject: Array.isArray(item.subject)
				? item.subject.join(", ")
				: item.subject || "No subject",

			co_format: Array.isArray(item.original_format)
				? item.original_format.join(", ")
				: item.original_format || "Unknown format",

			co_language: Array.isArray(item.language)
				? item.language.join(", ")
				: item.language || "Unknown",

			co_location: Array.isArray(item.location)
				? item.location.join(", ")
				: item.location || "Unknown location",

			co_id: item.id,
		}));

		setCongressData(congressItems);
	} catch (error) {
		Alert.showDanger("Failed to fetch LOC results: " + error.message);
		console.error("LOC Fetch Error:", error);
	} finally {
		setLoading(false);
	}
}
