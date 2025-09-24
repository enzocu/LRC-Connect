import { collection, query, where, getDocs, getDoc } from "firebase/firestore";
import { db } from "../../../../server/firebaseConfig";
import { formatDate, formatTime } from "../../../custom/customFunction";

export async function getDefault(usersdetails, withFaqs, setIsFetch, Alert) {
	try {
		setIsFetch("Fetching user default details…");

		const liRef = usersdetails.us_liID;

		let liSnap;
		let faqs = [];

		if (withFaqs) {
			// Run both queries in parallel
			[liSnap, faqs] = await Promise.all([
				getDoc(liRef),
				getDocs(
					query(
						collection(db, "faqs"),
						where("fa_liID", "==", liRef),
						where("fa_status", "==", "Active")
					)
				),
			]);
			faqs = faqs.docs.map((doc) => doc.data());
		} else {
			// Fetch only library details
			liSnap = await getDoc(liRef);
		}

		const libraryData = liSnap.exists() ? liSnap.data() : {};

		let output = `📑 User Details\n\n`;
		output += `Email: ${usersdetails.us_email}\n`;
		output += `UID: ${usersdetails.uid}\n`;
		output += `Name: ${usersdetails.us_lname}, ${usersdetails.us_fname} ${usersdetails.us_mname}\n`;
		output += `Birthday: ${formatDate(usersdetails.us_birthday)}\n`;
		output += `Program: ${usersdetails.us_program}\n`;
		output += `Year: ${usersdetails.us_year}\n`;
		output += `Section: ${usersdetails.us_section}\n`;
		output += `Type: ${usersdetails.us_type}\n`;
		output += `Status: ${usersdetails.us_status}\n`;
		output += `Level: ${usersdetails.us_level}\n`;
		output += `Phone: ${usersdetails.us_phoneNumber}\n`;
		output += `Address: ${usersdetails.us_street}, ${usersdetails.us_barangay}, ${usersdetails.us_municipal}, ${usersdetails.us_province}\n`;
		output += `School: ${usersdetails.us_school} (${usersdetails.us_schoolID})\n`;
		output += `QR: ${usersdetails.us_qr}\n`;
		output += `PhotoURL: ${usersdetails.us_photoURL}\n`;
		output += `Created At: ${formatDate(
			usersdetails.us_createdAt
		)} ${formatTime(usersdetails.us_createdAt)}\n`;
		output += `Updated At: ${formatDate(
			usersdetails.us_updatedAt
		)} ${formatTime(usersdetails.us_updatedAt)}\n\n`;

		output += `🏛️ Library Details\n\n`;
		output += `Name: ${libraryData.li_name}\n`;
		output += `Description: ${libraryData.li_description}\n`;
		output += `Email: ${libraryData.li_email}\n`;
		output += `Phone: ${libraryData.li_phone}\n`;
		output += `School: ${libraryData.li_schoolname} (${libraryData.li_schoolID})\n`;
		output += `Address: ${libraryData.li_address}\n`;
		output += `QR: ${libraryData.li_qr}\n`;
		output += `PhotoURL: ${libraryData.li_photoURL}\n`;
		output += `Status: ${libraryData.li_status}\n`;
		output += `Created At: ${formatDate(libraryData.li_createdAt)} ${formatTime(
			libraryData.li_createdAt
		)}\n\n`;

		output += `📖 Borrowing Rules\n\n`;
		if (libraryData.li_borrowing) {
			const { br_administrator, br_faculty, br_student } =
				libraryData.li_borrowing;
			if (br_administrator)
				output += `Administrator – Reserved / Utilized Days Range: ${br_administrator.borrowDays}, Max Items: ${br_administrator.maxItems}\n`;
			if (br_faculty)
				output += `Faculty – Reserved / Utilized Days Range: ${br_faculty.borrowDays}, Max Items: ${br_faculty.maxItems}\n`;
			if (br_student)
				output += `Student – Reserved / Utilized Days Range: ${br_student.borrowDays}, Max Items: ${br_student.maxItems}\n`;
		}
		output += `\n`;

		output += `🕒 Operating Hours\n\n`;
		if (libraryData.li_operating) {
			for (let [day, data] of Object.entries(libraryData.li_operating)) {
				output += `${day}: ${
					data.enabled
						? `${formatTime(data.open)} - ${formatTime(data.close)}`
						: "Closed"
				}\n`;
			}
		}
		output += `\n`;

		if (withFaqs) {
			output += `📌 FAQs\n\n`;
			faqs.forEach((faq, i) => {
				output += `${i + 1}. Q: ${faq.fa_question}\n   A: ${faq.fa_answer}\n\n`;
			});
		}

		return output;
	} catch (error) {
		console.error("Error fetching reports:", error);
		Alert?.showDanger(error.message || "Failed to fetch reports.");
		return "📑 Active Reports\n\nError fetching data.";
	} finally {
		setIsFetch(null);
	}
}
