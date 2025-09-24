import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"

// GET /api/mass-selections/[id] - Get single mass selection
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
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

    return NextResponse.json(selection)
  } catch (error) {
    console.error("Error fetching mass selection:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/mass-selections/[id] - Update mass selection
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, date, templateType, liturgicalYear, season, themes, pastoralFocus, parts, isPublic } = body

    // Check ownership
    const existingSelection = await prisma.massSelection.findUnique({
      where: { id: params.id },
    })

    if (!existingSelection) {
      return NextResponse.json({ error: "Mass selection not found" }, { status: 404 })
    }

    if (existingSelection.createdById !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Update selection with parts
    const selection = await prisma.massSelection.update({
      where: { id: params.id },
      data: {
        title,
        date: new Date(date),
        templateType,
        liturgicalYear,
        season,
        themes,
        pastoralFocus,
        isPublic: isPublic || false,
        parts: {
          deleteMany: {}, // Remove existing parts
          create:
            parts?.map((part: any) => ({
              partName: part.partName,
              keySignature: part.keySignature,
              notes: part.notes,
            })) || [],
        },
      },
      include: {
        parts: true,
        createdBy: {
          select: { name: true, email: true },
        },
      },
    })

    return NextResponse.json(selection)
  } catch (error) {
    console.error("Error updating mass selection:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/mass-selections/[id] - Delete mass selection
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check ownership
    const existingSelection = await prisma.massSelection.findUnique({
      where: { id: params.id },
    })

    if (!existingSelection) {
      return NextResponse.json({ error: "Mass selection not found" }, { status: 404 })
    }

    if (existingSelection.createdById !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    await prisma.massSelection.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Mass selection deleted successfully" })
  } catch (error) {
    console.error("Error deleting mass selection:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
