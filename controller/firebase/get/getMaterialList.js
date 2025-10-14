import {
	collection,
	query,
	orderBy,
	limit,
	startAfter,
	getDocs,
	where,
	doc,
	getDoc,
	getCountFromServer,
} from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import {
	formatDate,
	convertYearToTimestamp,
	formatYear,
} from "../../custom/customFunction";

export async function getMaterialList(
	li_id,
	format,
	mt_id,
	ca_id,
	sh_id,
	br_id,
	status,
	dateRangeStart,
	dateRangeEnd,
	searchQuery,
	showAdvancedSearch,
	advancedSearch,
	matchType,
	setMaterialData,
	setLoading,
	Alert,
	setCtrPage,
	pageLimit,
	pageCursors,
	setPageCursors,
	currentPage,
	mock = false
) {
	setLoading(true);

	try {
		const materialRef = collection(db, "material");
		const conditions = [where("ma_status", "==", status)];

		if (li_id) {
			conditions.push(where("ma_liID", "==", li_id));
		} else {
			const librarySnap = await getDocs(
				query(collection(db, "library"), where("li_status", "==", "Active"))
			);
			if (librarySnap.docs.length > 0) {
				const refs = librarySnap.docs.map((d) => d.ref);
				conditions.push(where("ma_liID", "in", refs));
			}
		}

		// Filters
		if (format && format !== "All") {
			if (format === "Hard Copy") {
				conditions.push(where("ma_coverQty", ">", 0));
			} else if (format === "Soft Copy") {
				conditions.push(where("ma_softQty", ">", 0));
			} else if (format === "Audio Copy") {
				conditions.push(where("ma_audioQty", ">", 0));
			}
		}
		if (mt_id && mt_id !== "All")
			conditions.push(where("ma_mtID", "==", doc(db, "materialType", mt_id)));
		if (ca_id && ca_id !== "All")
			conditions.push(where("ma_caID", "==", doc(db, "category", ca_id)));
		if (sh_id && sh_id !== "All")
			conditions.push(where("ma_shID", "==", doc(db, "shelves", sh_id)));
		if (br_id && br_id !== "All")
			conditions.push(where("ma_liID", "==", doc(db, "library", br_id)));

		if (dateRangeStart !== "" && dateRangeStart.length === 4) {
			conditions.push(
				where("ma_copyright", ">=", convertYearToTimestamp(dateRangeStart))
			);
		}

		if (dateRangeEnd !== "" && dateRangeEnd.length === 4) {
			conditions.push(
				where("ma_copyright", "<=", convertYearToTimestamp(dateRangeEnd))
			);
		}

		// Handle search query
		let isQRSearch = searchQuery?.startsWith("MTL-");
		const isSearchEmpty = !searchQuery || searchQuery.trim() === "";

		if (isQRSearch) {
			conditions.push(where("ma_qr", "==", searchQuery));
		} else {
			conditions.push(orderBy("ma_copyright", "desc"));
		}

		const hasAdvancedFilters =
			showAdvancedSearch &&
			advancedSearch &&
			Object.values(advancedSearch).some((v) => v && v.trim() !== "") &&
			matchType !== "none";

		const hasSearchFilters = isQRSearch || isSearchEmpty;

		// Pagination
		let finalQuery;

		if (hasSearchFilters) {
			finalQuery =
				currentPage > 1 && pageCursors[currentPage - 2]
					? query(
							materialRef,
							...conditions,
							startAfter(pageCursors[currentPage - 2]),
							limit(pageLimit)
					  )
					: query(materialRef, ...conditions, limit(pageLimit));
		} else {
			finalQuery = query(materialRef, ...conditions);
		}

		const snapshot = await getDocs(finalQuery);

		// Save cursor
		const lastVisible = snapshot.docs[snapshot.docs.length - 1];
		if (hasSearchFilters && lastVisible) {
			const newCursors = [...pageCursors];
			newCursors[currentPage - 1] = lastVisible;
			setPageCursors(newCursors);
		}

		// Map material data
		const data = await Promise.all(
			snapshot.docs.map(async (docSnap) => {
				const d = docSnap.data();

				try {
					const [mtSnap, caSnap, shSnap, liSnap] = await Promise.all([
						getDoc(d.ma_mtID),
						getDoc(d.ma_caID),
						getDoc(d.ma_shID),
						getDoc(d.ma_liID),
					]);

					if (
						!mtSnap.exists() ||
						!caSnap.exists() ||
						!shSnap.exists() ||
						!liSnap.exists()
					)
						return null;

					const mtData = mtSnap.data();
					const caData = caSnap.data();
					const shData = shSnap.data();
					const liData = liSnap.data();

					const formatTypes = [];
					if (d.ma_coverQty > 0) formatTypes.push("Hard Copy");
					if (d.ma_softQty > 0) formatTypes.push("Soft Copy");
					if (d.ma_audioQty > 0) formatTypes.push("Audio Copy");

					if (
						!hasAdvancedFilters &&
						!isSearchEmpty &&
						!isQRSearch &&
						!d.ma_title.toLowerCase().includes(searchQuery.toLowerCase())
					) {
						return null;
					}

					//advanced search (client side)
					if (hasAdvancedFilters) {
						const checks = [];

						if (advancedSearch.title) {
							checks.push(
								d.ma_title
									?.toLowerCase()
									.includes(advancedSearch.title.toLowerCase())
							);
						}
						if (advancedSearch.author) {
							checks.push(
								d.ma_author
									?.toLowerCase()
									.includes(advancedSearch.author.toLowerCase())
							);
						}
						if (advancedSearch.subject && Array.isArray(d.ma_subjects)) {
							checks.push(
								d.ma_subjects.some((subj) =>
									subj
										.toLowerCase()
										.includes(advancedSearch.subject.toLowerCase())
								)
							);
						}
						if (advancedSearch.callNumber) {
							checks.push(
								d.ma_libraryCall
									?.toLowerCase()
									.includes(advancedSearch.callNumber.toLowerCase())
							);
						}
						if (advancedSearch.isbn) {
							checks.push(
								d.ma_isbn
									?.toLowerCase()
									.includes(advancedSearch.isbn.toLowerCase())
							);
						}
						if (advancedSearch.publisher) {
							checks.push(
								d.ma_publisher
									?.toLowerCase()
									.includes(advancedSearch.publisher.toLowerCase())
							);
						}

						const passed =
							matchType === "all"
								? checks.every(Boolean)
								: checks.some(Boolean);

						if (!passed) return null;
					}

					return {
						id: docSnap.id,
						ma_qr: d.ma_qr,
						ma_coverURL: d.ma_coverURL || null,
						ma_title: d.ma_title || "NA",
						ma_author: d.ma_author || "NA",
						ma_description: d.ma_description || "NA",
						ma_copies: d.ma_coverQty || 0,
						ma_copyright: formatYear(d.ma_copyright) || "NA",
						ma_libraryCall: d.ma_libraryCall || "NA",
						ma_status: d.ma_status || "NA",
						ma_library:
							(liData.li_name || "") + " - " + (liData.li_schoolname || ""),
						ma_type: mtData.mt_name || "NA",
						ma_category: caData.ca_name || "NA",
						ma_shelf: shData.sh_name || "NA",
						ma_createdAt: formatDate(d.ma_createdAt),
						ma_format: formatTypes.join(", "),
						ma_subjects: d.ma_subjects.join(", ") || "NA",
					};
				} catch (err) {
					console.warn("Reference fetching error:", err);
					return null;
				}
			})
		);

		setMaterialData(
			mock
				? (prev) => ({ ...prev, totalMaterial: data.filter(Boolean) })
				: data.filter(Boolean)
		);

		if (hasSearchFilters) {
			const countQuery = query(materialRef, ...conditions);
			const countSnap = await getCountFromServer(countQuery);
			const totalPages = Math.ceil(countSnap.data().count / pageLimit);
			setCtrPage(totalPages);
		} else {
			setCtrPage(1);
		}
	} catch (error) {
		console.error("getMaterialMainList Error:", error);
		Alert.showDanger(error.message);
	} finally {
		setLoading(false);
	}
}

