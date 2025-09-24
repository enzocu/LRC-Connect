import * as XLSX from "xlsx";

export const processExcelFile = async (
	file,
	excelHeader,
	setUserData,
	setSelectedAccounts,
	setStep,
	setBtnloading,
	Alert
) => {
	if (!file) return;
	setBtnloading(true);

	const maxSizeMB = 10;
	const maxSizeBytes = maxSizeMB * 1024 * 1024;
	if (file.size > maxSizeBytes) {
		Alert?.showDanger(`File size exceeds ${maxSizeMB}MB limit.`);
		setBtnloading(false);
		return;
	}

	const reader = new FileReader();

	reader.onload = (e) => {
		try {
			const data = e.target.result;
			const workbook = XLSX.read(data, { type: "binary" });
			const sheetName = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[sheetName];
			const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

			// Find header row
			let headerIndex = sheetData.findIndex(
				(row) => row && excelHeader.every((key) => row.includes(key))
			);

			if (headerIndex === -1) headerIndex = 0;

			const headerRow = sheetData[headerIndex];
			const colIndexMap = {};

			// Map headers to their column index
			excelHeader.forEach((header) => {
				const idx = headerRow.indexOf(header);
				if (idx !== -1) {
					colIndexMap[header] = idx;
				}
			});

			const extractedUsers = [];
			const allowedTypes = [
				"Student",
				"Faculty",
				"Student Assistant",
				"Administrator",
			];
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

			// Loop through rows after header
			for (let i = headerIndex + 1; i < sheetData.length; i++) {
				const row = sheetData[i];
				if (!row || row.length === 0) continue;

				const userType = row[colIndexMap["Type"]] ?? "";
				const email = row[colIndexMap["Email"]] ?? "";

				if (!allowedTypes.includes(userType) || !emailRegex.test(email)) {
					continue;
				}

				const userRow = {
					us_schoolID: row[colIndexMap["School ID"]] ?? null,
					us_status: row[colIndexMap["Status"]] ?? "Inactive",
					us_type: userType,
					us_fname: row[colIndexMap["First Name"]] ?? null,
					us_mname: row[colIndexMap["Middle Name"]] ?? null,
					us_lname: row[colIndexMap["Last Name"]] ?? null,
					us_suffix: row[colIndexMap["Suffix"]] ?? null,
					us_sex: row[colIndexMap["Sex"]] ?? null,
					us_birthday: row[colIndexMap["Birthday"]] ?? null,
					us_email: email,
					us_phoneNumber: row[colIndexMap["Phone Number"]] ?? null,
					us_street: row[colIndexMap["Street"]] ?? ".",
					us_barangay: row[colIndexMap["Barangay"]] ?? null,
					us_municipal: row[colIndexMap["Municipal"]] ?? ".",
					us_province: row[colIndexMap["Province"]] ?? null,
					us_section: row[colIndexMap["Section"]] ?? null,
					us_year: row[colIndexMap["Year"]] ?? null,
					us_program: row[colIndexMap["Program"]] ?? null,
					us_school: row[colIndexMap["School"]] ?? null,
				};

				extractedUsers.push(userRow);
			}

			setUserData(extractedUsers);
			setSelectedAccounts(extractedUsers);
			setStep("preview");
		} catch (error) {
			console.error("Error processing Excel file:", error);
			Alert?.showDanger(error.message);
		} finally {
			setBtnloading(false);
		}
	};

	reader.onerror = (e) => {
		console.error("FileReader error:", e);
		Alert?.showDanger("Failed to read the file.");
		setBtnloading(false);
	};

	reader.readAsBinaryString(file);
};

export const processExcelMaterialFile = async (
	file,
	excelHeader,
	setMaterialData,
	setSelectedMaterials,
	setStep,
	setBtnloading,
	Alert
) => {
	if (!file) return;
	setBtnloading(true);

	const maxSizeMB = 10;
	const maxSizeBytes = maxSizeMB * 1024 * 1024;
	if (file.size > maxSizeBytes) {
		Alert?.showDanger(`File size exceeds ${maxSizeMB}MB limit.`);
		setBtnloading(false);
		return;
	}

	const reader = new FileReader();

	reader.onload = (e) => {
		try {
			const data = e.target.result;
			const workbook = XLSX.read(data, { type: "binary" });
			const sheetName = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[sheetName];
			const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

			// Find header row
			let headerIndex = sheetData.findIndex(
				(row) => row && excelHeader.every((key) => row.includes(key))
			);

			if (headerIndex === -1) headerIndex = 0;

			const headerRow = sheetData[headerIndex];
			const colIndexMap = {};

			// Map headers to their column index
			excelHeader.forEach((header) => {
				const idx = headerRow.indexOf(header);
				if (idx !== -1) {
					colIndexMap[header] = idx;
				}
			});

			const extractedMaterials = [];

			// Loop through rows after header
			for (let i = headerIndex + 1; i < sheetData.length; i++) {
				if (extractedMaterials.length >= 50) break; // ✅ limit to 50

				const row = sheetData[i];
				if (!row || row.length === 0) continue;

				const materialRow = {
					mt_title: row[colIndexMap["Title"]] ?? null,
					mt_author: row[colIndexMap["Author"]] ?? null,
					mt_place: row[colIndexMap["Place of Publication"]] ?? null,
					mt_publisher: row[colIndexMap["Publisher"]] ?? null,
					mt_copyright: row[colIndexMap["Copyright"]] ?? null,
					mt_pages: row[colIndexMap["Pages"]] ?? null,
					mt_size: row[colIndexMap["Size"]] ?? null,
					mt_language: row[colIndexMap["Language"]] ?? null,
					mt_description: row[colIndexMap["Description"]] ?? null,
					mt_subject1: row[colIndexMap["Subject 1"]] ?? null,
					mt_subject2: row[colIndexMap["Subject 2"]] ?? null,
					mt_accessionNo: row[colIndexMap["Accession No."]] ?? null,
					mt_callNo: row[colIndexMap["Call No."]] ?? "",
					mt_isbn: row[colIndexMap["ISBN"]] ?? null,
					mt_copies: row[colIndexMap["Copies"]] ?? null,
					mt_remarks: row[colIndexMap["Remarks"]] ?? null,
				};

				if (!materialRow.mt_accessionNo) continue;

				extractedMaterials.push(materialRow);
			}

			setMaterialData(extractedMaterials);
			setSelectedMaterials(extractedMaterials);
			setStep("preview");

			if (sheetData.length - (headerIndex + 1) > 50) {
				Alert?.showWarning("Only the first 50 rows were imported.");
			}
		} catch (error) {
			console.error("Error processing Excel file:", error);
			Alert?.showDanger(error.message);
		} finally {
			setBtnloading(false);
		}
	};

	reader.onerror = (e) => {
		console.error("FileReader error:", e);
		Alert?.showDanger("Failed to read the file.");
		setBtnloading(false);
	};

	reader.readAsBinaryString(file);
};
