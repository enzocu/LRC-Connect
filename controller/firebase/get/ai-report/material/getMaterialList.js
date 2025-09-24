import { collection, query, where, getDocs, getDoc } from "firebase/firestore";
import { db } from "../../../../../server/firebaseConfig";
import { formatDate, formatYear } from "../../../../custom/customFunction";

export async function getMaterialList(li_id, setIsFetch, Alert) {
	try {
		setIsFetch("Fetching active materials…");

		const materialRef = collection(db, "material");

		// Build conditions
		const conditions = [where("ma_status", "==", "Active")];
		if (li_id) {
			conditions.push(where("ma_liID", "==", li_id));
		}

		// Create query
		const q = query(materialRef, ...conditions);
		const snapshot = await getDocs(q);

		const materials = await Promise.all(
			snapshot.docs.map(async (docSnap) => {
				const d = docSnap.data();

				try {
					const [mtSnap, caSnap, shSnap, liSnap] = await Promise.all([
						getDoc(d.ma_mtID),
						getDoc(d.ma_caID),
						getDoc(d.ma_shID),
						getDoc(d.ma_liID),
					]);

					if (
						!mtSnap.exists() ||
						!caSnap.exists() ||
						!shSnap.exists() ||
						!liSnap.exists()
					) {
						return null;
					}

					const mtData = mtSnap.data();
					const caData = caSnap.data();
					const shData = shSnap.data();
					const liData = liSnap.data();

					const formatTypes = [];
					if (d.ma_coverQty > 0) formatTypes.push("Hard Copy");
					if (d.ma_softQty > 0) formatTypes.push("Soft Copy");
					if (d.ma_audioQty > 0) formatTypes.push("Audio Copy");

					// Convert into string format
					return (
						`----------------------------------\n` +
						`Material ID: ${docSnap.id}\n` +
						`QR: ${d.ma_qr}\n` +
						`Title: ${d.ma_title || "NA"}\n` +
						`Author: ${d.ma_author || "NA"}\n` +
						`Description: ${d.ma_description || "NA"}\n` +
						`Copies: ${d.ma_coverQty || 0}\n` +
						`Copyright: ${formatYear(d.ma_copyright) || "NA"}\n` +
						`Library Call No: ${d.ma_libraryCall || "NA"}\n` +
						`Status: ${d.ma_status || "NA"}\n` +
						`Library: ${
							(liData.li_name || "") + " - " + (liData.li_schoolname || "")
						}\n` +
						`Type: ${mtData.mt_name || "NA"}\n` +
						`Category: ${caData.ca_name || "NA"}\n` +
						`Shelf: ${shData.sh_name || "NA"}\n` +
						`Created At: ${formatDate(d.ma_createdAt)}\n` +
						`Format: ${formatTypes.join(", ") || "NA"}\n` +
						`Subjects: ${d.ma_subjects?.join(", ") || "NA"}\n` +
						`Cover URL: ${d.ma_coverURL || "None"}\n`
					);
				} catch (err) {
					console.warn("Reference fetching error:", err);
					return null;
				}
			})
		);

		let output = "📌 Active Material List\n\n";
		const validMaterials = materials.filter((item) => item !== null);

		if (validMaterials.length > 0) {
			output += validMaterials.join("\n");
		} else {
			output += "No active materials found.";
		}

		return output;
	} catch (error) {
		console.error("getMaterialList Error:", error);
		Alert?.showDanger(error.message || "Failed to fetch material list.");
		return "📌 Active Material List\n\nError fetching data.";
	} finally {
		setIsFetch(null);
	}
}
