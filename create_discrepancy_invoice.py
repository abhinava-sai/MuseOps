from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm

file_path = r"C:\Users\DELL\Downloads\sample-invoice-discrepancy.pdf"

doc = SimpleDocTemplate(file_path, pagesize=A4)
styles = getSampleStyleSheet()
story = []

story.append(Paragraph("SAMPLE TAX INVOICE", styles["Title"]))
story.append(Spacer(1, 8 * mm))
story.append(Paragraph("<b>Supplier:</b> Ravi Stores", styles["Normal"]))
story.append(Paragraph("<b>Invoice Number:</b> INV-2026-002", styles["Normal"]))
story.append(Paragraph("<b>Invoice Date:</b> 05 November 2026", styles["Normal"]))
story.append(Paragraph("<b>Purchase Order:</b> PO001", styles["Normal"]))
story.append(Spacer(1, 10 * mm))

data = [
    ["Item", "Quantity", "Rate", "Amount"],
    ["Sona Masoori Rice", "55 kg", "Rs. 52", "Rs. 2,860"],
    ["Toor Dal", "25 kg", "Rs. 138", "Rs. 3,450"],
    ["", "", "Subtotal", "Rs. 6,310"],
    ["", "", "GST (5%)", "Rs. 315.50"],
    ["", "", "Total", "Rs. 6,625.50"],
]

table = Table(data, colWidths=[65*mm, 35*mm, 35*mm, 35*mm])
table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#263445")),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
    ("PADDING", (0, 0), (-1, -1), 9),
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
]))

story.append(table)
story.append(Spacer(1, 12 * mm))
story.append(Paragraph("Synthetic discrepancy invoice for MuseOps testing.", styles["Italic"]))

doc.build(story)
print(f"Created invoice: {file_path}")
