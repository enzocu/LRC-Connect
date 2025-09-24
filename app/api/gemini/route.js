import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
	try {
		const body = await req.json();

		const response = await axios.post(
			`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.API_KEY}`,
			body
		);

		return NextResponse.json(response.data);
	} catch (err) {
		console.error("Gemini API error:", err.response?.data || err.message);
		return NextResponse.json(
			{ error: err.response?.data || err.message },
			{ status: 500 }
		);
	}
}
