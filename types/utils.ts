export type SearchParams = Promise<{ [key: string]: string | undefined }>;

export interface MassSelectionFilter { page?: number, limit?: number, query?: string, season?: string, year?: string, sortBy?: string, sortOrder?: string }
