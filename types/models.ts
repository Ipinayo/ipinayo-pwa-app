import { Prisma } from "@/lib/generated/prisma";

export type GenerateMassSelection = Prisma.MassSelectionGetPayload<{
    include: {
        parts: true,
        createdBy: {
            select: { name: true, email: true },
        },
    },
}>