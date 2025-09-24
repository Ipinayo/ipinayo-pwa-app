import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { generateMassSelectionPDF } from "@/lib/pdf-generator"
import prisma from "@/lib/prisma";

// GET /api/mass-selections/[id]/pdf - Generate and download PDF
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const selection = await prisma.massSelection.findUnique({
      where: { id: params.id },
      include: {
        parts: true,
        createdBy: {
          select: { name: true, email: true },
        },
      },
    })

    if (!selection) {
      return NextResponse.json({ error: "Mass selection not found" }, { status: 404 })
    }

    // Check access: owner or public selection
    if (selection.createdById !== session.user.id && !selection.isPublic) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Generate PDF
    const pdfBytes = await generateMassSelectionPDF(selection)

    // Create filename
    const filename = `${selection.title.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date(selection.date).toISOString().split("T")[0]
      }.pdf`

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBytes.length.toString(),
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
