import { LiturgicalSeason, LiturgicalYear, NewLocation, UserRole } from "./models";

export type SearchParams = Promise<{ [key: string]: string | undefined }>;

export type Params = Promise<{ id: string }>;

export enum SortOrder {
    DESC = 'desc',
    ASC = 'asc'
}

export enum SortBy {
    UPDATED_AT = 'updatedAt',
    TITLE = 'title',
    DATE = 'date'
}

export enum SortUsersBy {
    CREATED_AT = 'createdAt',
    NAME = 'name',
    EMAIL = 'email'
}

export enum SortDraftsBy {
    UPDATED_AT = 'updatedAt',
    TITLE = 'title',
}

export enum NotificationChannel {
    IN_APP = 'inApp',
    EMAIL = 'email',
    PUSH = 'push'
}

export interface MassSelectionFilter {
    page?: number,
    limit?: number,
    query?: string,
    season?: LiturgicalSeason,
    year?: LiturgicalYear,
    sortBy?: SortBy,
    sortOrder?: SortOrder
    isPublic?: boolean
}

export interface UpdateUserProfile {
    name?: string | null;
    bio?: string | null;
    headline?: string | null;
    instruments?: string[] | null;
    vocalFach?: string | null;
    favoriteGenres?: string[] | null;
    parishName?: string | null;
    choirName?: string | null;
    parishLocation?: NewLocation | null;
}

export interface DraftSelectionFilter {
    page?: number,
    limit?: number,
    query?: string,
    sortBy?: SortDraftsBy,
    sortOrder?: SortOrder
}

export interface UsersFilter {
    page?: number,
    limit?: number,
    query?: string,
    userRole?: UserRole
    sortBy?: SortUsersBy,
    sortOrder?: SortOrder
}

export type ActivityEventMap = {
    "selection.created_by_self": {
        entityType: "selection";
        metadata: {
            title: string;
        };
    };

    "selection.cloned_by_self": {
        entityType: "selection";
        metadata: {
            title: string;
        };
    };

    "selection.cloned_by_other": {
        entityType: "selection";
        metadata: {
            title: string;
            actorName: string;
        };
    };

    "selection.updated_by_self": {
        entityType: "selection";
        metadata: {
            title: string;
        };
    };

    "selection.deleted_by_self": {
        entityType: "selection";
        metadata: {
            title: string;
        };
    };

    "selection.shared": {
        entityType: "selection";
        metadata: {
            title: string;
            role: string;
            actorName: string;
        };
    };

    "user.registered": {
        entityType: "user";
        metadata: {
            name: string;
        };
    };

    "user.updated": {
        entityType: "user";
        metadata: {};
    };

    "draft.created_by_self": {
        entityType: "draft";
        metadata: {};
    };

    "draft.updated_by_self": {
        entityType: "draft";
        metadata: {
            title: string;
        };
    };

    "draft.expiring": {
        entityType: "draft";
        metadata: {
            title: string;
        };
    };

    "draft.expired": {
        entityType: "draft";
        metadata: {
            title: string;
        };
    };

    "draft.deleted_by_self": {
        entityType: "draft";
        metadata: {
            title: string;
        };
    };

    "draft.shared": {
        entityType: "draft";
        metadata: {
            title: string;
            role: string;
            actorName: string;
        };
    };

    "draft.deleted_by_other": {
        entityType: "draft";
        metadata: {
            title: string;
            actorName: string;
            expired: boolean;
            reason?: string;
        };
    };

    "system.announcement": {
        entityType: "system";
        metadata: {
            title: string;
            message: string;
        };
    };

    "system.maintenance": {
        entityType: "system";
        metadata: {
            title: string;
            message: string;
        };
    };
}