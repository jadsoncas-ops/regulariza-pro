import { AppLayout } from "@/components/layout/AppLayout";
import { SectionHeader } from "@/components/dashboard/KpiGrid";
import { PageToolbar, FilterChip, PrimaryAction, StatusBadge } from "@/components/shared/PageToolbar";
import { documentos } from "@/data/mock";
import { FileText, Upload, Check, AlertTriangle } from "lucide-react";

const checklist = [
  { item: "Matrícula atualizada", ok: true },
  { item: "IPTU do exercício", ok: true },
  { item: "Escritura / Contrato", ok: true },
  { item: "Planta baixa assinada", ok: true },
  { item: "Memorial descritivo", ok: false },
  { item: "ART de execução", ok: false },
  { item: "Habite-se anterior", ok: false },
];

const toneByStatus: Record<string, any> = {
  OK: "ok",
  Pendente: "alert",
  Revisar: "warn",
};

export default function Documentos() {
  const okCount = checklist.filter((c) => c.ok).length;
  return (
    <AppLayout title="Central de Documentos" subtitle="MOD.DOC / 05">
      <PageToolbar
        filters={
          <>
            <FilterChip label="PROCESSO" value="*" active />
            <FilterChip label="TIPO" value="TODOS" />
            <FilterChip label="STATUS" value="ATIVOS" />
          </>
        }
        action={<PrimaryAction>+ Upload Documento</PrimaryAction>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <SectionHeader title="Documentos Recentes" code="DOC.001" />
          <div className="bg-surface border border-border shadow-block-sm">
            <div className="grid grid-cols-12 gap-4 p-3 border-b border-border text-[10px] text-muted-foreground font-bold uppercase tracking-widest font-display bg-surface-mid/40">
              <div className="col-span-1">ID</div>
              <div className="col-span-4">Arquivo</div>
              <div className="col-span-2">Tipo</div>
              <div className="col-span-2">Processo</div>
              <div className="col-span-1">v</div>
              <div className="col-span-2 text-right">Status</div>
            </div>
            {documentos.map((d) => (
              <div
                key={d.id}
                className="grid grid-cols-12 gap-4 p-4 border-b border-border last:border-b-0 text-sm items-center hover:bg-background cursor-pointer"
              >
                <div className="col-span-1 font-mono text-xs text-muted-foreground">{d.id}</div>
                <div className="col-span-4 flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <div className="font-medium truncate">{d.nome}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {d.tamanho} · {d.atualizado}
                    </div>
                  </div>
                </div>
                <div className="col-span-2 text-xs text-muted-foreground">{d.tipo}</div>
                <div className="col-span-2 font-mono text-xs">{d.processoRef}</div>
                <div className="col-span-1 font-mono text-xs">{d.versao}</div>
                <div className="col-span-2 text-right">
                  <StatusBadge label={d.status} tone={toneByStatus[d.status]} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside>
          <SectionHeader title="Checklist Inteligente" code="DOC.002" />
          <div className="bg-surface border border-border p-5 shadow-block-sm">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Habite-se Residencial · PRC-9105
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <div className="font-display text-3xl tabular-nums tracking-tighter">
                {okCount}<span className="text-muted-foreground">/{checklist.length}</span>
              </div>
              <div className="text-[10px] font-mono text-muted-foreground">
                {Math.round((okCount / checklist.length) * 100)}% completo
              </div>
            </div>
            <div className="mt-3 h-1.5 bg-surface-mid">
              <div
                className="h-full bg-primary"
                style={{ width: `${(okCount / checklist.length) * 100}%` }}
              />
            </div>

            <ul className="mt-5 flex flex-col">
              {checklist.map((c) => (
                <li
                  key={c.item}
                  className="flex items-center gap-3 py-2 border-b border-border last:border-b-0 text-sm"
                >
                  <span
                    className={`size-5 border flex items-center justify-center ${
                      c.ok
                        ? "bg-success/15 border-success text-success"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {c.ok ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                  </span>
                  <span className={c.ok ? "line-through text-muted-foreground" : ""}>{c.item}</span>
                </li>
              ))}
            </ul>

            <button className="mt-5 w-full h-10 border border-dashed border-border text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:border-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2">
              <Upload className="h-3.5 w-3.5" />
              Anexar pendente
            </button>
          </div>
        </aside>
      </div>
    </AppLayout>
  );
}
