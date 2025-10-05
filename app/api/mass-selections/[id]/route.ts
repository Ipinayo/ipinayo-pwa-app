import { findSelectionWithParts, findUserSelection, removeSelection, updateSelection } from "@/db/mass-selections"

import { NextResponse } from "next/server"
import { Params } from "@/types/utils"
import { auth } from "@/auth"

// GET /api/mass-selections/[id] - Get single mass selection
export const GET = auth(async (request, props: { params: Params }) => {
  try {

    const params = await props.params;

    const selection = await findSelectionWithParts(params.id)

    if (!selection) {
      return NextResponse.json({ error: "Mass selection not found" }, { status: 404 })
    }

    return NextResponse.json(selection)
  } catch (error) {
    console.error("Error fetching mass selection:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

// PUT /api/mass-selections/[id] - Update mass selection
export const PUT = auth(async (request, props: { params: Params }) => {
  try {
    if (!request.auth?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await props.params;
    const body = await request.json();

    // Check ownership
    const existingSelection = await findUserSelection(params.id, request.auth.user.id)

    if (!existingSelection) {
      return NextResponse.json({ error: "Mass selection not found" }, { status: 404 })
    }

    const { createdBy, createdById, id, ...rest } = body

    // Update selection with parts
    const selection = await updateSelection(rest, params.id)

    return NextResponse.json(selection)
  } catch (error) {
    console.error("Error updating mass selection:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

// DELETE /api/mass-selections/[id] - Delete mass selection
export const DELETE = auth(async (request, props: { params: Params }) => {
  try {
    if (!request.auth?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await props.params;

    // Check ownership
    const existingSelection = await findUserSelection(params.id, request.auth.user.id)

    if (!existingSelection) {
      return NextResponse.json({ error: "Mass selection not found" }, { status: 404 })
    }

    await removeSelection(params.id)

    return NextResponse.json({ message: "Mass selection deleted successfully" })
  } catch (error) {
    console.error("Error deleting mass selection:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
