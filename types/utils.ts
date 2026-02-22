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
    "selection.created": {
        entityType: "selection";
        metadata: {
            title: string;
        };
    };

    "selection.cloned": {
        entityType: "selection";
        metadata: {
            title: string;
            clonedByName: string;
        };
    };

    "selection.updated": {
        entityType: "selection";
        metadata: {
            title: string;
        };
    };

    "selection.deleted": {
        entityType: "selection";
        metadata: {
            title: string;
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
        metadata: {
            name: string;
        };
    };

    "draft.created": {
        entityType: "draft";
        metadata: {};
    };

    "draft.updated": {
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

    "draft.deleted": {
        entityType: "draft";
        metadata: {
            title: string;
        };
    };

    "system.announcement": {
        entityType: "system";
        metadata: {
            title: string;
            message: string;
        };
    };
}