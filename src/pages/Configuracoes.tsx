import { AppLayout } from "@/components/layout/AppLayout";
import { SectionHeader } from "@/components/dashboard/KpiGrid";
import { Check } from "lucide-react";

const usuarios = [
  { nome: "Helena Torres", papel: "Engenheira Resp.", email: "helena@engarq.gestao", ativo: true },
  { nome: "Marcos Barros", papel: "Engenheiro", email: "marcos@engarq.gestao", ativo: true },
  { nome: "Júlia Tavares", papel: "Analista", email: "julia@engarq.gestao", ativo: true },
  { nome: "Rogério Lima", papel: "Administrativo", email: "rogerio@engarq.gestao", ativo: false },
];

const planos = [
  { nome: "Starter", preco: "R$ 149", users: "Até 3 usuários", processos: "30 processos ativos", current: false },
  { nome: "Profissional", preco: "R$ 349", users: "Até 10 usuários", processos: "150 processos ativos", current: true },
  { nome: "Escritório", preco: "R$ 749", users: "Usuários ilimitados", processos: "Processos ilimitados", current: false },
];

export default function Configuracoes() {
  return (
    <AppLayout title="Configurações" subtitle="MOD.CFG / 10">
      <section>
        <SectionHeader title="Empresa" code="CFG.001" />
        <div className="bg-surface border border-border shadow-block-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Razão Social" value="Engarq Engenharia & Arquitetura LTDA" />
          <Field label="CNPJ" value="44.118.882/0001-77" mono />
          <Field label="Responsável Técnico" value="Helena Torres · CREA 5069212-D" />
          <Field label="Endereço" value="Av. Paulista, 1842 — sala 1102, São Paulo / SP" />
          <Field label="Telefone" value="(11) 4002-8821" mono />
          <Field label="E-mail comercial" value="contato@engarq.gestao" />
        </div>
      </section>

      <section>
        <SectionHeader title="Usuários & Permissões" code="CFG.002" />
        <div className="bg-surface border border-border shadow-block-sm">
          <div className="grid grid-cols-12 gap-4 p-3 border-b border-border text-[10px] text-muted-foreground font-bold uppercase tracking-widest font-display bg-surface-mid/40">
            <div className="col-span-4">Usuário</div>
            <div className="col-span-3">Papel</div>
            <div className="col-span-3">E-mail</div>
            <div className="col-span-2 text-right">Status</div>
          </div>
          {usuarios.map((u) => (
            <div
              key={u.email}
              className="grid grid-cols-12 gap-4 p-4 border-b border-border last:border-b-0 text-sm items-center"
            >
              <div className="col-span-4 flex items-center gap-3">
                <div className="size-7 bg-surface-dark text-foreground flex items-center justify-center text-[10px] font-mono">
                  {u.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <span className="font-medium">{u.nome}</span>
              </div>
              <div className="col-span-3 text-xs text-muted-foreground">{u.papel}</div>
              <div className="col-span-3 font-mono text-xs text-muted-foreground truncate">{u.email}</div>
              <div className="col-span-2 text-right">
                <span
                  className={`text-[10px] font-mono uppercase tracking-widest ${
                    u.ativo ? "text-success" : "text-muted-foreground"
                  }`}
                >
                  {u.ativo ? "● ATIVO" : "○ INATIVO"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Plano & Assinatura" code="CFG.003" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {planos.map((p) => (
            <article
              key={p.nome}
              className={[
                "border bg-surface p-6 flex flex-col gap-4 shadow-block-sm",
                p.current ? "border-foreground" : "border-border",
              ].join(" ")}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-xl">{p.nome}</h3>
                {p.current && (
                  <span className="text-[10px] font-mono uppercase tracking-widest bg-foreground text-background px-1.5 py-0.5">
                    PLANO ATUAL
                  </span>
                )}
              </div>
              <div className="font-display text-3xl tabular-nums">
                {p.preco}
                <span className="text-xs text-muted-foreground font-sans ml-1">/mês</span>
              </div>
              <ul className="flex flex-col gap-2 text-sm border-t border-border pt-4">
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> {p.users}</li>
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> {p.processos}</li>
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Documentos ilimitados</li>
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Suporte prioritário</li>
              </ul>
              <button
                className={[
                  "mt-2 h-9 text-[11px] font-display uppercase tracking-widest",
                  p.current
                    ? "border border-border text-muted-foreground cursor-default"
                    : "bg-foreground text-background hover:bg-primary",
                ].join(" ")}
              >
                {p.current ? "Em uso" : "Mudar para este plano"}
              </button>
            </article>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
        {label}
      </div>
      <div className={`text-sm ${mono ? "font-mono" : "font-medium"}`}>{value}</div>
    </div>
  );
}
