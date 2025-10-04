import { findSelectionWithParts, saveSelection } from "@/db/mass-selections";

import { NextResponse } from "next/server"
import { Params } from "@/types/utils";
import { auth } from "@/auth";

// POST /api/mass-selections/[id]/clone - Clone a mass selection
export const POST = auth(async (request, props: { params: Params }) => {
  try {
    if (!request.auth?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await props.params;

    const originalSelection = await findSelectionWithParts(params.id)

    if (!originalSelection) {
      return NextResponse.json({ error: "Mass selection not found" }, { status: 404 })
    }

    // Check access: owner or public selection
    if (originalSelection.createdById !== request.auth.user.id && !originalSelection.isPublic) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const { createdBy, createdById, themes, ...rest } = originalSelection

    // Clone the selection
    const clonedSelection = await saveSelection({ ...rest, title: `${originalSelection.title} (Copy)`, isPublic: false, themes: themes.map(theme => theme.name) }, request.auth.user.id)

    return NextResponse.json(clonedSelection, { status: 201 })
  } catch (error) {
    console.error("Error cloning mass selection:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
