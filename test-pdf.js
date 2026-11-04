import { readFile } from "node:fs/promises";
import { PDFParse } from "pdf-parse";

const filePath = "C:/Users/DELL/Downloads/sample-invoice.pdf";

const fileBuffer = await readFile(filePath);

const parser = new PDFParse({
  data: fileBuffer
});

try {
  const result = await parser.getText();

  console.log("\n--- EXTRACTED INVOICE TEXT ---\n");
  console.log(result.text);
  console.log("\n--- END OF EXTRACTED TEXT ---\n");
} catch (error) {
  console.error("PDF extraction failed:", error);
} finally {
  await parser.destroy();
}
