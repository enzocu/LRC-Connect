import express from "express";
import next from "next";
import fetch from "node-fetch";
import axios from "axios";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

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

app.prepare().then(() => {
	const server = express();

	server.use(express.json());

	server.get("/api/loc", async (req, res) => {
		try {
			const { q, sp, language, subject, collection } = req.query;

			const params = new URLSearchParams({
				q: q || "Education",
				sp: sp || "1",
				fo: "json",
			});

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
			res.json(data);
		} catch (error) {
			console.error("LOC API error:", error.message);
			res.status(500).json({ error: "Failed to fetch LOC data." });
		}
	});

	server.post("/api/gemini", async (req, res) => {
		try {
			const response = await axios.post(
				`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.API_KEY}`,
				req.body
			);

			res.json(response.data);
		} catch (err) {
			console.error("Error response data:", err.response?.data || err.message);
			res.status(500).json({ error: err.response?.data || err.message });
		}
	});

	server.get("/api/maps/geocode", async (req, res) => {
		try {
			const { lat, lng } = req.query;
			if (!lat || !lng) {
				return res
					.status(400)
					.json({ error: "Latitude and longitude required" });
			}

			const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.MAP_KEY}`;
			const response = await fetch(url);
			const data = await response.json();

			res.json(data);
		} catch (error) {
			console.error("Google Maps API error:", error.message);
			res.status(500).json({ error: "Failed to fetch map data." });
		}
	});

	server.all("*", (req, res) => handle(req, res));

	server.listen(3000, (err) => {
		if (err) throw err;
		console.log("> Ready on http://localhost:3000");
	});
});
