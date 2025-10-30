import { SelectionsResponse, ShareResponse } from "@/types/schemas/mass-selections";

import { MassSelection } from "@/types/models";
import { MassSelectionFilter } from "@/types/utils";
import { apiClient } from "./ApiClient";

const SELECTION_TAGS = ['mass-selections'];

// Get all mass selections
export const getAllSelections = async (params: MassSelectionFilter = {}): Promise<SelectionsResponse> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.query) queryParams.append('query', params.query);
    if (params.season) queryParams.append('season', params.season);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.year) queryParams.append('year', params.year);

    return apiClient.get(`/api/mass-selections?${queryParams}`, SELECTION_TAGS);
};

// Get user's mass selections
export const getUserSelections = async (params: MassSelectionFilter = {}): Promise<SelectionsResponse> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.query) queryParams.append('query', params.query);
    if (params.season) queryParams.append('season', params.season);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.year) queryParams.append('year', params.year);

    return apiClient.get(`/api/mass-selections/user?${queryParams}`, SELECTION_TAGS);
};

// Get single mass selection
export const getSelectionById = async (id: string): Promise<MassSelection> => {
    return apiClient.get(`/api/mass-selections/${id}`, [...SELECTION_TAGS, `mass-selection-${id}`]);
};

// Create new mass selection
export const createSelection = async (data: Partial<MassSelection>): Promise<MassSelection> => {
    return apiClient.post('/api/mass-selections', data);
};

// Update mass selection
export const updateSelection = async (id: string, data: Partial<MassSelection>): Promise<MassSelection> => {
    return apiClient.put(`/api/mass-selections/${id}`, data);
};

// Delete mass selection
export const deleteSelection = async (id: string): Promise<void> => {
    return apiClient.delete(`/api/mass-selections/${id}`);
};

// Clone mass selection
export const cloneSelection = async (id: string): Promise<MassSelection> => {
    return apiClient.post(`/api/mass-selections/${id}/clone`);
};

// Share mass selection
export const shareSelection = async (id: string): Promise<ShareResponse> => {
    return apiClient.post(`/api/mass-selections/${id}/share`);
};

// Get PDF version
export const getSelectionPdf = async (id: string): Promise<Blob> => {
    return apiClient.request<Blob>(`/api/mass-selections/${id}/pdf`, {
        headers: {
            'Accept': 'application/pdf,application/octet-stream',
        },
    });
};