export async function fetchProvinces(setProvinceData) {
	try {
		const response = await fetch("https://psgc.gitlab.io/api/provinces/");
		const data = await response.json();
		const provinces = data
			.map((province) => ({
				name: province.name,
				code: province.code,
			}))
			.sort((a, b) => a.name.localeCompare(b.name));

		setProvinceData(provinces);
	} catch (error) {
		console.error("Error fetching provinces:", error);
	}
}

export async function fetchCitiesOrMunicipalities(
	provinceCode,
	setMunicipalData
) {
	try {
		const response = await fetch(
			`https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities/`
		);
		const data = await response.json();
		const sortedList = data
			.map((item) => ({
				code: item.code,
				name: item.name,
			}))
			.sort((a, b) => a.name.localeCompare(b.name));

		setMunicipalData(sortedList);
	} catch (error) {
		console.error("Error fetching cities/municipalities:", error);
	}
}

export async function fetchBarangays(cityMuniCode) {
	try {
		const response = await fetch(
			`https://psgc.gitlab.io/api/cities-municipalities/${cityMuniCode}/barangays/`
		);

		if (!response.ok) {
			throw new Error("Failed to fetch barangays");
		}

		const data = await response.json();

		const barangays = data
			.map((barangay) => ({
				code: barangay.code,
				name: barangay.name,
			}))
			.sort((a, b) => a.name.localeCompare(b.name));

		return barangays;
	} catch (error) {
		console.error("Error fetching barangays:", error);
		return [];
	}
}
