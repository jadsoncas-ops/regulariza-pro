import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

interface Resposta {
  ano: string;
  area: string;
  matricula: "Sim" | "Não" | "";
  habite: "Sim" | "Não" | "";
  loteamento: "Sim" | "Não" | "";
}

function diagnose(r: Resposta) {
  const ano = parseInt(r.ano || "0", 10);
  const area = parseInt(r.area || "0", 10);
  const recente = ano >= 2020;

  let tipo = "Averbação de construção";
  if (r.matricula === "Não") tipo = "Usucapião extrajudicial";
  else if (r.habite === "Não" && r.loteamento === "Sim") tipo = "Habite-se + Averbação";
  else if (r.loteamento === "Não") tipo = "Regularização fundiária (REURB)";

  const docs = [
    "Matrícula atualizada",
    "IPTU vigente",
    "Planta baixa assinada",
    "Memorial descritivo",
    "ART de execução",
  ];
  if (r.habite === "Não") docs.push("Habite-se / Auto de Conclusão");
  if (r.matricula === "Não") docs.push("Comprovante de posse mansa (5+ anos)");

  const etapas = ["Levantamento", "Projeto técnico", "Protocolo prefeitura", "Análise prefeitura", "Cartório / RGI"];
  const prazo = recente ? "60 a 90 dias" : area > 500 ? "120 a 180 dias" : "90 a 150 dias";
  const custoTaxas = Math.round(area * (recente ? 12 : 18));
  const custoCartorio = Math.round(area * 6 + 480);
  const honorarios = Math.round(area * 35 + 4500);

  return { tipo, docs, etapas, prazo, custoTaxas, custoCartorio, honorarios };
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export default function Diagnostico() {
  const navigate = useNavigate();
  const [r, setR] = useState<Resposta>({ ano: "", area: "", matricula: "", habite: "", loteamento: "" });
  const ready = r.ano && r.area && r.matricula && r.habite && r.loteamento;
  const result = ready ? diagnose(r) : null;

  return (
    <div className="min-h-dvh bg-background relative">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="relative max-w-4xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate("/")}
          className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          ← VOLTAR AO PAINEL
        </button>

        <header className="mt-8 mb-10">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Assistente Técnico · IA.001
          </div>
          <h1 className="mt-3 font-display text-4xl tracking-tighter">
            Diagnóstico Automático de Regularização
          </h1>
          <p className="mt-2 text-muted-foreground max-w-xl">
            Responda 5 perguntas sobre o imóvel. O sistema sugere o tipo de regularização, documentos exigidos,
            etapas e estimativas de prazo e custo.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-surface-dark border border-surface-dark shadow-block">
          {/* Form */}
          <form className="bg-surface p-6 flex flex-col gap-5">
            <Question label="Ano da construção">
              <input
                type="number"
                value={r.ano}
                onChange={(e) => setR({ ...r, ano: e.target.value })}
                placeholder="Ex: 2008"
                className="w-full h-10 px-3 bg-background border border-border focus:border-foreground outline-none font-mono text-sm"
              />
            </Question>
            <Question label="Área construída (m²)">
              <input
                type="number"
                value={r.area}
                onChange={(e) => setR({ ...r, area: e.target.value })}
                placeholder="Ex: 320"
                className="w-full h-10 px-3 bg-background border border-border focus:border-foreground outline-none font-mono text-sm"
              />
            </Question>
            <Choice
              label="Existe matrícula?"
              value={r.matricula}
              onChange={(v) => setR({ ...r, matricula: v })}
            />
            <Choice
              label="Existe Habite-se?"
              value={r.habite}
              onChange={(v) => setR({ ...r, habite: v })}
            />
            <Choice
              label="Está em loteamento aprovado?"
              value={r.loteamento}
              onChange={(v) => setR({ ...r, loteamento: v })}
            />
          </form>

          {/* Result */}
          <div className="bg-surface p-6">
            {!result ? (
              <div className="h-full flex items-center justify-center text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Preencha o formulário ao lado<br />para gerar o diagnóstico
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    Tipo de regularização sugerido
                  </div>
                  <div className="mt-1 font-display text-2xl tracking-tight text-primary">
                    {result.tipo}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                    Documentos exigidos
                  </div>
                  <ul className="text-sm grid grid-cols-1 gap-1">
                    {result.docs.map((d) => (
                      <li key={d} className="flex items-center gap-2 border-b border-border pb-1">
                        <span className="size-1.5 bg-foreground" /> {d}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                    Etapas do processo
                  </div>
                  <ol className="flex flex-col gap-1 text-sm">
                    {result.etapas.map((e, i) => (
                      <li key={e} className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-muted-foreground w-5">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {e}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="grid grid-cols-3 gap-px bg-border border border-border mt-2">
                  <Stat label="Prazo" value={result.prazo} />
                  <Stat label="Taxas" value={fmt(result.custoTaxas)} />
                  <Stat label="Honorários" value={fmt(result.honorarios)} primary />
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-8 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          ASSISTENTE EM MODO MOCK · ATIVAR LOVABLE CLOUD + IA PARA RESPOSTAS REAIS
        </footer>
      </div>
    </div>
  );
}

function Question({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </span>
      {children}
    </label>
  );
}

function Choice({
  label,
  value,
  onChange,
}: {
  label: string;
  value: "Sim" | "Não" | "";
  onChange: (v: "Sim" | "Não") => void;
}) {
  return (
    <Question label={label}>
      <div className="flex gap-2">
        {(["Sim", "Não"] as const).map((opt) => (
          <button
            type="button"
            key={opt}
            onClick={() => onChange(opt)}
            className={[
              "flex-1 h-10 font-display text-xs uppercase tracking-widest border transition-colors",
              value === opt
                ? "bg-foreground text-background border-foreground"
                : "bg-background border-border text-muted-foreground hover:border-foreground hover:text-foreground",
            ].join(" ")}
          >
            {opt}
          </button>
        ))}
      </div>
    </Question>
  );
}

function Stat({ label, value, primary }: { label: string; value: string; primary?: boolean }) {
  return (
    <div className={`p-3 ${primary ? "bg-primary text-primary-foreground" : "bg-background"}`}>
      <div className={`text-[9px] font-mono uppercase tracking-widest ${primary ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
        {label}
      </div>
      <div className="font-display text-base tabular-nums mt-1 leading-tight">{value}</div>
    </div>
  );
}
