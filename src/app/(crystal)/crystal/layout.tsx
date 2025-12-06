import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Crystal | BRINEX",
    description: "Crystal application section",
};

export default function CrystalLayout({
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

