import { getDocument } from "pdfjs-dist";

const extractTextFromPdfUrl = async (
	transactionData,
	pdfUrl,
	setQuickAction,
	setIsFetch
) => {
	try {
		setIsFetch("Extracting text from pdf file...");

		const loadingTask = getDocument(pdfUrl);
		const pdf = await loadingTask.promise;

		let fullText =
			"Documennt Details = " +
			JSON.stringify(transactionData, null, 2) +
			"\n\n" +
			"// NOTE: Focus on the PDFDocument section below for the extracted PDF content when answering. You may also refer to TransactionDetails as needed. (transaction id and qr is the tr_qr)\n\n " +
			"PDFDocument = {\n";

		for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
			const page = await pdf.getPage(pageNum);
			const textContent = await page.getTextContent();
			const pageText = textContent.items.map((item) => item.str).join(" ");
			fullText += pageText + "\n\n";
		}

		fullText += "}";

		setQuickAction({ pdfText: fullText });
	} catch (error) {
		console.error("Error extracting PDF text:", error);
		setQuickAction({ pdfText: "Failed to extract SAVETAG" });
	} finally {
		setIsFetch(null);
	}
};

export default extractTextFromPdfUrl;
