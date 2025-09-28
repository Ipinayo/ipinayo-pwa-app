import { Prisma } from "@/lib/generated/prisma";

export type GenerateMassSelection = Prisma.MassSelectionGetPayload<{
    include: {
        parts: true,
        createdBy: {
            select: { name: true, email: true },
        },
    },
}>

export type MassSelection = Prisma.MassSelectionGetPayload<{}>

export type MassSelectionWithParts = Prisma.MassSelectionGetPayload<{
    include: {
        parts: true
    }
}>

export type NewMassSelectionPart = Omit<MassPart, 'massSelectionId'>

export type NewMassSelection = Omit<MassSelection, 'id' | 'createdAt' | 'updatedAt' | 'createdById'> & {
    parts: NewMassSelectionPart[]
}

export type MassPart = Prisma.MassPartGetPayload<{}>;
