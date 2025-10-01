import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

import { GenerateMassSelection } from "@/types/models"

export async function generateMassSelectionPDF(selection: GenerateMassSelection): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([612, 792]) // Letter size
  const { width, height } = page.getSize()

  // Load fonts
  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const headerFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // Colors (matching Ìpínayò brand)
  const primaryColor = rgb(0.09, 0.36, 0.92) // #175bea (royal blue)
  const accentColor = rgb(0, 0.77, 0.98) // #00c5fb (cyan)
  const textColor = rgb(0.2, 0.2, 0.2)
  const lightGray = rgb(0.95, 0.95, 0.95)

  let yPosition = height - 60

  // Header with logo space and title
  page.drawRectangle({
    x: 0,
    y: yPosition - 10,
    width: width,
    height: 80,
    color: lightGray,
  })

  // Ìpínayò branding
  page.drawText("Ìpínayò", {
    x: 50,
    y: yPosition + 20,
    size: 24,
    font: titleFont,
    color: primaryColor,
  })

  page.drawText("SHARING JOY, THROUGH MUSIC", {
    x: 50,
    y: yPosition,
    size: 10,
    font: headerFont,
    color: textColor,
  })

  yPosition -= 100

  // Mass Selection Title
  page.drawText(selection.title, {
    x: 50,
    y: yPosition,
    size: 20,
    font: titleFont,
    color: textColor,
  })

  yPosition -= 40

  // Mass Details
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const details = [
    `Date: ${formatDate(selection.date.toISOString())}`,
    selection.liturgicalYear ? `Liturgical Year: Year ${selection.liturgicalYear}` : null,
    selection.liturgicalSeason ? `Liturgical Season: ${selection.liturgicalSeason}` : null,
  ].filter(Boolean)

  for (const detail of details) {
    page.drawText(detail!, {
      x: 50,
      y: yPosition,
      size: 12,
      font: headerFont,
      color: textColor,
    })
    yPosition -= 20
  }

  yPosition -= 20

  // Themes
  if (selection.themes) {
    page.drawText("Themes:", {
      x: 50,
      y: yPosition,
      size: 12,
      font: titleFont,
      color: textColor,
    })
    yPosition -= 18

    const themesLines = wrapText(selection.themes.join(', '), 70)
    for (const line of themesLines) {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 11,
        font: bodyFont,
        color: textColor,
      })
      yPosition -= 16
    }
    yPosition -= 10
  }

  // Pastoral Focus
  if (selection.pastoralFocus) {
    page.drawText("Pastoral Focus:", {
      x: 50,
      y: yPosition,
      size: 12,
      font: titleFont,
      color: textColor,
    })
    yPosition -= 18

    const focusLines = wrapText(selection.pastoralFocus, 70)
    for (const line of focusLines) {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 11,
        font: bodyFont,
        color: textColor,
      })
      yPosition -= 16
    }
    yPosition -= 10
  }

  // Mass Parts Header
  page.drawText("Mass Parts", {
    x: 50,
    y: yPosition,
    size: 16,
    font: titleFont,
    color: primaryColor,
  })

  yPosition -= 30

  // Mass Parts Table
  const tableStartY = yPosition
  const rowHeight = 35
  const colWidths = [200, 100, 200]
  const colPositions = [50, 250, 350]

  // Table headers
  page.drawRectangle({
    x: 45,
    y: yPosition - 5,
    width: width - 90,
    height: 25,
    color: lightGray,
  })

  const headers = ["Part Name", "Key", "Notes"]
  headers.forEach((header, index) => {
    page.drawText(header, {
      x: colPositions[index],
      y: yPosition,
      size: 11,
      font: titleFont,
      color: textColor,
    })
  })

  yPosition -= 30

  // Table rows
  selection.parts.forEach((part, index) => {
    // Alternate row background
    if (index % 2 === 0) {
      page.drawRectangle({
        x: 45,
        y: yPosition - 5,
        width: width - 90,
        height: rowHeight,
        color: rgb(0.98, 0.98, 0.98),
      })
    }

    // Part name
    page.drawText(part.partName, {
      x: colPositions[0],
      y: yPosition + 10,
      size: 10,
      font: bodyFont,
      color: textColor,
    })

    // Key signature
    if (part.keySignature) {
      page.drawText(part.keySignature, {
        x: colPositions[1],
        y: yPosition + 10,
        size: 10,
        font: bodyFont,
        color: textColor,
      })
    }

    // Notes (wrapped if too long)
    if (part.notes) {
      const notesLines = wrapText(part.notes, 25)
      notesLines.slice(0, 2).forEach((line, lineIndex) => {
        page.drawText(line, {
          x: colPositions[2],
          y: yPosition + 10 - lineIndex * 12,
          size: 9,
          font: bodyFont,
          color: textColor,
        })
      })
    }

    yPosition -= rowHeight

    // Check if we need a new page
    if (yPosition < 100) {
      const newPage = pdfDoc.addPage([612, 792])
      yPosition = height - 60
    }
  })

  // Footer
  const footerY = 50
  page.drawText(`Generated by Ìpínayò • ${new Date().toLocaleDateString()}`, {
    x: 50,
    y: footerY,
    size: 8,
    font: headerFont,
    color: rgb(0.6, 0.6, 0.6),
  })

  page.drawText(`Created by: ${selection.createdBy.name || selection.createdBy.email}`, {
    x: width - 200,
    y: footerY,
    size: 8,
    font: headerFont,
    color: rgb(0.6, 0.6, 0.6),
  })

  return await pdfDoc.save()
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(" ")
  const lines: string[] = []
  let currentLine = ""

  for (const word of words) {
    if ((currentLine + word).length <= maxCharsPerLine) {
      currentLine += (currentLine ? " " : "") + word
    } else {
      if (currentLine) {
        lines.push(currentLine)
      }
      currentLine = word
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}
