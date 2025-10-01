import { LiturgicalSeason, LiturgicalYear } from "@/types/models";
import { findAllSelections, saveSelection } from "@/db/mass-selections"

import { NextResponse } from "next/server"
import { SortBy } from "@/types/utils";
import { SortOrder } from '@/types/utils';
import { auth } from "@/auth"
import { getEnum } from '@/lib/utils';

// GET /api/mass-selections - Get paginated list of all mass selections
export const GET = auth(async (request) => {

  try {

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "9")
    const query = searchParams.get("query") || ""
    const season = getEnum(LiturgicalSeason, searchParams.get("season") || '')
    const sortBy = getEnum(SortBy, searchParams.get("sortBy") || "updatedAt")
    const sortOrder = getEnum(SortOrder, searchParams.get("sortOrder") || "desc")
    const year = getEnum(LiturgicalYear, searchParams.get("year") || '')

    const { selections, total
    } = await findAllSelections({ page, limit, query, season, sortBy, sortOrder, year })

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
})

// POST /api/mass-selections - Create new mass selection
export const POST = auth(async (request) => {
  try {
    if (!request.auth?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const selection = await saveSelection(body, request.auth.user.id)

    return NextResponse.json(selection, { status: 201 })
  } catch (error) {
    console.error("Error creating mass selection:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
