from __future__ import annotations

import io

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

GOLD_COLOR = colors.HexColor("#C9A84C")
DARK_COLOR = colors.HexColor("#1A1A2E")
SUBTLE_COLOR = colors.HexColor("#F9F5EE")


def generate_budget_pdf(estimate_data: dict, narrative: str = "") -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=20 * mm, leftMargin=20 * mm, topMargin=20 * mm, bottomMargin=20 * mm)
    story = []
    styles = getSampleStyleSheet()

    story.append(Paragraph("WeddingBudget.ai", ParagraphStyle("Title", fontName="Helvetica-Bold", fontSize=26, textColor=DARK_COLOR, spaceAfter=6)))
    story.append(Paragraph("Confidential Budget Estimate - Events by Athea", ParagraphStyle("Sub", fontName="Helvetica", fontSize=12, textColor=GOLD_COLOR, spaceAfter=16)))

    for section in estimate_data["breakdown"].values():
        story.append(Paragraph(section["label"], ParagraphStyle("H2", fontName="Helvetica-Bold", fontSize=13, textColor=DARK_COLOR, spaceAfter=4)))
        rows = [["Item", "Low", "Mid", "High"]]
        for item_key, item in section["items"].items():
            mid = int((item["min"] + item["max"]) / 2)
            rows.append([item.get("note", item_key.replace("_", " ").title()), f"Rs {item['min']:,.0f}", f"Rs {mid:,.0f}", f"Rs {item['max']:,.0f}"])
        table = Table(rows, colWidths=[90 * mm, 25 * mm, 25 * mm, 25 * mm])
        table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), DARK_COLOR), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, SUBTLE_COLOR]), ("GRID", (0, 0), (-1, -1), 0.5, GOLD_COLOR), ("FONTNAME", (0, 0), (-1, -1), "Helvetica"), ("FONTSIZE", (0, 0), (-1, -1), 9), ("ALIGN", (1, 0), (-1, -1), "RIGHT")]))
        story.append(table)
        story.append(Spacer(1, 6 * mm))

    story.append(Paragraph(f"Total Estimated Budget: Rs {estimate_data['grand_total_min']:,.0f} - Rs {estimate_data['grand_total_max']:,.0f}", ParagraphStyle("Total", fontName="Helvetica-Bold", fontSize=16, textColor=GOLD_COLOR)))
    if narrative:
        story.append(Spacer(1, 8 * mm))
        story.append(Paragraph("AI Budget Analysis", ParagraphStyle("NarrativeH", fontName="Helvetica-Bold", fontSize=13, textColor=DARK_COLOR)))
        story.append(Paragraph(narrative, styles["BodyText"]))

    doc.build(story)
    return buffer.getvalue()