export async function getMaterialFilter(
	li_id = null,
	setMaterialType,
	setCategory,
	setShelves,
	setBranch = null,
	Alert
) {
	try {
		const categoryConditions = [where("ca_status", "==", "Active")];
		if (li_id) categoryConditions.push(where("ca_liID", "==", li_id));

		const materialTypeConditions = [where("mt_status", "==", "Active")];
		if (li_id) materialTypeConditions.push(where("mt_liID", "==", li_id));

		const shelfConditions = [where("sh_status", "==", "Active")];
		if (li_id) shelfConditions.push(where("sh_liID", "==", li_id));

		// Queries
		const categoryQuery = query(
			collection(db, "category"),
			...categoryConditions
		);
		const materialTypeQuery = query(
			collection(db, "materialType"),
			...materialTypeConditions
		);
		const shelfQuery = query(collection(db, "shelves"), ...shelfConditions);

		const promises = [
			getDocs(categoryQuery), // 0
			getDocs(materialTypeQuery), // 1
			getDocs(shelfQuery), // 2
		];

		if (!li_id) {
			const branchQuery = query(
				collection(db, "library"),
				where("li_status", "==", "Active")
			);
			promises.push(getDocs(branchQuery)); // 3
		}

		const [categorySnap, materialTypeSnap, shelfSnap, branchSnap] =
			await Promise.all(promises);

		const categories = categorySnap.docs.map((d) => ({
			id: d.id,
			ca_name: d.data().ca_name,
		}));
		setCategory(categories);

		const materialTypes = materialTypeSnap.docs.map((d) => ({
			id: d.id,
			mt_name: d.data().mt_name,
		}));
		setMaterialType(materialTypes);

		const shelves = shelfSnap.docs.map((d) => ({
			id: d.id,
			sh_name: d.data().sh_name,
			sh_qr: d.data().sh_qr,
		}));
		setShelves(shelves);

		if (!li_id && branchSnap) {
			const branches = branchSnap.docs.map((d) => ({
				id: d.id,
				li_name: d.data().li_name,
			}));
			setBranch(branches);
		}
	} catch (error) {
		Alert.showDanger(error.message);
	}
}
