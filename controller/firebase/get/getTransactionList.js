import {
	collection,
	query,
	where,
	orderBy,
	limit,
	startAfter,
	getDoc,
	getCountFromServer,
	doc,
	onSnapshot,
	getDocs,
} from "firebase/firestore";
import { db } from "../../../server/firebaseConfig";
import {
	formatDate,
	formatTime,
	getDateOnly,
} from "../../custom/customFunction";

export async function getTransactionList(
	isPersonnel,
	li_id,
	setTransactionData,
	status,
	searchQuery,
	selectedLibrary,
	selectedPatronId,
	selectedResourceType,
	selectedMaterialList,
	selectedMaterialFormat,
	selectedMaterialType,
	selectedMaterialCategory,
	selectedDiscussionRoomList,
	selectedComputerList,
	showOverdueOnly,
	showLateOnly,
	setLoading,
	Alert,
	pageLimit,
	setCtrPage,
	pageCursors,
	setPageCursors,
	currentPage
) {
	setLoading(true);

	try {
		const trRef = collection(db, "transaction");

		const conditions = [where("tr_status", "==", status)];

		if (isPersonnel) {
			conditions.push(where("tr_liID", "==", li_id));
		} else if (!isPersonnel && selectedLibrary !== "All") {
			conditions.push(
				where("tr_liID", "==", doc(db, "library", selectedLibrary))
			);
		}

		if (selectedPatronId && selectedPatronId.trim() !== "All") {
			conditions.push(
				where("tr_usID", "==", doc(db, "users", selectedPatronId))
			);
		}

		if (selectedResourceType && selectedResourceType.trim() !== "All") {
			conditions.push(where("tr_type", "==", selectedResourceType));
		}

		if (selectedMaterialList && selectedMaterialList.trim() !== "All") {
			conditions.push(
				where("tr_maID", "==", doc(db, "material", selectedMaterialList))
			);
		}

		if (selectedMaterialFormat && selectedMaterialFormat.trim() !== "All") {
			conditions.push(where("tr_format", "==", selectedMaterialFormat));
		}

		if (
			selectedDiscussionRoomList &&
			selectedDiscussionRoomList.trim() !== "All"
		) {
			conditions.push(
				where(
					"tr_drID",
					"==",
					doc(db, "discussionrooms", selectedDiscussionRoomList)
				)
			);
		}

		if (selectedComputerList && selectedComputerList.trim() !== "All") {
			conditions.push(
				where("tr_coID", "==", doc(db, "computers", selectedComputerList))
			);
		}

		const isQRTRNSearch = searchQuery?.startsWith("TRN-");
		const isQRUSRSearch = searchQuery?.startsWith("USR-");
		const isSearchEmpty = !searchQuery || searchQuery.trim() === "";

		const hasSearchFilters =
			(isQRTRNSearch || isQRUSRSearch || isSearchEmpty) &&
			!showOverdueOnly &&
			!showLateOnly &&
			selectedMaterialType == "All" &&
			selectedMaterialCategory == "All";

		if (isQRTRNSearch || isQRUSRSearch) {
			if (isQRTRNSearch) {
				conditions.push(where("tr_qr", "==", searchQuery));
			} else {
				const userQuery = query(
					collection(db, "users"),
					where("us_qr", "==", searchQuery)
				);
				const userSnapshot = await getDocs(userQuery);

				if (!userSnapshot.empty) {
					const foundUserRef = userSnapshot.docs[0].ref;
					conditions.push(where("tr_usID", "==", foundUserRef));
				}
			}
		} else {
			if (status === "Reserved" || status === "Utilized") {
				conditions.push(orderBy("tr_useDate", "asc"));
			} else if (status === "Cancelled" || status === "Completed") {
				conditions.push(orderBy("tr_updatedAt", "desc"));
			}
		}

		let finalQuery;

		if (hasSearchFilters) {
			console.log("pagination");
			const hasCursor = currentPage > 1 && pageCursors[currentPage - 2];
			finalQuery = hasCursor
				? query(
						trRef,
						...conditions,
						startAfter(pageCursors[currentPage - 2]),
						limit(pageLimit)
				  )
				: query(trRef, ...conditions, limit(pageLimit));
		} else {
			console.log("no pagination");
			finalQuery = query(trRef, ...conditions);
		}

		const unsubscribe = onSnapshot(
			finalQuery,
			async (snapshot) => {
				try {
					const lastVisible = snapshot.docs[snapshot.docs.length - 1];
					if (hasSearchFilters && lastVisible) {
						const newCursors = [...pageCursors];
						newCursors[currentPage - 1] = lastVisible;
						setPageCursors(newCursors);
					}

					const transactions = await Promise.all(
						snapshot.docs.map(async (docSnap) => {
							const data = docSnap.data();
							const id = docSnap.id;

							const userSnap = await getDoc(data.tr_usID);
							const userData = userSnap.exists() ? userSnap.data() : {};

							let userLibraryId = userData?.us_liID?.id || "";
							const [librarySnap] = await Promise.all([
								isPersonnel && userData?.us_liID
									? getDoc(userData.us_liID)
									: !isPersonnel && userData?.us_liID
									? getDoc(li_id)
									: Promise.resolve(null),
							]);

							const libraryData = librarySnap?.exists()
								? librarySnap.data()
								: {};

							if (
								isPersonnel &&
								selectedLibrary &&
								selectedLibrary !== "All" &&
								userLibraryId !== selectedLibrary
							) {
								return null;
							}

							let tr_resource = {};
							let shouldSkip = false;

							// Fetch resources based on type
							if (data.tr_type === "Material") {
								const resSnap = await getDoc(data.tr_maID);
								if (resSnap.exists()) {
									const resData = resSnap.data();

									if (
										selectedMaterialCategory !== "All" &&
										resData.ma_caID?.id !== selectedMaterialCategory
									)
										shouldSkip = true;

									if (
										selectedMaterialType !== "All" &&
										resData.ma_mtID?.id !== selectedMaterialType
									)
										shouldSkip = true;

									if (!shouldSkip) {
										tr_resource = {
											id: resSnap.id,
											ma_qr: resData.ma_qr,
											ma_callNumber: resData.ma_libraryCall || resData.ma_qr,
											ma_title: resData.ma_title,
											ma_author: resData.ma_author,
											ma_coverURL: resData.ma_coverURL,
											ma_coverQty: resData.ma_coverQty || 0,
											ma_softQty: resData.ma_softQty || 0,
											ma_audioQty: resData.ma_audioQty || 0,
											ma_holdings: resData.ma_holdings || [],
										};
									}
								}
							} else if (data.tr_type === "Discussion Room") {
								const resSnap = await getDoc(data.tr_drID);
								if (resSnap.exists()) {
									const resData = resSnap.data();
									tr_resource = {
										id: resSnap.id,
										dr_name: resData.dr_name,
										dr_qr: resData.dr_qr,
										dr_photoURL: resData.dr_photoURL,
										dr_createdAt: formatDate(resData.dr_createdAt),
										dr_qty: 1,
									};
								}
							} else if (data.tr_type === "Computer") {
								const resSnap = await getDoc(data.tr_coID);
								if (resSnap.exists()) {
									const resData = resSnap.data();
									tr_resource = {
										id: resSnap.id,
										co_name: resData.co_name,
										co_qr: resData.co_qr,
										co_photoURL: resData.co_photoURL,
										co_createdAt: formatDate(resData.co_createdAt),
										co_qty: 1,
									};
								}
							}

							if (shouldSkip) return null;

							const now = new Date();

							const isOverdue =
								data.tr_status === "Utilized" &&
								((data.tr_type === "Material" &&
									data.tr_dateDue?.toDate() < getDateOnly(now)) ||
									(data.tr_type !== "Material" &&
										data.tr_sessionEnd?.toDate() < now));

							const isLateReturn =
								data.tr_status === "Completed" &&
								data.tr_actualEnd &&
								((data.tr_type === "Material" &&
									data.tr_dateDue?.toDate() <
										getDateOnly(data.tr_actualEnd.toDate())) ||
									(data.tr_type !== "Material" &&
										data.tr_sessionEnd?.toDate() < data.tr_actualEnd.toDate()));

							if (showOverdueOnly && !isOverdue) return null;
							if (showLateOnly && !isLateReturn) return null;

							return {
								id,
								tr_ref: docSnap.ref,
								tr_liID: data.tr_liID,
								tr_usID: data.tr_usID,
								tr_qr: data.tr_qr,
								tr_type: data.tr_type,
								tr_status: data.tr_status,
								tr_format: data.tr_format,
								tr_pastDueDate: data.tr_pastDueDate,
								tr_accession: data.tr_accession,
								tr_date: data.tr_useDate || null,
								tr_dateDue: data.tr_dateDue || null,
								tr_sessionStart: data.tr_sessionStart || null,
								tr_sessionEnd: data.tr_sessionEnd || null,
								tr_actualEnd: data.tr_actualEnd || null,
								tr_updatedAt: data.tr_updatedAt || null,
								tr_remarks: data.tr_remarks || "",
								tr_resource,
								...(isPersonnel
									? {
											tr_patron: {
												us_name: `${userData.us_fname || ""} ${
													userData.us_mname || ""
												} ${userData.us_lname || ""}`.trim(),
												us_schoolID: userData.us_schoolID || "",
												us_type: userData.us_type || "",
												us_email: userData.us_email || "",
												us_photoURL: userData.us_photoURL || "",
												us_library: libraryData.li_name || "",
											},
									  }
									: {
											tr_library: libraryData.li_name || "",
									  }),
								tr_createdAt: formatDate(data.tr_createdAt),
								tr_dateFormatted: formatDate(data.tr_useDate) || "",
								tr_dateDueFormatted: formatDate(data.tr_dateDue) || "",
								tr_sessionStartFormatted:
									formatTime(data.tr_sessionStart) || "",
								tr_sessionEndFormatted: formatTime(data.tr_sessionEnd) || "",
							};
						})
					);

					setTransactionData(transactions.filter((item) => item !== null));

					if (hasSearchFilters) {
						const countQuery = query(trRef, ...conditions);
						const countSnap = await getCountFromServer(countQuery);
						const totalPages = Math.ceil(countSnap.data().count / pageLimit);
						setCtrPage(totalPages);
					} else {
						setCtrPage(1);
					}
				} catch (error) {
					console.error("onSnapshot getTransactionList Error:", error);
					Alert.showDanger(error.message);
				} finally {
					setLoading(false);
				}
			},
			(error) => {
				console.error("Snapshot error:", error);
				setLoading(false);
				Alert.showDanger("Failed to load transactions in real-time.");
			}
		);

		return unsubscribe;
	} catch (error) {
		console.error("getTransactionList Error:", error);
		Alert.showDanger(error.message);
		setLoading(false);
	}
}

