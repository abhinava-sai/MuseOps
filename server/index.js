import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import { businessData } from "../data/businessData.js";
import { parseInvoiceText } from "./invoiceParser.js";
import { matchInvoiceWithPO } from "./invoiceMatcher.js";
import { createWorker } from "tesseract.js";

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.MODEL_API_KEY;

if (!API_KEY) {
  throw new Error("MODEL_API_KEY is missing from .env");
}

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json({ limit: "1mb" }));
const invoiceUpload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png"
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Unsupported file type. Upload a PDF, JPG or PNG.")
      );
    }

    cb(null, true);
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "MuseOps API",
    businessDataConnected: true
  });
});

app.get("/api/business-data", (req, res) => {
  res.json(businessData);
});


app.post(
  "/api/invoices/upload",
  invoiceUpload.single("invoice"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        error: "Please upload an invoice."
      });
    }

    const mimeType = req.file.mimetype;

    const isPdf = mimeType === "application/pdf";
    const isImage = [
      "image/jpeg",
      "image/png"
    ].includes(mimeType);

    if (!isPdf && !isImage) {
      return res.status(415).json({
        error: "Unsupported file type. Please upload a PDF, JPG, JPEG or PNG."
      });
    }

    let parser = null;
    let worker = null;

    try {
      let extractedText = "";
      let ocrConfidence = null;

      // 1. Extract text from PDF or image
      if (isPdf) {
        parser = new PDFParse({
          data: req.file.buffer
        });

        const extracted = await parser.getText();
        extractedText = extracted.text;
      } else {
        worker = await createWorker("eng");

        const result = await worker.recognize(req.file.buffer);

        extractedText = result.data.text;
        ocrConfidence = result.data.confidence;
      }

      // 2. Parse invoice into structured data
      const parsed = parseInvoiceText(extractedText);

      // 3. Match invoice against purchase order
      const matching = matchInvoiceWithPO(
        parsed.invoice,
        businessData
      );

      // 4. Return complete result
      res.json({
        message: "Invoice processed successfully.",

        file: {
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size
        },

        extractionMethod: isPdf ? "pdf-parse" : "tesseract.js",
        ocrConfidence,

        extractedText,
        parsedInvoice: parsed.invoice,
        parsingWarnings: parsed.warnings,
        matchingResult: matching
      });

    } catch (error) {
      console.error("Invoice processing error:", error);

      res.status(422).json({
        error: "Invoice processing failed."
      });

    } finally {
      if (parser) {
        await parser.destroy();
      }

      if (worker) {
        await worker.terminate();
      }
    }
  }
);


app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Please provide messages."
      });
    }

    const validMessages = messages.slice(-20).every(
      (message) =>
        message &&
        ["user", "assistant"].includes(message.role) &&
        typeof message.content === "string" &&
        message.content.trim().length > 0 &&
        message.content.length <= 8000
    );

    if (!validMessages) {
      return res.status(400).json({
        error: "Invalid message format."
      });
    }

    const systemPrompt = `
You are MuseOps, a business operations assistant
for small businesses.

You have access to the following business dataset:

${JSON.stringify(businessData, null, 2)}

IMPORTANT DATA RULES:
- This is synthetic demonstration data, not a live business database.
- Use these records when answering questions about inventory,
  products, customers, sales orders, suppliers and purchase orders.
- Base calculations and recommendations on the supplied records.
- Check current stock against reorder levels.
- Consider pending customer orders and incoming purchase orders
  before recommending restocking.
- Distinguish confirmed deliveries from delayed deliveries.
- If information is missing, explicitly say so.
- Never invent stock levels, prices, deliveries or order records.
- Never claim to have placed orders, changed inventory,
  sent messages or executed business actions.

Be concise, practical and explicit about uncertainty.
    `.trim();

    const response = await fetch(
      "https://api.meta.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "muse-spark-1.3",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            ...messages.slice(-20)
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Meta API error:", data);

      return res.status(502).json({
        error: "Muse Spark API request failed."
      });
    }

    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(502).json({
        error: "Muse Spark returned an empty response."
      });
    }

    res.json({ reply });

  } catch (error) {
    console.error("MuseOps error:", error.message);

    res.status(500).json({
      error: "Something went wrong with MuseOps."
    });
  }
});

app.listen(PORT, () => {
  console.log(`MuseOps backend running at http://localhost:${PORT}`);
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error:
        err.code === "LIMIT_FILE_SIZE"
          ? "Invoice exceeds the 10 MB size limit."
          : err.message
    });
  }

  if (err) {
    return res.status(400).json({
      error: err.message
    });
  }

  next();
});