import { AppLayout } from "@/components/layout/AppLayout";
import { KpiGrid } from "@/components/dashboard/KpiGrid";
import { PipelinePreview } from "@/components/dashboard/PipelinePreview";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { MovementsTable } from "@/components/dashboard/MovementsTable";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";

const Index = () => {
  return (
    <AppLayout
      title="Painel Central — Regularização Imobiliária"
      subtitle="EMP.GRID-001 / NOV·2026"
    >
      <KpiGrid />
      <PipelinePreview />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RevenueChart />
        <AlertsPanel />
      </div>
      <MovementsTable />
      <footer className="pt-6 border-t border-border flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        <span>ENGARQ.GESTÃO · v0.1 · MVP visual</span>
        <span>VIEW: DASHBOARD · LAT -23.5505 / LON -46.6333</span>
      </footer>
    </AppLayout>
  );
};

export default Index;
