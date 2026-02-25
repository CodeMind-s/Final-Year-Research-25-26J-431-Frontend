import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BrineX Admin - Dashboard",
  description: "Administration panel for BrineX platform management",
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
