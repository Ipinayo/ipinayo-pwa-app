import { LiturgicalSeason, LiturgicalYear } from "./models";

export type SearchParams = Promise<{ [key: string]: string | undefined }>;

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
