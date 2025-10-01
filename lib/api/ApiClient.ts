import { ApiError } from "./ApiError";

// Define base API configuration
interface ApiConfig {
    baseURL: string;
    timeout: number;
    headers: Record<string, string>;
}

interface RequestConfig extends RequestInit {
    timeout?: number;
}

class ApiClient {
    private static instance: ApiClient;
    private readonly config: ApiConfig;

    private constructor() {
        this.config = {
            baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
            timeout: 30000, // Default timeout of 30 seconds
            headers: {},
        };
    }

    public static getInstance(): ApiClient {
        if (!ApiClient.instance) {
            ApiClient.instance = new ApiClient();
        }
        return ApiClient.instance;
    }

    /**
     * Create fetch request with timeout support
     */
    private async fetchWithTimeout(
        url: string,
        options: RequestInit,
        timeout: number = this.config.timeout
    ): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    /**
     * Main request method
     */
    public async request<T>(
        endpoint: string,
        config: RequestConfig = {}
    ): Promise<T> {
        const {
            timeout,
            headers: customHeaders,
            ...fetchOptions
        } = config;

        // Build URL
        const url = `${this.config.baseURL}${endpoint}`;

        // Build headers
        const headers = new Headers(this.config.headers);

        // Add custom headers safely
        if (customHeaders) {
            if (customHeaders instanceof Headers) {
                customHeaders.forEach((value, key) => headers.set(key, value));
            } else if (typeof customHeaders === 'object' && !Array.isArray(customHeaders)) {
                Object.entries(customHeaders).forEach(([key, value]) => {
                    if (value != null) {
                        headers.set(key, String(value));
                    }
                });
            }
        }

        try {
            const response = await this.fetchWithTimeout(url, {
                ...fetchOptions,
                headers,
            }, timeout);

            // Handle different response types
            let responseData: any;
            const contentType = response.headers.get('content-type');

            try {
                if (contentType?.includes('application/json')) {
                    responseData = await response.json();
                } else if (contentType?.includes('text/')) {
                    responseData = await response.text();
                } else {
                    responseData = await response.blob();
                }
            } catch (err) {
                responseData = response.body
            }

            if (!response.ok) {
                const message = response.status === 500
                    ? 'Server error, please try again later'
                    : this.getErrorMessage(responseData);

                throw new ApiError(response.status, responseData, message);
            }

            return responseData;
        } catch (error) {
            console.log(error)
            if (error instanceof ApiError) {
                throw error;
            }

            // Handle network errors
            throw new ApiError(undefined, error, 'Unable to complete request, please check your internet connection');
        }
    }

    // Convenience methods for common HTTP methods
    public async get<T>(
        endpoint: string,
        tags: string[] = [],
        config: Omit<RequestConfig, 'method' | 'body' | 'next'> = {}
    ): Promise<T> {
        return this.request(endpoint, { ...config, next: { tags }, method: 'GET' });
    }

    public async post<T>(
        endpoint: string,
        data?: unknown,
        config: Omit<RequestConfig, 'method' | 'body'> = {}
    ): Promise<T> {
        return this.request(endpoint, {
            ...config,
            method: 'POST',
            body: JSON.stringify(data ?? {}),
        });
    }

    public async patch<T>(
        endpoint: string,
        data?: unknown,
        config: Omit<RequestConfig, 'method' | 'body'> = {}
    ): Promise<T> {
        return this.request(endpoint, {
            ...config,
            method: 'PATCH',
            body: JSON.stringify(data ?? {}),
        });
    }

    public async put<T>(
        endpoint: string,
        data?: unknown,
        config: Omit<RequestConfig, 'method' | 'body'> = {}
    ): Promise<T> {
        return this.request(endpoint, {
            ...config,
            method: 'PUT',
            body: JSON.stringify(data ?? {}),
        });
    }

    public async delete<T>(
        endpoint: string,
        config: Omit<RequestConfig, 'method' | 'body'> = {}
    ): Promise<T> {
        return this.request(endpoint, { ...config, method: 'DELETE' });
    }

    /**
     * Extract error message from error data
     */
    private getErrorMessage(errorData: any): string {
        console.log(errorData)
        if (errorData?.data) {
            return this.getMessageFromData(errorData.data);
        }
        if (errorData?.error) {
            return this.getMessageFromData(errorData.error);
        }

        return this.getMessageFromData(errorData);
    }

    /**
     * Extract message from various data types
     */
    private getMessageFromData(data: any): string {
        if (typeof data === 'string') {
            return data;
        }

        if (Array.isArray(data)) {
            return data
                .map(item => this.getMessageFromData(item))
                .filter(Boolean)
                .join(' ');
        }

        if (data && typeof data === 'object') {
            const messages = Object.values(data)
                .map(value => this.getMessageFromData(value))
                .filter(Boolean);
            return messages.join(' ');
        }

        return 'An unknown error occurred';
    }

}

// Export singleton instance
export const apiClient = ApiClient.getInstance();

// Export class for testing or advanced usage
export { ApiClient };