
function parseAmount(value) {
  if (!value) return null;

  const cleaned = value
    .replace(/Rs\.?/gi, "")
    .replace(/INR/gi, "")
    .replace(/[₹,\s]/g, "")
    .trim();

  const parsed = Number(cleaned);

  return Number.isFinite(parsed) ? parsed : null;
}

export function parseInvoiceText(text) {
  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  const findValue = (pattern) => {
    const line = lines.find(line => pattern.test(line));

    return line
      ? line.match(pattern)?.[1]?.trim() ?? null
      : null;
  };

  // 1. Extract supplier
  let supplier = findValue(/^Supplier:\s*(.+)$/i);

  // OCR may return the supplier name without a label.
  if (!supplier) {
    supplier = lines.find(line =>
      !/^(invoice|tax invoice|bill of supply)$/i.test(line) &&
      !/^(invoice number|invoice date|purchase order)\s*:/i.test(line) &&
      !/^(item|description)\s+/i.test(line)
    ) ?? null;
  }

  // 2. Extract invoice details
  const invoiceNumber = findValue(/^Invoice Number:\s*(.+)$/i);

  const invoiceDate = findValue(/^Invoice Date:\s*(.+)$/i);

  const purchaseOrder = findValue(/^Purchase Order:\s*(.+)$/i);

  // 3. Extract line items
  const items = [];

  const itemPattern =
    /^(.+?)\s+(\d+(?:\.\d+)?)\s+(kg|litres?|liters?|l|can|pcs|pieces?)\s+(?:Rs\.?\s*)?([\d,]+(?:\.\d{1,2})?)\s+(?:Rs\.?\s*)?([\d,]+(?:\.\d{1,2})?)$/i;

  for (const line of lines) {
    const match = line.match(itemPattern);

    if (match) {
      items.push({
        name: match[1].trim(),
        quantity: Number(match[2]),
        unit: match[3].toLowerCase(),
        rate: parseAmount(match[4]),
        amount: parseAmount(match[5])
      });
    }
  }

  // 4. Extract totals
  const subtotalLine = lines.find(line =>
    /^Subtotal\b/i.test(line)
  );

  const gstLine = lines.find(line =>
    /^GST\b/i.test(line)
  );

  const totalLine = lines.find(line =>
    /^Total\b/i.test(line)
  );

  const amountPattern =
    /(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i;

  const subtotal = subtotalLine
    ? parseAmount(subtotalLine.match(amountPattern)?.[1])
    : null;

  const gst = gstLine
    ? parseAmount(gstLine.match(amountPattern)?.[1])
    : null;

  const gstRate = gstLine
    ? Number(gstLine.match(/\(([\d.]+)%\)/)?.[1] ?? NaN)
    : null;

  const total = totalLine
    ? parseAmount(totalLine.match(amountPattern)?.[1])
    : null;

  // 5. Build invoice object
  const invoice = {
    supplier,
    invoiceNumber,
    invoiceDate,
    purchaseOrder,
    items,
    subtotal,
    gst,
    gstRate: Number.isFinite(gstRate) ? gstRate : null,
    total
  };

  // 6. Generate parsing warnings
  const warnings = [];

  if (!supplier) {
    warnings.push("Supplier name not found.");
  }

  if (!invoiceNumber) {
    warnings.push("Invoice number not found.");
  }

  if (!purchaseOrder) {
    warnings.push("Purchase order reference not found.");
  }

  if (items.length === 0) {
    warnings.push("No invoice line items could be parsed.");
  }

  if (subtotal === null) {
    warnings.push("Subtotal not found.");
  }

  if (total === null) {
    warnings.push("Total not found.");
  }

  return {
    invoice,
    warnings
  };
}