export async function getTransactionFilter(
	li_id,
	resourceType,
	setLibraries,
	setMaterialTypes = null,
	setMaterialCategories = null,
	setMaterialList,
	setDiscussionRoomList,
	setComputerList,
	Alert
) {
	try {
		let liRef =
			typeof li_id === "object" && li_id.id ? li_id : doc(db, "library", li_id);
		const promises = [];

		const libQuery = query(
			collection(db, "library"),
			where("li_status", "==", "Active")
		);
		const libPromise = getDocs(libQuery).then((libSnap) =>
			libSnap.docs.map((doc) => ({
				id: doc.id,
				li_name: doc.data().li_name,
			}))
		);
		promises.push(libPromise);

		let mtPromise = null,
			caPromise = null,
			maPromise = null,
			drPromise = null,
			coPromise = null;

		if (resourceType === "Material") {
			if (setMaterialTypes !== null) {
				const mtQuery = query(
					collection(db, "materialType"),
					where("mt_status", "==", "Active"),
					where("mt_liID", "==", liRef)
				);
				mtPromise = getDocs(mtQuery).then((mtSnap) =>
					mtSnap.docs.map((doc) => ({
						id: doc.id,
						mt_name: doc.data().mt_name,
					}))
				);
				promises.push(mtPromise);
			}

			if (setMaterialCategories !== null) {
				const caQuery = query(
					collection(db, "category"),
					where("ca_status", "==", "Active"),
					where("ca_liID", "==", liRef)
				);
				caPromise = getDocs(caQuery).then((caSnap) =>
					caSnap.docs.map((doc) => ({
						id: doc.id,
						ca_name: doc.data().ca_name,
					}))
				);
				promises.push(caPromise);
			}

			const maQuery = query(
				collection(db, "material"),
				where("ma_status", "==", "Active"),
				where("ma_liID", "==", liRef)
			);
			maPromise = getDocs(maQuery).then((maSnap) =>
				maSnap.docs.map((doc) => ({
					id: doc.id,
					ma_qr: doc.data().ma_qr,
				}))
			);
			promises.push(maPromise);
		} else if (resourceType === "Discussion Room") {
			const drQuery = query(
				collection(db, "discussionrooms"),
				where("dr_status", "==", "Active"),
				where("dr_liID", "==", liRef)
			);
			drPromise = getDocs(drQuery).then((drSnap) =>
				drSnap.docs.map((doc) => ({
					id: doc.id,
					dr_qr: doc.data().dr_qr,
				}))
			);
			promises.push(drPromise);
		} else if (resourceType === "Computer") {
			const coQuery = query(
				collection(db, "computers"),
				where("co_status", "==", "Active"),
				where("co_liID", "==", liRef)
			);
			coPromise = getDocs(coQuery).then((coSnap) =>
				coSnap.docs.map((doc) => ({
					id: doc.id,
					co_qr: doc.data().co_qr,
				}))
			);
			promises.push(coPromise);
		}

		const results = await Promise.all(promises);

		let resultIndex = 0;

		setLibraries(results[resultIndex++]);

		// Material resource type
		if (resourceType === "Material") {
			if (setMaterialTypes !== null) setMaterialTypes(results[resultIndex++]);
			if (setMaterialCategories !== null)
				setMaterialCategories(results[resultIndex++]);
			setMaterialList(results[resultIndex++]);
		} else if (resourceType === "Discussion Room") {
			setDiscussionRoomList(results[resultIndex++]);
		} else if (resourceType === "Computer") {
			setComputerList(results[resultIndex++]);
		}
	} catch (error) {
		console.error("Error fetching transaction filters:", error);
		Alert.showDanger(error.message || "Failed to fetch filters.");
	}
}

export async function getAvailableHoldings(
	ma_id,
	ma_holdings,
	setAvailableHoldings,
	Alert
) {
	try {
		const maRef =
			typeof ma_id === "string" ? doc(db, "material", ma_id) : ma_id;

		const utilizedQuery = query(
			collection(db, "transaction"),
			where("tr_status", "==", "Utilized"),
			where("tr_maID", "==", maRef),
			where("tr_format", "==", "Hard Copy")
		);

		const utilizedSnap = await getDocs(utilizedQuery);
		const utilizedAccessions = utilizedSnap.docs.map(
			(d) => d.data().tr_accession
		);

		const availableHoldings = (
			ma_holdings.filter((h) => h.ho_status === "Active") || []
		)
			.filter((h) => h?.ho_access && !utilizedAccessions.includes(h.ho_access))
			.map((h) => h.ho_access);

		setAvailableHoldings(availableHoldings);
	} catch (error) {
		console.error("Error fetching available holdings:", error);
		Alert.showDanger(error.message || "Failed to fetch available holdings.");
	}
}
