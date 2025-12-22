import { DashboardLayout } from "@/components/crystal/dashboard-layout";
import { ProductionDashboard } from "@/components/crystal/production-dashboard";

export default function Page() {
  return (
    <DashboardLayout>
      <ProductionDashboard />
    </DashboardLayout>
  );
}
