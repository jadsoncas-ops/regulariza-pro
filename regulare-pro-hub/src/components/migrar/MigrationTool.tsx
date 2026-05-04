'use client'

import { useState, useRef, useCallback } from 'react'
import {
  Upload, FileJson, AlertTriangle, CheckCircle2,
  Loader2, Users, FolderKanban, DollarSign,
  CheckSquare, ChevronRight, Database, TriangleAlert,
  RefreshCw, X, Info
} from 'lucide-react'

interface MigrationStats {
  clientes: number
  processos: number
  financeiro: number
  tarefas: number
  ignorados: number
}

interface BackupPreview {
  clientes: number
  processos: number
  lancamentos: number
  tasks: number
}

type MigrationStep = 'idle' | 'analyzing' | 'preview' | 'migrating' | 'done' | 'error'

export default function MigrationTool() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<MigrationStep>('idle')
  const [jsonData, setJsonData] = useState<string | null>(null)
  const [preview, setPreview] = useState<BackupPreview | null>(null)
  const [stats, setStats] = useState<MigrationStats | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedItems, setSelectedItems] = useState({
    clientes: true,
    processos: true,
    financeiro: true,
    tarefas: true,
  })

  const processFile = (file: File) => {
    if (!file.name.endsWith('.json')) {
      setErrorMsg('Por favor, selecione um arquivo .json exportado do sistema HBS.')
      setStep('error')
      return
    }

    setStep('analyzing')
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const data = JSON.parse(text)

        const clientes = data.clientes || data.clients || []
        const processos = data.processos || data.processes || []
        const lancamentos = data.lancamentos || data.transactions || []
        const tasks = data.tasks || []

        if (!Array.isArray(clientes)) {
          throw new Error('Formato inválido. O arquivo não parece ser um backup do sistema HBS.')
        }

        setJsonData(text)
        setPreview({
          clientes: clientes.length,
          processos: processos.length,
          lancamentos: lancamentos.length,
          tasks: tasks.length,
        })
        setStep('preview')
      } catch (err: any) {
        setErrorMsg(err.message || 'Erro ao ler o arquivo JSON.')
        setStep('error')
      }
    }
    reader.readAsText(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }, [])

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleMigrate = async () => {
    if (!jsonData) return
    setStep('migrating')
    setErrorMsg(null)

    try {
      const response = await fetch('/api/migrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonData }),
      })

      const result = await response.json()

      if (!result.success) {
        setErrorMsg(result.error || 'Falha ao processar a migração no servidor.')
        setStep('error')
        return
      }

      setStats(result.stats)
      setStep('done')
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro de conexão com o servidor.')
      setStep('error')
    }
  }

  const reset = () => {
    setStep('idle')
    setJsonData(null)
    setPreview(null)
    setStats(null)
    setErrorMsg(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-8">

      {/* AVISO INFORMATIVO */}
      <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 p-4 rounded-sm">
        <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-500">Como exportar do sistema antigo</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            No sistema <strong className="text-foreground">HBS Flux</strong>, acesse o menu <strong className="text-foreground">Configurações → Backup/Exportar</strong> e clique em <strong className="text-foreground">"Exportar Backup Completo"</strong>. Um arquivo <code className="bg-muted px-1 rounded text-[10px]">.json</code> será baixado. Arraste ou selecione esse arquivo aqui abaixo.
          </p>
        </div>
      </div>

      {/* STEP: IDLE - UPLOAD ZONE */}
      {(step === 'idle' || step === 'analyzing') && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-sm p-16 text-center cursor-pointer smooth-transition
            flex flex-col items-center justify-center gap-4
            ${isDragging
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-border hover:border-primary/40 hover:bg-muted/10 bg-muted/5'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileChange}
          />

          {step === 'analyzing' ? (
            <>
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <div>
                <p className="text-sm font-bold uppercase tracking-widest">Analisando arquivo...</p>
                <p className="text-[10px] text-muted-foreground mt-1">Mapeando estrutura de dados do sistema HBS</p>
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <div className="w-16 h-16 rounded-sm bg-muted/50 border border-border flex items-center justify-center">
                  <Upload className="w-7 h-7 text-muted-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <FileJson className="w-3 h-3 text-primary-foreground" />
                </div>
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-foreground">Arraste o arquivo de backup</p>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">ou clique para selecionar</p>
              </div>
              <div className="px-3 py-1.5 bg-muted/50 border border-border rounded-sm text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Aceita: backup_hbs_*.json
              </div>
            </>
          )}
        </div>
      )}

      {/* STEP: ERROR */}
      {step === 'error' && (
        <div className="flex flex-col items-center gap-6 py-12">
          <div className="w-16 h-16 rounded-sm bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-red-500">Erro ao processar</p>
            <p className="text-[11px] text-muted-foreground mt-2 max-w-md leading-relaxed">{errorMsg}</p>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-2 border border-border px-6 py-2.5 rounded-sm text-[11px] font-bold uppercase tracking-widest hover:bg-muted smooth-transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Tentar Novamente
          </button>
        </div>
      )}

      {/* STEP: PREVIEW */}
      {step === 'preview' && preview && (
        <div className="space-y-6">

          {/* Dados detectados */}
          <div className="bg-card border border-border rounded-sm p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest">Dados Detectados</h2>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">Selecione o que deseja importar</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                <CheckCircle2 className="w-4 h-4" /> Arquivo Válido
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'clientes', label: 'Clientes', count: preview.clientes, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
                { key: 'processos', label: 'Processos', count: preview.processos, icon: FolderKanban, color: 'text-violet-500', bg: 'bg-violet-500/10 border-violet-500/20' },
                { key: 'financeiro', label: 'Lançamentos', count: preview.lancamentos, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                { key: 'tarefas', label: 'Tarefas', count: preview.tasks, icon: CheckSquare, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
              ].map(({ key, label, count, icon: Icon, color, bg }) => (
                <div
                  key={key}
                  onClick={() => setSelectedItems(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                  className={`
                    relative p-4 rounded-sm border cursor-pointer smooth-transition
                    ${selectedItems[key as keyof typeof selectedItems]
                      ? `${bg} border-opacity-100`
                      : 'bg-muted/10 border-border opacity-50'
                    }
                  `}
                >
                  <div className={`absolute top-3 right-3 w-4 h-4 rounded-sm border-2 flex items-center justify-center smooth-transition
                    ${selectedItems[key as keyof typeof selectedItems] ? 'bg-primary border-primary' : 'border-border bg-background'}`
                  }>
                    {selectedItems[key as keyof typeof selectedItems] && <CheckCircle2 className="w-2.5 h-2.5 text-primary-foreground" />}
                  </div>
                  <Icon className={`w-5 h-5 mb-3 ${color}`} />
                  <div className="text-2xl font-black">{count}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mapeamento de banco */}
          <div className="bg-card border border-border rounded-sm p-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
              <Database className="w-3.5 h-3.5" /> Mapeamento de Tabelas
            </h3>
            <div className="space-y-2 text-[11px]">
              {[
                { from: 'hbs_clients (localStorage)', to: 'Cliente (PostgreSQL)', note: 'Deduplicação por CPF/Nome' },
                { from: 'hbs_processes (localStorage)', to: 'Processo + Checklist', note: 'Status mapeado automaticamente' },
                { from: 'hbs_transactions (localStorage)', to: 'Financeiro', note: 'Tipo: Entrada→receita / Saída→despesa' },
                { from: 'hbs_tasks (localStorage)', to: 'Tarefa', note: 'Vinculada ao processo' },
              ].map((row) => (
                <div key={row.from} className="grid grid-cols-[1fr,auto,1fr] items-center gap-3 p-2.5 bg-muted/20 rounded-sm border border-border/50">
                  <span className="font-mono text-rose-400 truncate">{row.from}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <div>
                    <span className="font-mono text-emerald-400">{row.to}</span>
                    <span className="text-muted-foreground ml-2 text-[9px]">{row.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aviso de segurança */}
          <div className="flex items-start gap-3 bg-muted/20 border border-border p-4 rounded-sm">
            <TriangleAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              A migração <strong className="text-foreground">não sobrescreve dados existentes</strong>. Clientes com o mesmo CPF/CNPJ ou nome serão detectados e ignorados automaticamente. O sistema fará a vinculação correta.
            </p>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={reset}
              className="flex items-center gap-2 border border-border px-5 py-2.5 rounded-sm text-[11px] font-bold uppercase tracking-widest hover:bg-muted smooth-transition text-muted-foreground"
            >
              <X className="w-3.5 h-3.5" /> Cancelar
            </button>
            <button
              onClick={handleMigrate}
              disabled={!Object.values(selectedItems).some(Boolean)}
              className="flex items-center gap-2 bg-foreground text-background px-8 py-2.5 rounded-sm text-[11px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Executar Migração <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP: MIGRATING */}
      {step === 'migrating' && (
        <div className="flex flex-col items-center gap-6 py-16">
          <div className="relative">
            <div className="w-20 h-20 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Database className="w-9 h-9 text-primary" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm font-bold uppercase tracking-widest">Migrando dados...</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Aguarde. Isso pode levar alguns segundos.</p>
          </div>
          <div className="flex flex-col gap-2 w-full max-w-xs">
            {['Importando clientes...', 'Criando processos...', 'Lançamentos financeiros...', 'Tarefas e checklists...'].map((label, i) => (
              <div key={i} className="flex items-center gap-3 text-[11px] text-muted-foreground animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP: DONE */}
      {step === 'done' && stats && (
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-16 h-16 rounded-sm bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-500">Migração Concluída!</p>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">Todos os dados foram importados com sucesso</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Clientes Criados', value: stats.clientes, icon: Users, color: 'text-blue-500' },
              { label: 'Processos Criados', value: stats.processos, icon: FolderKanban, color: 'text-violet-500' },
              { label: 'Lançamentos', value: stats.financeiro, icon: DollarSign, color: 'text-emerald-500' },
              { label: 'Tarefas', value: stats.tarefas, icon: CheckSquare, color: 'text-amber-500' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-card border border-border rounded-sm p-5 text-center">
                <Icon className={`w-5 h-5 mx-auto mb-2 ${color}`} />
                <div className="text-2xl font-black">{value}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">{label}</div>
              </div>
            ))}
          </div>

          {stats.ignorados > 0 && (
            <div className="flex items-start gap-3 bg-muted/20 border border-border p-4 rounded-sm">
              <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground">
                <strong className="text-foreground">{stats.ignorados} registros</strong> foram ignorados por já existirem no sistema ou por não possuírem vinculação válida (órfãos).
              </p>
            </div>
          )}

          <div className="flex justify-center gap-4 pt-2">
            <a href="/clientes" className="flex items-center gap-2 border border-border bg-card px-6 py-2.5 rounded-sm text-[11px] font-bold uppercase tracking-widest hover:bg-muted smooth-transition">
              <Users className="w-3.5 h-3.5" /> Ver Clientes
            </a>
            <a href="/processos" className="flex items-center gap-2 bg-foreground text-background px-6 py-2.5 rounded-sm text-[11px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition">
              <FolderKanban className="w-3.5 h-3.5" /> Ver Processos
            </a>
          </div>

          <div className="text-center">
            <button onClick={reset} className="text-[10px] text-muted-foreground hover:text-foreground smooth-transition uppercase tracking-widest underline">
              Fazer nova migração
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
