import { NextRequest, NextResponse } from "next/server";
import { createServerApi } from "@/service/http/clientServer";

// Airtable API 설정
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || "";
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || "Table1";
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || "";

// Airtable API 클라이언트 생성
const airtableApi = createServerApi(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`,
    {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
    }
);

// GET 요청 - 레코드 조회
export async function GET(request: NextRequest) {
    try {
        console.log(
            "Airtable GET request",
            AIRTABLE_BASE_ID,
            AIRTABLE_TABLE_NAME,
            AIRTABLE_API_KEY
        );
        const searchParams = request.nextUrl.searchParams;
        const recordId = searchParams.get("recordId");
        const maxRecords = searchParams.get("maxRecords") || "10";

        let url = `${AIRTABLE_TABLE_NAME}?maxRecords=${maxRecords}`;

        // 특정 레코드 조회
        if (recordId) {
            url = `${AIRTABLE_TABLE_NAME}/${recordId}`;
        }

        const data = await airtableApi.get(url);

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Airtable GET error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

// POST 요청 - 레코드 생성
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fields } = body;

        if (!fields) {
            return NextResponse.json(
                { success: false, error: "Fields are required" },
                { status: 400 }
            );
        }

        const data = await airtableApi.post(AIRTABLE_TABLE_NAME, {
            fields,
        });

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Airtable POST error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

// PATCH 요청 - 레코드 업데이트
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { recordId, fields } = body;

        if (!recordId || !fields) {
            return NextResponse.json(
                {
                    success: false,
                    error: "recordId and fields are required",
                },
                { status: 400 }
            );
        }

        const data = await airtableApi.patch(
            `${AIRTABLE_TABLE_NAME}/${recordId}`,
            {
                fields,
            }
        );

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Airtable PATCH error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

// DELETE 요청 - 레코드 삭제
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        console.log("Airtable DELETE request", searchParams);
        const recordId = searchParams.get("recordId");

        if (!recordId) {
            return NextResponse.json(
                { success: false, error: "recordId is required" },
                { status: 400 }
            );
        }

        const data = await airtableApi.delete(
            `${AIRTABLE_TABLE_NAME}/${recordId}`
        );

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Airtable DELETE error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
