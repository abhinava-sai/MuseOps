import { readFile } from "node:fs/promises";
import { PDFParse } from "pdf-parse";
import { businessData } from "./data/businessData.js";
import { parseInvoiceText } from "./server/invoiceParser.js";
import { matchInvoiceWithPO } from "./server/invoiceMatcher.js";

const fileBuffer = await readFile(
  "C:/Users/DELL/Downloads/sample-invoice.pdf"
);

const parser = new PDFParse({ data: fileBuffer });

try {
  const result = await parser.getText();

  const parsed = parseInvoiceText(result.text);

  const matchingResult = matchInvoiceWithPO(
    parsed.invoice,
    businessData
  );

  console.log("\n--- INVOICE vs PURCHASE ORDER ---\n");
  console.log(JSON.stringify(matchingResult, null, 2));
} finally {
  await parser.destroy();
}
