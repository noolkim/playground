export interface ApiClientConfig {
    baseURL?: string;
    timeout?: number;
    retry?: number;
    headers?: Record<string, string>;
}

export interface ApiError {
    message: string;
    status?: number;
    data?: unknown;
}

