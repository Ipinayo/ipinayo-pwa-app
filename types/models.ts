import type { Prisma } from "@/lib/generated/prisma/browser";

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

export type NewMassSelection = Omit<Prisma.MassSelectionCreateInput, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'group' | 'groupId' | 'isFeatured' | 'themes' | 'parishLocation' | 'date'> & {
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
            select: { name: true, email: true, userRole: true },
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
                userRole: true;
                createdAt: true;
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
        userRole: true,
        profile: {
            select: {
                id: true,
                headline: true
            }
        }
    }
}>;

export type User = Prisma.UserGetPayload<{
    include: {
        _count: {
            select: {
                selections: true,
                massSelectionDrafts: true
            },
        },
    },
}>;

export type UserLite = Prisma.UserGetPayload<{
    select: {
        id: true,
        name: true,
        email: true,
        image: true
    }
}>;

export type MassSelectionDraft = Prisma.MassSelectionDraftGetPayload<{}>;

export type AdminMassSelectionDraft = Prisma.MassSelectionDraftGetPayload<{
    include: {
        createdBy: {
            select: {
                id: true,
                name: true,
                email: true,
            }
        }
    },
}>;

export interface AdminDashboardStats {
    totalSelections: number
    newSelectionsThisWeek: number
    totalDrafts: number
    newDraftsThisWeek: number
    totalUsers: number
    newUsersThisWeek: number
    notificationsSent: number
}

export interface UsersStats {
    totalUsers: number
    totalAdmins: number
    newUsersThisWeek: number
    newUsersThisMonth: number
}

export interface SelectionsStats {
    totalSelections: number
    totalPublicSelections: number
    totalPrivateSelections: number
    newSelectionsThisMonth: number
    newSelectionsThisWeek: number
}

export interface DraftStats {
    totalDrafts: number
    newDraftsThisMonth: number,
    newDraftsThisWeek: number,

    oldDrafts: number
}

export type ActivityRecipientInput = {
    userId: string;
    entityId?: string | null;
    metadata?: Prisma.InputJsonValue;
};

export type CreateActivity = {
    actorId: string;
    event: string;
    entityType: string;
    entityId: string;
    metadata: Prisma.InputJsonValue;
    recipients: ActivityRecipientInput[];
};

export type UserActivity = Prisma.ActivityGetPayload<{}>;

export type Activity = Prisma.ActivityGetPayload<{
    include: {
        actor: {
            select: {
                id: true,
                name: true,
                email: true,
            }
        },
        recipients: {
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        }
    }
}>;

export type UserNotification = Prisma.NotificationGetPayload<{}>;

export type CreateNotification = Omit<Prisma.NotificationCreateInput, 'activity' | 'user' | 'id' | 'createdAt'> & {
    activityId: string;
    userId: string;
};

export type Notification = Prisma.NotificationGetPayload<{
    include: {
        activity: {
            include: {
                actor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        }
    }
}>;

export type Announcement = Prisma.AnnouncementGetPayload<{
    include: {
        createdBy: {
            select: { id: true; name: true; email: true }
        }
    }
}>;

export type AttachableGroup = { id: string; name: string; memberCount: number };

export type GroupContext = {
    /** The entity's current group. `name === null` means ad-hoc (direct sharing). */
    group: { id: string; name: string | null };
    attachableGroups: AttachableGroup[];
};

export type Json = Prisma.JsonValue;

export { KeySignature, LiturgicalSeason, LiturgicalYear, UserRole, NotificationStatus, CollaboratorRole } from "@/lib/generated/prisma/enums";