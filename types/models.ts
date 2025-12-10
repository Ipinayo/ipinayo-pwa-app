import { KeySignature, LiturgicalSeason, LiturgicalYear, Prisma } from "@/lib/generated/prisma";

export type GenerateMassSelection = Prisma.MassSelectionGetPayload<{
    include: {
        themes: true
        parts: true
        parishLocation: true
        createdBy: {
            select: { name: true, email: true },
        },
    },
}>

export type SingleMassSelection = Prisma.MassSelectionGetPayload<{}>

export type SingleMassSelectionWithParts = Prisma.MassSelectionGetPayload<{
    include: { themes: { select: { id: true } }, parts: true }
}>

export type MassSelectionWithParts = Prisma.MassSelectionGetPayload<{
    include: {
        themes: true
        parts: true
        parishLocation: true
    }
}>

export type MassPart = Prisma.MassPartGetPayload<{}>;

export type NewMassSelectionPart = Omit<Prisma.MassPartCreateInput, 'id' | 'massSelection' | 'order'> & {
    id: string
    order: number
};

export type NewLocation = Omit<Prisma.LocationCreateInput, 'id' | 'massSelections' | 'userProfiles' | 'createdAt' | 'updatedAt' | 'country'> & {
    id?: string
    country?: string
};

export type NewMassSelection = Omit<Prisma.MassSelectionCreateInput, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'themes' | 'parishLocation' | 'date'> & {
    date: Date
    themes: string[]
    parts: NewMassSelectionPart[]
    parishLocation?: NewLocation | null
};

export type MassSelection = Prisma.MassSelectionGetPayload<{
    include: {
        themes: true,
        parishLocation: true,
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
    totalDrafts: number
}

export type Location = Prisma.LocationGetPayload<{}>;

export type UserProfile = Prisma.UserProfileGetPayload<{
    include: {
        user: {
            select: {
                name: true;
                email: true;
                image: true;
            }
        },
        parishLocation: true
    }
}>;

export type AppUser = Prisma.UserGetPayload<{
    select: {
        name: true,
        email: true,
        image: true,
        profile: {
            select: {
                id: true,
                headline: true
            }
        }
    }
}>;

export type MassSelectionDraft = Prisma.MassSelectionDraftGetPayload<{}>;

export { KeySignature, LiturgicalSeason, LiturgicalYear }