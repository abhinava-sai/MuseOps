# MuseOps

**An AI-powered operations assistant for small businesses through whatsapp.**

MuseOps is a hackathon prototype exploring how conversational AI can help small businesses manage everyday operations, including supplier communication, inventory context, purchase orders, and invoice verification.

## Features

- WhatsApp Business-inspired desktop interface.
- Dedicated AI Operations Assistant.
- AI-powered business operations chat using Meta models.
- Invoice upload and text extraction from PDF documents.
- Image-based invoice extraction using Tesseract OCR.
- Invoice parsing and purchase-order matching.
- Detection of quantity, unit, rate, and amount discrepancies.
- Human-in-the-loop invoice review.
- Synthetic business data for demonstration.

## How invoice verification works

1. Upload a supplier invoice in the supplier conversation.
2. Extract text from the PDF or image.
3. Parse supplier details, invoice number, purchase order reference, and line items.
4. Match invoice details against the available purchase order and business data.
5. Identify discrepancies and display the validation results.
6. Keep the invoice pending human approval.

**Important:** A successful match does not automatically approve an invoice or update inventory. Inventory updates are intentionally kept separate from invoice verification.

## Tech stack

**Frontend**
- React
- Vite
- JavaScript
- Lucide React
- React Markdown

**Backend**
- Node.js
- Express
- Multer
- pdf-parse
- Tesseract.js
- Meta Model API

## Project structure

```text
wa-business-demo/
├── data/
│   └── businessData.js
├── server/
│   ├── index.js
│   ├── invoiceParser.js
│   └── invoiceMatcher.js
├── wa-business-demo/
│   ├── src/
│   ├── index.html
│   └── package.json
├── create_invoice.py
├── create_discrepancy_invoice.py
├── create_image_invoice.py
├── test-invoice-matching.js
├── test-invoice-parser.js
├── test-ocr.js
├── test-pdf.js
├── package.json
├── package-lock.json
└── .env.example
```

## Prerequisites

- Node.js and npm
- Python (only if you want to regenerate the sample invoices)
- A Meta Model API key

## Local setup

### 1. Clone the repository

```bash
git clone YOUR_PUBLIC_REPOSITORY_URL
cd wa-business-demo
```

### 2. Configure environment variables

Create a `.env` file in the project root using `.env.example`.

Add your Meta Model API key:

```env
MODEL_API_KEY=your_meta_api_key
PORT=3001
```

Never commit your `.env` file or expose your API key.

### 3. Install backend dependencies

Run from the project root:

```bash
npm install
```

### 4. Start the backend

```bash
npm run server
```

The backend runs at:

```text
http://localhost:3001
```

### 5. Install frontend dependencies

Open another terminal:

```bash
cd wa-business-demo
npm install
```

### 6. Start the frontend

```bash
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://localhost:5173
```

## Demo scenarios

**Scenario 1 — Matching invoice**

An invoice matching the purchase order is processed and its validation checks pass.

**Scenario 2 — Invoice discrepancy**

A supplier invoice lists 55 kg of Sona Masoori Rice against a purchase order for 50 kg. MuseOps identifies the quantity mismatch while independently validating the invoice arithmetic.

## Current prototype limitations

- Uses synthetic business and purchase-order data.
- Does not connect to a live WhatsApp Business Platform account.
- Does not provide persistent database-backed storage.
- Invoice verification does not constitute final invoice approval.
- Inventory is not automatically updated after invoice verification.

## Disclaimer

MuseOps is an independent hackathon prototype. It is not the official WhatsApp application and is not an official WhatsApp integration.
