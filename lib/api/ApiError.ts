export class ApiError extends Error {
  message: string;
  status: number | undefined;
  details?: any;

  constructor(status: number | undefined, details: any, message?: string) {
    super(message || 'An unknown error occurred');
    this.name = 'ApiError';
    this.message = message || 'An unknown error occurred';
    this.status = status;
    this.details = details;
  }
}
