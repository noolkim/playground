import ky, { type KyInstance, type Options } from 'ky';
import type { ApiClientConfig, ApiError } from './types';
import { cookies, headers } from 'next/headers';

class ApiClientServer {
    private client: KyInstance;

    constructor(config: ApiClientConfig = {}) {
        const {
            baseURL,
            timeout = 30000,
            retry = 2,
            headers: customHeaders = {},
        } = config;

        this.client = ky.create({
            prefixUrl: baseURL,
            timeout,
            retry: {
                limit: retry,
                methods: ['get', 'put', 'head', 'delete', 'options', 'trace'],
                statusCodes: [408, 413, 429, 500, 502, 503, 504],
            },
            hooks: {
                beforeRequest: [
                    async (request) => {
                        // 서버 사이드에서 인증 토큰 추가
                        const token = await this.getAuthToken();
                        if (token) {
                            request.headers.set('Authorization', `Bearer ${token}`);
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
                                    (errorData as { message?: string })?.message ||
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
                'Content-Type': 'application/json',
                ...customHeaders,
            },
        });
    }

    private async getAuthToken(): Promise<string | null> {
        try {
            // 쿠키에서 토큰 가져오기
            const cookieStore = await cookies();
            const token = cookieStore.get('authToken')?.value;
            if (token) return token;

            // 헤더에서 토큰 가져오기
            const headersList = await headers();
            const authHeader = headersList.get('authorization');
            if (authHeader?.startsWith('Bearer ')) {
                return authHeader.substring(7);
            }

            return null;
        } catch {
            return null;
        }
    }

    // GET 요청
    async get<T>(url: string, options?: Options): Promise<T> {
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

// 서버 사이드용 API 함수들
export function createServerApi(baseURL: string, headers?: Record<string, string>) {
    const client = new ApiClientServer({
        baseURL,
        headers,
    });

    return {
        get: <T>(url: string, options?: Options) => client.get<T>(url, options),
        post: <T>(url: string, data?: unknown, options?: Options) =>
            client.post<T>(url, data, options),
        put: <T>(url: string, data?: unknown, options?: Options) =>
            client.put<T>(url, data, options),
        delete: <T>(url: string, options?: Options) => client.delete<T>(url, options),
        patch: <T>(url: string, data?: unknown, options?: Options) =>
            client.patch<T>(url, data, options),
        raw: client.raw,
    };
}

