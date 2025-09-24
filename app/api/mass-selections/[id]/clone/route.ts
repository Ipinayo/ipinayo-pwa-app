import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// POST /api/mass-selections/[id]/clone - Clone a mass selection
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const originalSelection = await prisma.massSelection.findUnique({
      where: { id: params.id },
      include: { parts: true },
    })

    if (!originalSelection) {
      return NextResponse.json({ error: "Mass selection not found" }, { status: 404 })
    }

    // Check access: owner or public selection
    if (originalSelection.createdById !== session.user.id && !originalSelection.isPublic) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Clone the selection
    const clonedSelection = await prisma.massSelection.create({
      data: {
        title: `${originalSelection.title} (Copy)`,
        date: originalSelection.date,
        templateType: originalSelection.templateType,
        liturgicalYear: originalSelection.liturgicalYear,
        season: originalSelection.season,
        themes: originalSelection.themes,
        pastoralFocus: originalSelection.pastoralFocus,
        isPublic: false, // Clones are private by default
        createdById: session.user.id,
        parts: {
          create: originalSelection.parts.map((part) => ({
            partName: part.partName,
            keySignature: part.keySignature,
            notes: part.notes,
          })),
        },
      },
      include: {
        parts: true,
        createdBy: {
          select: { name: true, email: true },
        },
      },
    })

    return NextResponse.json(clonedSelection, { status: 201 })
  } catch (error) {
    console.error("Error cloning mass selection:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
