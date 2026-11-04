
import { createWorker } from "tesseract.js";

const worker = await createWorker("eng");

try {
  const result = await worker.recognize("./sample-invoice-image.png");

  console.log("\n--- OCR EXTRACTED TEXT ---\n");
  console.log(result.data.text);

  console.log("\n--- OCR CONFIDENCE ---");
  console.log(result.data.confidence);
} catch (error) {
  console.error("OCR failed:", error);
} finally {
  await worker.terminate();
}
