import { NextResponse } from "next/server";
import { Params } from "@/types/utils";
import { auth } from "@/auth";
import { findSelectionWithParts } from "@/db/mass-selections";
import { generateMassSelectionPDF } from "@/lib/pdf-generator"

// GET /api/mass-selections/[id]/pdf - Generate and download PDF
export const GET = auth(async (request, props: { params: Params }) => {
  try {

    if (!request.auth?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await props.params;

    const selection = await findSelectionWithParts(params.id)

    if (!selection) {
      return NextResponse.json({ error: "Mass selection not found" }, { status: 404 })
    }

    // Check access
    if (selection.createdById !== request.auth.user.id && !selection.isPublic) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Generate PDF
    const pdfBytes = await generateMassSelectionPDF(selection)

    // Create filename
    const filename = `${selection.title.replace(/[^a-zA-Z0-9]/g, "_")}_ipinayo.pdf`

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
})
