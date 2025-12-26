import type { Metadata } from "next";
import "@/styles/globals.css";
import { QueryProvider } from "@/service/query/provider";

export const metadata: Metadata = {
    title: "GCOO-SS",
    description: "GCOO-SS",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <body>
                <QueryProvider>{children}</QueryProvider>
            </body>
        </html>
    );
}
