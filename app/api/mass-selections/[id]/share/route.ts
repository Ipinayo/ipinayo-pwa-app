import { findSelection, updateSelection } from "@/db/mass-selections";

import { NextResponse } from "next/server"
import { Params } from "@/types/utils";
import { auth } from "@/auth"

// POST /api/mass-selections/[id]/share - Generate shareable link
export const POST = auth(async (request, props: { params: Params }) => {
  try {
    if (!request.auth?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await props.params;

    const selection = await findSelection(params.id)

    if (!selection) {
      return NextResponse.json({ error: "Mass selection not found" }, { status: 404 })
    }

    // Check ownership or public
    if (selection.createdById !== request.auth.user.id && !selection.isPublic) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Make selection public if it isn't already
    if (!selection.isPublic) {
      await updateSelection({ isPublic: true }, params.id)
    }

    // Generate shareable URLs
    const baseUrl = process.env.AUTH_URL || "http://localhost:3000"
    const shareableLink = `${baseUrl}/mass-selections/${params.id}`
    const pdfLink = `${baseUrl}/api/mass-selections/${params.id}/pdf`

    return NextResponse.json({
      shareableLink,
      pdfLink,
      message: "Mass selection is now public and shareable",
    })
  } catch (error) {
    console.error("Error creating shareable link:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
