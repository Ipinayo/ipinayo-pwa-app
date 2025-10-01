import { MassSelection } from "../models";

export interface SelectionsResponse {
    selections: MassSelection[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface ShareResponse {
    shareableLink: string;
    pdfLink: string;
    message: string;
}