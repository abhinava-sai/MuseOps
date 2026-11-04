import { readFile } from "node:fs/promises";
import { PDFParse } from "pdf-parse";
import { parseInvoiceText } from "./server/invoiceParser.js";

const fileBuffer = await readFile(
  "C:/Users/DELL/Downloads/sample-invoice.pdf"
);

const parser = new PDFParse({ data: fileBuffer });

try {
  const result = await parser.getText();
  const parsed = parseInvoiceText(result.text);

  console.log("\n--- STRUCTURED INVOICE ---\n");
  console.log(JSON.stringify(parsed, null, 2));
} finally {
  await parser.destroy();
}
