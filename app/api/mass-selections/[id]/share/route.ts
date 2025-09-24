import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma";

// POST /api/mass-selections/[id]/share - Generate shareable link
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const selection = await prisma.massSelection.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
      },
    })

    if (!selection) {
      return NextResponse.json({ error: "Mass selection not found" }, { status: 404 })
    }

    // Check ownership
    if (selection.createdById !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Make selection public if it isn't already
    if (!selection.isPublic) {
      await prisma.massSelection.update({
        where: { id: params.id },
        data: { isPublic: true },
      })
    }

    // Generate shareable URLs
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const shareableLink = `${baseUrl}/view/${params.id}`
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
}
