import { LiturgicalSeason, LiturgicalYear, NewLocation } from "./models";

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

export interface MassSelectionFilter {
    page?: number,
    limit?: number,
    query?: string,
    season?: LiturgicalSeason,
    year?: LiturgicalYear,
    sortBy?: SortBy,
    sortOrder?: SortOrder
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
}