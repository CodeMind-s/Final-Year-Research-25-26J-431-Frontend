import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Vision | BRINEX",
    description: "Vision application section",
};

export default function VisionLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen">
            {children}
        </div>
    );
}

