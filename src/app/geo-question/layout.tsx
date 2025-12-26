import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "GCOO-GQ",
    description: "GCOO-GQ",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
