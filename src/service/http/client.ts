import ky, { type KyInstance, type Options } from "ky";
import type { ApiClientConfig, ApiError } from "./types";

class ApiClient {
    private client: KyInstance;

    constructor(config: ApiClientConfig = {}) {
        const {
            baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
            timeout = 30000,
            retry = 2,
            headers = {},
        } = config;

        this.client = ky.create({
            prefixUrl: baseURL,
            timeout,
            retry: {
                limit: retry,
                methods: ["get", "put", "head", "delete", "options", "trace"],
                statusCodes: [408, 413, 429, 500, 502, 503, 504],
            },
            hooks: {
                beforeRequest: [
                    (request) => {
                        // 인증 토큰 추가
                        const token = this.getAuthToken();
                        if (token) {
                            request.headers.set(
                                "Authorization",
                                `Bearer ${token}`
                            );
                        }
                    },
                ],
                afterResponse: [
                    async (request, options, response) => {
                        // 에러 처리
                        if (!response.ok) {
                            let errorData: unknown;
                            try {
                                errorData = await response.json();
                            } catch {
                                errorData = await response.text();
                            }

                            const error: ApiError = {
                                message:
                                    (errorData as { message?: string })
                                        ?.message ||
                                    `Request failed with status ${response.status}`,
                                status: response.status,
                                data: errorData,
                            };

                            throw error;
                        }
                    },
                ],
            },
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
        });
    }

    private getAuthToken(): string | null {
        if (typeof window === "undefined") return null;
        return localStorage.getItem("authToken");
    }

    // GET 요청
    async get<T>(url: string, options?: Options): Promise<T> {
        // console.log("get", url, options);
        return this.client.get(url, options).json<T>();
    }

    // POST 요청
    async post<T>(url: string, data?: unknown, options?: Options): Promise<T> {
        return this.client.post(url, { json: data, ...options }).json<T>();
    }

    // PUT 요청
    async put<T>(url: string, data?: unknown, options?: Options): Promise<T> {
        return this.client.put(url, { json: data, ...options }).json<T>();
    }

    // DELETE 요청
    async delete<T>(url: string, options?: Options): Promise<T> {
        return this.client.delete(url, options).json<T>();
    }

    // PATCH 요청
    async patch<T>(url: string, data?: unknown, options?: Options): Promise<T> {
        return this.client.patch(url, { json: data, ...options }).json<T>();
    }

    // 원본 클라이언트 접근 (필요한 경우)
    get raw(): KyInstance {
        return this.client;
    }
}

// 싱글톤 인스턴스
export const apiClient = new ApiClient();

// 직접 사용할 수 있는 함수들
export const api = {
    get: <T>(url: string, options?: Options) => apiClient.get<T>(url, options),
    post: <T>(url: string, data?: unknown, options?: Options) =>
        apiClient.post<T>(url, data, options),
    put: <T>(url: string, data?: unknown, options?: Options) =>
        apiClient.put<T>(url, data, options),
    delete: <T>(url: string, options?: Options) =>
        apiClient.delete<T>(url, options),
    patch: <T>(url: string, data?: unknown, options?: Options) =>
        apiClient.patch<T>(url, data, options),
};
