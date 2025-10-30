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
    name?: string
    bio?: string;
    headline?: string;
    instruments?: string[];
    vocalFach?: string;
    favoriteGenres?: string[];
    parishName?: string;
    choirName?: string;
    parishLocation?: NewLocation
}
