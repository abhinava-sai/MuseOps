function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeUnit(unit) {
  const value = normalize(unit);

  const aliases = {
    kg: "kg",
    kilogram: "kg",
    kilograms: "kg",
    litre: "litre",
    liter: "litre",
    litres: "litre",
    liters: "litre",
    can: "can",
    pc: "piece",
    pcs: "piece",
    piece: "piece",
    pieces: "piece"
  };

  return aliases[value] ?? value;
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function matchInvoiceWithPO(invoice, businessData) {
  const purchaseOrder = businessData.purchaseOrders.find(
    po => po.id === invoice.purchaseOrder
  );

  if (!purchaseOrder) {
    return {
      status: "unmatched",
      summary: "Purchase order not found.",
      discrepancies: [
        `No purchase order found with ID ${invoice.purchaseOrder}.`
      ],
      items: []
    };
  }

  const supplier = businessData.suppliers.find(
    item => item.id === purchaseOrder.supplierId
  );

  const discrepancies = [];
  const warnings = [];

  const supplierMatches =
    normalize(invoice.supplier) === normalize(purchaseOrder.supplierName);

  if (!supplierMatches) {
    discrepancies.push(
      `Supplier mismatch: invoice says "${invoice.supplier}", but ${purchaseOrder.id} belongs to "${purchaseOrder.supplierName}".`
    );
  }

  const invoiceItems = invoice.items ?? [];
  const matchedItems = [];
  const matchedPOProductIds = new Set();

  for (const invoiceItem of invoiceItems) {
    const product = businessData.products.find(
      item => normalize(item.name) === normalize(invoiceItem.name)
    );

    if (!product) {
      matchedItems.push({
        invoiceItem: invoiceItem.name,
        status: "unmatched",
        discrepancies: ["Product not found in business records."]
      });

      discrepancies.push(
        `Unknown product on invoice: ${invoiceItem.name}.`
      );

      continue;
    }

    const poItem = purchaseOrder.items.find(
      item => item.productId === product.id
    );

    if (!poItem) {
      matchedItems.push({
        productId: product.id,
        productName: product.name,
        status: "not_in_purchase_order",
        discrepancies: ["Product is not included in this purchase order."]
      });

      discrepancies.push(
        `${product.name} is not included in ${purchaseOrder.id}.`
      );

      continue;
    }

    matchedPOProductIds.add(product.id);

    const itemDiscrepancies = [];

    const quantityMatches =
      Number(invoiceItem.quantity) === Number(poItem.quantity);

    if (!quantityMatches) {
      itemDiscrepancies.push(
        `Quantity mismatch: invoice ${invoiceItem.quantity}, PO ${poItem.quantity}.`
      );
    }

    const unitMatches =
      normalizeUnit(invoiceItem.unit) === normalizeUnit(product.unit);

    if (!unitMatches) {
      itemDiscrepancies.push(
        `Unit mismatch: invoice ${invoiceItem.unit}, expected ${product.unit}.`
      );
    }

    const expectedRate = Number(product.purchasePrice);
    const actualRate = Number(invoiceItem.rate);

    const rateMatches = actualRate === expectedRate;

    if (!rateMatches) {
      itemDiscrepancies.push(
        `Price reference mismatch: invoice rate ${actualRate}, product purchase price ${expectedRate}.`
      );
    }

    const expectedAmount = roundMoney(
      Number(invoiceItem.quantity) * actualRate
    );

    const lineAmountMatches =
      roundMoney(Number(invoiceItem.amount)) === expectedAmount;

    if (!lineAmountMatches) {
      itemDiscrepancies.push(
        `Line amount mismatch: invoice ${invoiceItem.amount}, calculated ${expectedAmount}.`
      );
    }

    matchedItems.push({
      productId: product.id,
      productName: product.name,
      invoice: {
        quantity: invoiceItem.quantity,
        unit: invoiceItem.unit,
        rate: actualRate,
        amount: invoiceItem.amount
      },
      purchaseOrder: {
        quantity: poItem.quantity,
        unit: product.unit,
        referenceRate: expectedRate
      },
      checks: {
        quantityMatches,
        unitMatches,
        rateMatches,
        lineAmountMatches
      },
      status: itemDiscrepancies.length === 0 ? "matched" : "discrepancy",
      discrepancies: itemDiscrepancies
    });

    discrepancies.push(...itemDiscrepancies.map(
      issue => `${product.name}: ${issue}`
    ));
  }

  for (const poItem of purchaseOrder.items) {
    if (!matchedPOProductIds.has(poItem.productId)) {
      const product = businessData.products.find(
        item => item.id === poItem.productId
      );

      warnings.push(
        `PO item missing from invoice: ${product?.name ?? poItem.productId}.`
      );
    }
  }

  const calculatedSubtotal = roundMoney(
    invoiceItems.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    )
  );

  const subtotalMatches =
    invoice.subtotal !== null &&
    invoice.subtotal !== undefined &&
    calculatedSubtotal === roundMoney(Number(invoice.subtotal));

  if (!subtotalMatches) {
    discrepancies.push(
      `Subtotal mismatch: invoice ${invoice.subtotal}, calculated from line items ${calculatedSubtotal}.`
    );
  }

  const calculatedTotal =
    invoice.subtotal !== null && invoice.gst !== null
      ? roundMoney(Number(invoice.subtotal) + Number(invoice.gst))
      : null;

  const totalMatches =
    calculatedTotal !== null &&
    invoice.total !== null &&
    roundMoney(Number(invoice.total)) === calculatedTotal;

  if (!totalMatches) {
    discrepancies.push(
      "Invoice total does not match subtotal plus GST, or required totals are missing."
    );
  }

  const allItemsMatched =
    matchedItems.length === purchaseOrder.items.length &&
    matchedItems.every(item => item.status === "matched");

  const allChecksPassed =
    supplierMatches &&
    allItemsMatched &&
    subtotalMatches &&
    totalMatches &&
    discrepancies.length === 0 &&
    warnings.length === 0;

  return {
    status: allChecksPassed ? "matched" : "discrepancy",

    summary: allChecksPassed
      ? "Invoice matches the purchase order and available product price references."
      : "Invoice requires review before approval.",

    invoiceNumber: invoice.invoiceNumber,
    purchaseOrder: purchaseOrder.id,

    supplier: {
      invoiceSupplier: invoice.supplier,
      purchaseOrderSupplier: purchaseOrder.supplierName,
      supplierId: purchaseOrder.supplierId,
      supplierRecordFound: Boolean(supplier),
      matches: supplierMatches
    },

    itemResults: matchedItems,

    totals: {
      invoiceSubtotal: invoice.subtotal,
      calculatedSubtotal,
      subtotalMatches,
      invoiceGST: invoice.gst,
      invoiceTotal: invoice.total,
      calculatedTotal,
      totalMatches
    },

    discrepancies,
    warnings,

    approvalRequired: true,
    inventoryUpdated: false
  };
}
