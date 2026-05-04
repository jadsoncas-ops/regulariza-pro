import { AppLayout } from "@/components/layout/AppLayout";

export default function Tarefas() {
  return (
    <AppLayout title="Tarefas" subtitle="Gestão de atividades e demandas">
      <div className="flex items-center justify-center h-64 rounded-xl border border-dashed border-border bg-muted/20">
        <p className="text-muted-foreground text-sm">Quadro Kanban de tarefas em breve.</p>
      </div>
    </AppLayout>
  );
}
