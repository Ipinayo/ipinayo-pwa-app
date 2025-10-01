import { LiturgicalSeason, LiturgicalYear } from "@/types/models"
import { SortBy, SortOrder } from "@/types/utils"

import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { findAllUserSelections } from "@/db/mass-selections"
import { getEnum } from "@/lib/utils"

// GET /api/mass-selections/user - Get paginated list of all user mass selections
export const GET = auth(async (request) => {

    try {

        if (!request.auth?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const page = Number.parseInt(searchParams.get("page") || "1")
        const limit = Number.parseInt(searchParams.get("limit") || "10")
        const query = searchParams.get("query") || ""
        const season = getEnum(LiturgicalSeason, searchParams.get("season") || '')
        const sortBy = getEnum(SortBy, searchParams.get("sortBy") || "updatedAt")
        const sortOrder = getEnum(SortOrder, searchParams.get("sortOrder") || "desc")
        const year = getEnum(LiturgicalYear, searchParams.get("year") || '')

        const { selections, total
        } = await findAllUserSelections({ page, limit, query, season, sortBy, sortOrder, year }, request.auth.user.id)

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