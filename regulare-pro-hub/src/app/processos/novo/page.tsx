import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function NovoProcessoPage() {
  const clientes = await prisma.cliente.findMany({ orderBy: { nome: 'asc' } })

  async function createProcesso(formData: FormData) {
    'use server'
    
    const processo = await prisma.processo.create({
      data: {
        clienteId: formData.get('clienteId') as string,
        tipo_regularizacao: formData.get('tipo_regularizacao') as string,
        endereco: formData.get('endereco') as string,
        area_terreno: Number(formData.get('area_terreno')) || null,
        area_construida: Number(formData.get('area_construida')) || null,
        num_pavimentos: Number(formData.get('num_pavimentos')) || null,
        status: 'prospecção', // default
        responsavel: formData.get('responsavel') as string,
        observacoes: formData.get('observacoes') as string,
      }
    })

    // Cadastra o financeiro inicial vazio ou com valor
    await prisma.financeiro.create({
      data: {
        processoId: processo.id,
        honorarios: Number(formData.get('honorarios')) || 0,
        valor_pendente: Number(formData.get('honorarios')) || 0,
      }
    })
    
    redirect('/processos')
  }

  return (
    <div className="p-8 max-w-3xl mx-auto w-full mb-16">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/processos" className="p-2 hover:bg-muted rounded-lg smooth-transition">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Novo Processo</h1>
          <p className="text-sm text-muted-foreground mt-1">Inicie uma nova regularização vinculada a um cliente.</p>
        </div>
      </div>

      <form action={createProcesso} className="bg-card border border-border rounded-xl shadow-sm p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2 md:col-span-2">
            <label htmlFor="clienteId" className="text-sm font-semibold text-foreground">Cliente *</label>
            <select required id="clienteId" name="clienteId" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="">Selecione um cliente...</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nome} ({c.cpf_cnpj})</option>
              ))}
            </select>
            {clientes.length === 0 && (
              <p className="text-xs text-destructive mt-1">Nenhum cliente cadastrado. Por favor, cadastre um cliente primeiro.</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="tipo_regularizacao" className="text-sm font-semibold text-foreground">Tipo de Regularização *</label>
            <select required id="tipo_regularizacao" name="tipo_regularizacao" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="Desmembramento">Desmembramento</option>
              <option value="Unificação">Unificação</option>
              <option value="Usucapião">Usucapião</option>
              <option value="Habite-se">Habite-se</option>
              <option value="Alvará de Execução">Alvará de Execução</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label htmlFor="endereco" className="text-sm font-semibold text-foreground">Endereço do Imóvel *</label>
            <input required type="text" id="endereco" name="endereco" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Rua, Número, Bairro, Cidade - UF" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="area_terreno" className="text-sm font-semibold text-foreground">Área do Terreno (m²)</label>
            <input type="number" step="0.01" id="area_terreno" name="area_terreno" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Ex: 300.0" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="area_construida" className="text-sm font-semibold text-foreground">Área Construída (m²)</label>
            <input type="number" step="0.01" id="area_construida" name="area_construida" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Ex: 150.5" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="num_pavimentos" className="text-sm font-semibold text-foreground">Número de Pavimentos</label>
            <input type="number" id="num_pavimentos" name="num_pavimentos" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Ex: 2" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="responsavel" className="text-sm font-semibold text-foreground">Eng. / Arq. Responsável</label>
            <input type="text" id="responsavel" name="responsavel" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Nome do profissional" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="honorarios" className="text-sm font-semibold text-foreground">Honorários Previstos (R$)</label>
            <input type="number" step="0.01" id="honorarios" name="honorarios" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Ex: 5000.00" />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label htmlFor="observacoes" className="text-sm font-semibold text-foreground">Observações</label>
            <textarea id="observacoes" name="observacoes" rows={3} className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"></textarea>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border mt-2">
          <button type="submit" disabled={clientes.length === 0} className="disabled:opacity-50 flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 smooth-transition shadow-sm">
            <Save className="w-4 h-4" />
            Criar Processo
          </button>
        </div>
      </form>
    </div>
  )
}
