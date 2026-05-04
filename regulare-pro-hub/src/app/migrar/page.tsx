import MigrationTool from '@/components/migrar/MigrationTool'

export const dynamic = 'force-dynamic'

export default function MigrarPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto w-full min-h-screen font-mono">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10 pb-4 border-b border-border">
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold tracking-wider text-foreground uppercase">
            Migrar Sistema Antigo <span className="text-muted-foreground font-normal ml-2">// MOD.MIG / SYS</span>
          </h1>
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">
            IMPORTAR DADOS DO SISTEMA LEGADO HBS PARA O REGULARIZA PRO HUB
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-amber-500 uppercase tracking-widest border border-border px-2 py-1.5 rounded-sm bg-card">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Ferramenta de Migração
        </div>
      </div>

      <MigrationTool />
    </div>
  )
}
