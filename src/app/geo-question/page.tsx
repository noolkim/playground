"use client";
// import { useEffect, useState } from "react";
// import Image from "next/image";
import "@/styles/geo_question.scss";
import { useApiQuery, useApiMutation } from "@/service/query/hooks";
import { useQueryClient } from "@tanstack/react-query";
import NaverMap from "@/features/map/components/NaverMap";

interface AirtableRecord {
    id: string;
    fields: Record<string, unknown>;
    createdTime?: string;
}

interface AirtableResponse {
    success: boolean;
    data: {
        records: AirtableRecord[];
    };
}
interface CreateRecordResponse {
    success: boolean;
    data: AirtableRecord;
}

interface DeleteResponse {
    success: boolean;
    data: {
        deleted: boolean;
        id: string;
    };
}

export default function Home() {
    const queryClient = useQueryClient();
    const { data, isLoading, error } = useApiQuery<AirtableResponse>(
        ["airtable", "records"],
        "airtable?maxRecords=10"
    ); // 최대 10개 레코드 가져오기

    // console.log("::airtable data::", data);

    // POST 예제 - 레코드 생성
    const createMutation = useApiMutation<
        CreateRecordResponse,
        { fields: Record<string, unknown> }
    >("airtable", "post", {
        onSuccess: (response) => {
            console.log("레코드 생성 성공:", response);
            // 성공 시 목록 새로고침 (자동으로 invalidateQueries가 호출됨)
        },
        onError: (error) => {
            console.error("레코드 생성 실패:", error);
        },
    });

    // POST 요청 실행 예제
    const handleCreateRecord = () => {
        createMutation.mutate({
            fields: {
                Question: "api post test",
                Answer: '{"lat": 33.3623779, "lng": 126.533345 }',
                Tags: ["nature"],
                success_message: "api post test success",
                // Airtable 테이블의 필드에 맞게 수정하세요
            },
        });
    };

    // DELETE Mutation
    const deleteMutation = useApiMutation<
        DeleteResponse,
        { pathParamsUrl: string }
    >("airtable", "delete", {
        onSuccess: (response) => {
            console.log("레코드 삭제 성공:", response);
            // 목록 새로고침
            queryClient.invalidateQueries({
                queryKey: ["airtable", "records"],
            });
        },
        onError: (error) => {
            console.error("레코드 삭제 실패:", error);
        },
    });

    // 가장 마지막에 업데이트된 레코드 삭제
    const handleDeleteLastUpdated = () => {
        if (!data?.data?.records || data.data.records.length <= 5) {
            console.error("삭제할 레코드가 없습니다");
            return;
        }

        const records = data?.data?.records;

        // createdTime 기준으로 정렬 (가장 최근 것이 마지막)
        const sortedRecords = [...records].sort((a, b) => {
            const timeA = a.createdTime ? new Date(a.createdTime).getTime() : 0;
            const timeB = b.createdTime ? new Date(b.createdTime).getTime() : 0;
            return timeB - timeA; // 내림차순 (최신이 앞)
        });

        // 가장 최근 레코드 (첫 번째)
        const lastUpdatedRecord = sortedRecords[0];

        if (!lastUpdatedRecord) {
            console.error("레코드를 찾을 수 없습니다");
            return;
        }

        console.log("삭제할 레코드:", lastUpdatedRecord);

        // 삭제 실행
        deleteMutation.mutate({
            pathParamsUrl: `airtable?recordId=${lastUpdatedRecord.id}`,
        });
    };

    return (
        <main>
            <NaverMap />
            <div className="floatingWraps--container">
                <div className="title--wrap">
                    <div className="title--wrap__left">
                        <div className="question">Q</div>
                    </div>
                    <div className="title--wrap__center">
                        <h1 className="pinch-logo">
                            Pinch to <span>Find</span>
                        </h1>
                    </div>
                    <div className="title--wrap__right">
                        <div>더보기</div>
                    </div>
                </div>
                <div className="question--wrap">
                    <div className="question--wrap__title">
                        <h1>Geo Question</h1>
                    </div>
                </div>
            </div>

            <div>
                {/* POST 예제 버튼 */}
                <button
                    onClick={handleCreateRecord}
                    disabled={createMutation.isPending}
                    style={{
                        padding: "10px 20px",
                        marginTop: "20px",
                        cursor: createMutation.isPending
                            ? "not-allowed"
                            : "pointer",
                    }}
                >
                    {createMutation.isPending ? "생성 중..." : "레코드 생성"}
                </button>
                {createMutation.isError && (
                    <div style={{ color: "red", marginTop: "10px" }}>
                        에러: {createMutation.error?.message}
                    </div>
                )}
                {createMutation.isSuccess && (
                    <div
                        style={{
                            color: "green",
                            marginTop: "10px",
                        }}
                    >
                        생성 성공!
                    </div>
                )}
                <div>
                    {/* DELETE 예제 버튼 - 가장 최근 레코드 삭제 */}
                    <button
                        onClick={handleDeleteLastUpdated}
                        disabled={
                            deleteMutation.isPending ||
                            !data?.data?.records?.length
                        }
                        style={{
                            padding: "10px 20px",
                            marginTop: "20px",
                            cursor:
                                deleteMutation.isPending ||
                                !data?.data?.records?.length
                                    ? "not-allowed"
                                    : "pointer",
                        }}
                    >
                        {deleteMutation.isPending
                            ? "삭제 중..."
                            : "가장 최근 레코드 삭제"}
                    </button>
                </div>
            </div>
        </main>
    );
}
