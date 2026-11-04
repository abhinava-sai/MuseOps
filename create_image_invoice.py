
from PIL import Image, ImageDraw, ImageFont

image = Image.new("RGB", (1200, 900), "white")
draw = ImageDraw.Draw(image)

try:
    font = ImageFont.truetype("arial.ttf", 28)
    bold = ImageFont.truetype("arialbd.ttf", 34)
except OSError:
    font = ImageFont.load_default()
    bold = font

lines = [
    ("Ravi Stores", bold),
    ("INVOICE", bold),
    ("Invoice Number: INV-2026-003", font),
    ("Invoice Date: 05 November 2026", font),
    ("Purchase Order: PO001", font),
    ("", font),
    ("Item                 Quantity    Unit    Rate    Amount", font),
    ("Sona Masoori Rice    50          kg      52      2600", font),
    ("Toor Dal             25          kg      138     3450", font),
    ("", font),
    ("Subtotal: Rs. 6050", font),
    ("GST (5%): Rs. 302.50", font),
    ("Total: Rs. 6352.50", bold),
]

y = 50
for text, selected_font in lines:
    draw.text((50, y), text, fill="black", font=selected_font)
    y += 65

image.save("sample-invoice-image.png")
print("Created sample-invoice-image.png")
