export const businessData = {
  isDemoData: true,
  source: "synthetic_demo_data",
  business: {
    name: "MuseOps Demo Store",
    type: "Retail Grocery / Kirana",
    currency: "INR"
  },

  products: [
    {
      id: "P001",
      name: "Sona Masoori Rice",
      category: "Rice",
      unit: "kg",
      sellingPrice: 65,
      purchasePrice: 52,
      currentStock: 28,
      reorderLevel: 40,
      preferredSupplierId: "SUP001"
    },
    {
      id: "P002",
      name: "Sunflower Oil",
      category: "Cooking Oil",
      unit: "litre",
      sellingPrice: 145,
      purchasePrice: 125,
      currentStock: 18,
      reorderLevel: 25,
      preferredSupplierId: "SUP002"
    },
    {
      id: "P003",
      name: "Sunflower Oil 5L",
      category: "Cooking Oil",
      unit: "can",
      sellingPrice: 680,
      purchasePrice: 610,
      currentStock: 8,
      reorderLevel: 10,
      preferredSupplierId: "SUP002"
    },
    {
      id: "P004",
      name: "Toor Dal",
      category: "Pulses",
      unit: "kg",
      sellingPrice: 160,
      purchasePrice: 138,
      currentStock: 55,
      reorderLevel: 20,
      preferredSupplierId: "SUP001"
    },
    {
      id: "P005",
      name: "Basmati Rice",
      category: "Rice",
      unit: "kg",
      sellingPrice: 110,
      purchasePrice: 92,
      currentStock: 12,
      reorderLevel: 20,
      preferredSupplierId: "SUP001"
    },
    {
      id: "P006",
      name: "Wheat Flour",
      category: "Flour",
      unit: "kg",
      sellingPrice: 48,
      purchasePrice: 38,
      currentStock: 65,
      reorderLevel: 30,
      preferredSupplierId: "SUP002"
    }
  ],

  customers: [
    {
      id: "CUS001",
      name: "Ananya Sharma",
      phone: "9000000001",
      type: "Retail Customer"
    },
    {
      id: "CUS002",
      name: "Kiran Kumar",
      phone: "9000000002",
      type: "Retail Customer"
    },
    {
      id: "CUS003",
      name: "Lakshmi Devi",
      phone: "9000000003",
      type: "Retail Customer"
    }
  ],

  suppliers: [
    {
      id: "SUP001",
      name: "Ravi Stores",
      phone: "9000000011",
      leadTimeDays: 2,
      status: "Active"
    },
    {
      id: "SUP002",
      name: "Sai Distributors",
      phone: "9000000012",
      leadTimeDays: 3,
      status: "Active"
    }
  ],

  salesOrders: [
    {
      id: "SO001",
      customerId: "CUS001",
      customerName: "Ananya Sharma",
      items: [
        { productId: "P001", productName: "Sona Masoori Rice", quantity: 10 },
        { productId: "P002", productName: "Sunflower Oil", quantity: 2 }
      ],
      status: "Pending",
      priority: "Normal",
      dueDate: "2026-11-06"
    },
    {
      id: "SO002",
      customerId: "CUS002",
      customerName: "Kiran Kumar",
      items: [
        { productId: "P002", productName: "Sunflower Oil", quantity: 1 },
        { productId: "P003", productName: "Sunflower Oil 5L", quantity: 1 }
      ],
      status: "Pending",
      priority: "Normal",
      dueDate: "2026-11-05"
    },
    {
      id: "SO003",
      customerId: "CUS003",
      customerName: "Lakshmi Devi",
      items: [
        { productId: "P004", productName: "Toor Dal", quantity: 2 }
      ],
      status: "Ready for Pickup",
      priority: "Normal",
      dueDate: "2026-11-05"
    }
  ],

  purchaseOrders: [
    {
      id: "PO001",
      supplierId: "SUP001",
      supplierName: "Ravi Stores",
      items: [
        { productId: "P001", productName: "Sona Masoori Rice", quantity: 50 },
        { productId: "P004", productName: "Toor Dal", quantity: 25 }
      ],
      status: "Confirmed",
      expectedDelivery: "2026-11-06"
    },
    {
      id: "PO002",
      supplierId: "SUP002",
      supplierName: "Sai Distributors",
      items: [
        { productId: "P002", productName: "Sunflower Oil", quantity: 40 },
        { productId: "P003", productName: "Sunflower Oil 5L", quantity: 15 }
      ],
      status: "Delayed",
      expectedDelivery: "2026-11-08",
      delayDays: 3
    }
  ]
};
