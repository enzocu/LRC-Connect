import { getDoc } from "firebase/firestore";

export async function getLibraryByIDs(user, setLibrary, setLoading, Alert) {
	try {
		setLoading(true);
		const librariesData = [];

		if (!user || !Array.isArray(user.us_library)) {
			throw new Error("Invalid or missing 'us_library' array in user data.");
		}

		for (const lib of user.us_library) {
			if (!lib.us_liID) continue;

			const libSnap = await getDoc(lib.us_liID);
			if (!libSnap.exists()) {
				console.warn(`Library not found: ${lib.us_liID?.id}`);
				continue;
			}

			librariesData.push({
				id: libSnap.id,
				...libSnap.data(),
				us_level: lib.us_level,
				us_type: lib.us_type,
			});
		}

		setLibrary(librariesData);
	} catch (error) {
		console.error("❌ getLibraryByIDs error:", error);
		Alert.showDanger("Error: " + error.message);
	} finally {
		setLoading(false);
	}
}
