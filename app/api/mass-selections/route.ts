import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"

// GET /api/mass-selections - Get paginated list of mass selections
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const search = searchParams.get("search") || ""
    const season = searchParams.get("season") || "all"
    const sortBy = searchParams.get("sortBy") || "updatedAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    // Build where clause with search and filter conditions
    const whereClause: any = {
      OR: [{ createdById: session.user.id }, { isPublic: true }],
    }

    // Add search functionality
    if (search) {
      whereClause.AND = [
        {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { themes: { contains: search, mode: "insensitive" } },
            { pastoralFocus: { contains: search, mode: "insensitive" } },
            { templateType: { contains: search, mode: "insensitive" } },
          ],
        },
      ]
    }

    // Add season filter
    if (season !== "all") {
      if (whereClause.AND) {
        whereClause.AND.push({ season })
      } else {
        whereClause.AND = [{ season }]
      }
    }

    // Build order by clause
    const orderBy: any = {}
    if (sortBy === "title" || sortBy === "date" || sortBy === "updatedAt" || sortBy === "createdAt") {
      orderBy[sortBy] = sortOrder
    } else {
      orderBy.updatedAt = "desc"
    }

    // Get user's own selections + public selections
    const selections = await prisma.massSelection.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
        parts: true,
        _count: {
          select: { parts: true },
        },
      },
      orderBy,
      skip,
      take: limit,
    })

    const total = await prisma.massSelection.count({
      where: whereClause,
    })

    return NextResponse.json({
      selections,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching mass selections:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/mass-selections - Create new mass selection
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, date, templateType, liturgicalYear, season, themes, pastoralFocus, parts, isPublic } = body

    const selection = await prisma.massSelection.create({
      data: {
        title,
        date: new Date(date),
        templateType,
        liturgicalYear,
        season,
        themes,
        pastoralFocus,
        isPublic: isPublic || false,
        createdById: session.user.id,
        parts: {
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

    return NextResponse.json(selection, { status: 201 })
  } catch (error) {
    console.error("Error creating mass selection:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
