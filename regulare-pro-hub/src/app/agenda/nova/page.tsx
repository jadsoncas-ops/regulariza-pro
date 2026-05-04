import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function NovaTarefaPage() {
  const processos = await prisma.processo.findMany({
    include: { cliente: true },
    orderBy: { createdAt: 'desc' }
  })

  async function createTarefa(formData: FormData) {
    'use server'
    
    await prisma.tarefa.create({
      data: {
        titulo: formData.get('titulo') as string,
        descricao: formData.get('descricao') as string,
        processoId: formData.get('processoId') as string || null,
        data: new Date(formData.get('data') as string),
        hora: formData.get('hora') as string || null,
        responsavel: formData.get('responsavel') as string,
        status: 'pendente',
      }
    })
    
    redirect('/agenda')
  }

  return (
    <div className="p-8 max-w-3xl mx-auto w-full mb-16">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/agenda" className="p-2 hover:bg-muted rounded-lg smooth-transition">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Nova Tarefa</h1>
          <p className="text-sm text-muted-foreground mt-1">Agende um novo compromisso ou prazo.</p>
        </div>
      </div>

      <form action={createTarefa} className="bg-card border border-border rounded-xl shadow-sm p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2 md:col-span-2">
            <label htmlFor="titulo" className="text-sm font-semibold text-foreground">Título da Tarefa *</label>
            <input required type="text" id="titulo" name="titulo" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Ex: Reunião na Prefeitura, Entrega de Plantas..." />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label htmlFor="processoId" className="text-sm font-semibold text-foreground">Vincular a um Processo (Opcional)</label>
            <select id="processoId" name="processoId" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="">Nenhum processo vinculado</option>
              {processos.map(p => (
                <option key={p.id} value={p.id}>{p.tipo_regularizacao} - {p.cliente.nome} ({p.id.slice(-6).toUpperCase()})</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="data" className="text-sm font-semibold text-foreground">Data *</label>
            <input required type="date" id="data" name="data" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="hora" className="text-sm font-semibold text-foreground">Hora</label>
            <input type="time" id="hora" name="hora" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="responsavel" className="text-sm font-semibold text-foreground">Responsável</label>
            <input type="text" id="responsavel" name="responsavel" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Nome de quem fará a tarefa" />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label htmlFor="descricao" className="text-sm font-semibold text-foreground">Descrição / Detalhes</label>
            <textarea id="descricao" name="descricao" rows={4} className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Anotações importantes sobre este compromisso..."></textarea>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border mt-2">
          <button type="submit" className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 smooth-transition shadow-sm">
            <Save className="w-4 h-4" />
            Salvar Tarefa
          </button>
        </div>
      </form>
    </div>
  )
}
