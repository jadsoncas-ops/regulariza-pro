import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, Edit3, CheckSquare, FileText, DollarSign } from 'lucide-react'

export default async function EditarProcessoPage({ params }: { params: { id: string } }) {
  const processo = await prisma.processo.findUnique({
    where: { id: params.id },
    include: { cliente: true, financeiro: true, tarefas: true, documentos: true, checklists: true }
  })
  
  const clientes = await prisma.cliente.findMany({ orderBy: { nome: 'asc' } })

  if (!processo) return redirect('/processos')

  async function updateProcesso(formData: FormData) {
    'use server'
    await prisma.processo.update({
      where: { id: params.id },
      data: {
        clienteId: formData.get('clienteId') as string,
        tipo_regularizacao: formData.get('tipo_regularizacao') as string,
        endereco: formData.get('endereco') as string,
        area_terreno: Number(formData.get('area_terreno')) || null,
        area_construida: Number(formData.get('area_construida')) || null,
        num_pavimentos: Number(formData.get('num_pavimentos')) || null,
        status: formData.get('status') as string,
        responsavel: formData.get('responsavel') as string,
        observacoes: formData.get('observacoes') as string,
      }
    })
    redirect('/processos')
  }

  async function deleteProcesso() {
    'use server'
    await prisma.processo.delete({ where: { id: params.id } })
    redirect('/processos')
  }

  return (
    <div className="p-8 max-w-6xl mx-auto w-full mb-16">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/processos" className="p-2 hover:bg-muted rounded-lg smooth-transition">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Processo <span className="text-primary uppercase">{processo.id.slice(-6)}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Gerencie todos os dados, documentos e checklists desta regularização.</p>
          </div>
        </div>
        
        <form action={deleteProcesso}>
          <button type="submit" className="flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-lg text-sm font-medium hover:bg-destructive hover:text-white smooth-transition shadow-sm">
            <Trash2 className="w-4 h-4" />
            Excluir Processo
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Formulário Principal */}
        <form action={updateProcesso} className="xl:col-span-2 bg-card border border-border rounded-xl shadow-sm p-6 flex flex-col gap-6">
          <h2 className="text-lg font-bold border-b border-border pb-2">Dados Principais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2 md:col-span-2">
              <label htmlFor="clienteId" className="text-sm font-semibold text-foreground">Cliente *</label>
              <select required defaultValue={processo.clienteId} id="clienteId" name="clienteId" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nome} ({c.cpf_cnpj})</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="tipo_regularizacao" className="text-sm font-semibold text-foreground">Tipo de Regularização *</label>
              <select required defaultValue={processo.tipo_regularizacao} id="tipo_regularizacao" name="tipo_regularizacao" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="Desmembramento">Desmembramento</option>
                <option value="Unificação">Unificação</option>
                <option value="Usucapião">Usucapião</option>
                <option value="Habite-se">Habite-se</option>
                <option value="Alvará de Execução">Alvará de Execução</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="status" className="text-sm font-semibold text-foreground">Status do Processo</label>
              <select required defaultValue={processo.status} id="status" name="status" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="prospecção">Prospecção</option>
                <option value="levantamento">Levantamento</option>
                <option value="projeto">Projeto</option>
                <option value="protocolado">Protocolado</option>
                <option value="em análise">Em Análise</option>
                <option value="exigência">Exigência</option>
                <option value="aprovado">Aprovado</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label htmlFor="endereco" className="text-sm font-semibold text-foreground">Endereço do Imóvel *</label>
              <input required defaultValue={processo.endereco} type="text" id="endereco" name="endereco" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="area_terreno" className="text-sm font-semibold text-foreground">Área do Terreno (m²)</label>
              <input defaultValue={processo.area_terreno || ''} type="number" step="0.01" id="area_terreno" name="area_terreno" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="area_construida" className="text-sm font-semibold text-foreground">Área Construída (m²)</label>
              <input defaultValue={processo.area_construida || ''} type="number" step="0.01" id="area_construida" name="area_construida" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="num_pavimentos" className="text-sm font-semibold text-foreground">Número de Pavimentos</label>
              <input defaultValue={processo.num_pavimentos || ''} type="number" id="num_pavimentos" name="num_pavimentos" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="responsavel" className="text-sm font-semibold text-foreground">Eng. / Arq. Responsável</label>
              <input defaultValue={processo.responsavel || ''} type="text" id="responsavel" name="responsavel" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label htmlFor="observacoes" className="text-sm font-semibold text-foreground">Observações</label>
              <textarea defaultValue={processo.observacoes || ''} id="observacoes" name="observacoes" rows={3} className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"></textarea>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border mt-2">
            <button type="submit" className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 smooth-transition shadow-sm">
              <Save className="w-4 h-4" />
              Salvar Alterações
            </button>
          </div>
        </form>

        {/* Módulos Relacionados */}
        <div className="flex flex-col gap-6">
          <div className="bg-muted/30 border border-border rounded-xl shadow-sm p-6 flex flex-col gap-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              Financeiro
            </h3>
            {processo.financeiro.length > 0 ? processo.financeiro.map(f => (
              <div key={f.id} className="text-sm bg-card p-3 rounded-lg border border-border">
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Honorários:</span>
                  <span className="font-semibold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(f.honorarios)}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Pago:</span>
                  <span className="font-semibold text-emerald-500">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(f.valor_pago)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pendente:</span>
                  <span className="font-semibold text-rose-500">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(f.valor_pendente)}</span>
                </div>
              </div>
            )) : <p className="text-sm text-muted-foreground">Nenhum registro financeiro.</p>}
            <Link href="/financeiro" className="text-primary hover:underline text-xs text-center font-medium mt-2">Gerenciar no Módulo Financeiro</Link>
          </div>

          <div className="bg-muted/30 border border-border rounded-xl shadow-sm p-6 flex flex-col gap-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-primary" />
              Checklist (Em breve)
            </h3>
            <p className="text-xs text-muted-foreground">O módulo completo de checklists e marcação de etapas será implementado na próxima atualização.</p>
          </div>

          <div className="bg-muted/30 border border-border rounded-xl shadow-sm p-6 flex flex-col gap-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              Documentos (Em breve)
            </h3>
            <p className="text-xs text-muted-foreground">A funcionalidade de upload de Matrícula, IPTU, Plantas, e fotos ficará disponível aqui.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
