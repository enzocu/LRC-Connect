export async function fetchAddress(
	selectedPosition,
	setFormData,
	setBtnLoading,
	Alert
) {
	try {
		setBtnLoading(true);

		const response = await fetch(
			`/api/maps/geocode?lat=${selectedPosition.lat}&lng=${selectedPosition.lng}`
		);

		if (!response.ok) throw new Error("Failed to fetch address");

		const data = await response.json();

		const address =
			data.results && data.results.length > 0
				? data.results[0].formatted_address
				: "Unknown location";

		setFormData((prev) => ({
			...prev,
			li_latlng: `${selectedPosition.lat}, ${selectedPosition.lng}`,
			li_address: address,
		}));

		return address;
	} catch (error) {
		console.error("fetchAddress error:", error.message);
		Alert.showDanger(error.message);
		return "Unknown location";
	} finally {
		setBtnLoading(false);
	}
}
