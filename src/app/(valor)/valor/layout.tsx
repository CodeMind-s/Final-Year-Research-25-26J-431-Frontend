import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Valor | BRINEX",
    description: "Valor application section",
};

export default function ValorLayout({
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

