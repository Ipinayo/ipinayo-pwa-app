import { Prisma } from "@/lib/generated/prisma";

export type GenerateMassSelection = Prisma.MassSelectionGetPayload<{
    include: {
        parts: true,
        createdBy: {
            select: { name: true, email: true },
        },
    },
}>

type RawMassSelection = Prisma.MassSelectionGetPayload<{}>

export type MassSelectionWithParts = Prisma.MassSelectionGetPayload<{
    include: {
        parts: true
    }
}>

export type MassPart = Prisma.MassPartGetPayload<{}>;

export type NewMassSelectionPart = Omit<MassPart, 'massSelectionId'>

export type NewMassSelection = Omit<RawMassSelection, 'id' | 'createdAt' | 'updatedAt' | 'createdById'> & {
    parts: NewMassSelectionPart[]
}

export type MassSelection = Prisma.MassSelectionGetPayload<{
    include: {
        createdBy: {
            select: { name: true, email: true },
        },
        _count: {
            select: { parts: true },
        },
    },
}>