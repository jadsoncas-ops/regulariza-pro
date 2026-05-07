import { AppLayout } from "@/components/layout/AppLayout";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { KpiGrid } from "@/components/dashboard/KpiGrid";
import { PipelinePreview } from "@/components/dashboard/PipelinePreview";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { MovementsTable } from "@/components/dashboard/MovementsTable";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";

const Index = () => {
  return (
    <AppLayout title="Dashboard" subtitle="Visão geral do seu negócio em tempo real">
      <HeroSection />
      <KpiGrid />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2"><RevenueChart /></div>
        <div><AlertsPanel /></div>
      </div>
      <PipelinePreview />
      <MovementsTable />
    </AppLayout>
  );
};

export default Index;
