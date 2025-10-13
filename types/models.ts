import { Prisma } from "@/lib/generated/prisma";

export type GenerateMassSelection = Prisma.MassSelectionGetPayload<{
    include: {
        themes: true
        parts: true,
        createdBy: {
            select: { name: true, email: true },
        },
    },
}>

export type SingleMassSelection = Prisma.MassSelectionGetPayload<{}>

export type MassSelectionWithParts = Prisma.MassSelectionGetPayload<{
    include: {
        themes: true
        parts: true
    }
}>

export type MassPart = Prisma.MassPartGetPayload<{}>;

export type NewMassSelectionPart = Omit<MassPart, 'massSelectionId'>

export type NewMassSelection = Omit<SingleMassSelection, 'id' | 'createdAt' | 'updatedAt' | 'createdById' | 'themes'> & {
    themes: string[]
    parts: NewMassSelectionPart[]
}

export type MassSelection = Prisma.MassSelectionGetPayload<{
    include: {
        themes: true,
        createdBy: {
            select: { name: true, email: true },
        },
        _count: {
            select: { parts: true },
        },
    },
}>

export interface MassSelectionStats {
    total: number
    public: number
    private: number
    thisMonth: number
    thisWeek: number
}

export { KeySignature, LiturgicalSeason, LiturgicalYear } from "@/lib/generated/prisma"