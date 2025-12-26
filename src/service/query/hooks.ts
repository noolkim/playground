import {
    useQuery,
    useMutation,
    useQueryClient,
    type UseQueryOptions,
    type UseMutationOptions,
} from "@tanstack/react-query";
import { api } from "../http/client";

// 커스텀 useQuery 훅
export function useApiQuery<TData = unknown, TError = Error>(
    key: string[],
    url: string,
    options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">
) {
    // console.log("useApiQuery", key, url);
    return useQuery<TData, TError>({
        queryKey: key,
        queryFn: () => api.get<TData>(url),
        ...options,
    });
}

// 커스텀 useMutation 훅
export function useApiMutation<
    TData = unknown,
    TVariables = unknown,
    TError = Error
>(
    url: string,
    method: "post" | "put" | "patch" | "delete" = "post",
    options?: Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn">
) {
    const queryClient = useQueryClient();

    return useMutation<TData, TError, TVariables>({
        mutationFn: (data: TVariables) => {
            switch (method) {
                case "post":
                    return api.post<TData>(url, data);
                case "put":
                    return api.put<TData>(url, data);
                case "patch":
                    return api.patch<TData>(url, data);
                case "delete":
                    if (
                        data &&
                        typeof data === "object" &&
                        "pathParamsUrl" in data
                    ) {
                        return api.delete<TData>(data.pathParamsUrl as string);
                    }
                    return api.delete<TData>(url);
                default:
                    return api.post<TData>(url, data);
            }
        },
        onSuccess: () => {
            // 성공 시 관련 쿼리 무효화
            queryClient.invalidateQueries();
        },
        ...options,
    });
}
