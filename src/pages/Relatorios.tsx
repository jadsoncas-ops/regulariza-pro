import { AppLayout } from "@/components/layout/AppLayout";

export default function Relatorios() {
  return (
    <AppLayout title="Relatórios" subtitle="Métricas e análises avançadas">
      <div className="flex items-center justify-center h-64 rounded-xl border border-dashed border-border bg-muted/20">
        <p className="text-muted-foreground text-sm">Dashboard de relatórios em breve.</p>
      </div>
    </AppLayout>
  );
}
