import React from 'react';

export default function DistributorDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <section className="min-h-screen w-full">
            {children}
        </section>
    );
}
