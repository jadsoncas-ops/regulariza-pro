import { AppLayout } from "@/components/layout/AppLayout";
import { KpiGrid } from "@/components/dashboard/KpiGrid";
import { PipelinePreview } from "@/components/dashboard/PipelinePreview";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { MovementsTable } from "@/components/dashboard/MovementsTable";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { Calendar, Download } from "lucide-react";

const Index = () => {
  return (
    <AppLayout
      title="Dashboard"
      subtitle="Visão geral do seu negócio em tempo real"
    >
      <div className="flex flex-col gap-8">
        
        {/* Page Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border p-3 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg text-sm font-medium text-foreground border border-border/50">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>Últimos 30 dias</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted smooth-transition shadow-sm">
              <Download className="w-4 h-4 text-muted-foreground" />
              Exportar Relatório
            </button>
          </div>
        </div>

        <KpiGrid />
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <RevenueChart />
          </div>
          <div>
            <AlertsPanel />
          </div>
        </div>

        <PipelinePreview />
        <MovementsTable />
      </div>
    </AppLayout>
  );
};

export default Index;
