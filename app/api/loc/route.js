import { NextResponse } from "next/server";

const collectionMap = {
	Books: ["Books", "Printed Texts"],
	Audio: ["Sound recordings", "Audio"],
	Video: ["Moving image", "Videos"],
	Photographs: ["Photographs"],
	Maps: ["Maps"],
	Manuscripts: ["Manuscripts"],
	Newspapers: ["Newspapers"],
	Posters: ["Posters"],
	"Web Archives": ["Web Archive", "Web page"],
};

export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);

		const q = searchParams.get("q") || "Education";
		const sp = searchParams.get("sp") || "1";
		const language = searchParams.get("language");
		const subject = searchParams.get("subject");
		const collection = searchParams.get("collection");

		const params = new URLSearchParams({ q, sp, fo: "json" });

		if (language) params.append("fa", `language:${language}`);
		if (subject) params.append("fa", `subject:${subject}`);

		if (collection && collection !== "All" && collectionMap[collection]) {
			collectionMap[collection].forEach((format) =>
				params.append("original_format", format)
			);
		}

		const url = `https://www.loc.gov/search/?${params.toString()}`;
		const response = await fetch(url);
		const data = await response.json();

		return NextResponse.json(data);
	} catch (error) {
		console.error("LOC API error:", error.message);
		return NextResponse.json(
			{ error: "Failed to fetch LOC data." },
			{ status: 500 }
		);
	}
}
