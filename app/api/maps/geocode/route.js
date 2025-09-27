import { NextResponse } from "next/server";

export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		const lat = searchParams.get("lat");
		const lng = searchParams.get("lng");

		if (!lat || !lng) {
			return NextResponse.json(
				{ error: "Latitude and longitude required" },
				{ status: 400 }
			);
		}

		const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.MAP_KEY}`;
		console.log("Google API URL:", url);
		const response = await fetch(url);
		const data = await response.json();

		return NextResponse.json(data);
	} catch (error) {
		console.error("Google Maps API error:", error.message);
		return NextResponse.json(
			{ error: "Failed to fetch map data." },
			{ status: 500 }
		);
	}
}
