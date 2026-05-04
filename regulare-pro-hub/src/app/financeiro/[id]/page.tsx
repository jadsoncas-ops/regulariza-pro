import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'

export default async function EditarFinanceiroPage({ params }: { params: { id: string } }) {
  const financeiro = await prisma.financeiro.findUnique({
    where: { id: params.id },
    include: { processo: { include: { cliente: true } } }
  })
  
  if (!financeiro) return redirect('/financeiro')

  async function updateFinanceiro(formData: FormData) {
    'use server'
    const honorarios = Number(formData.get('honorarios'))
    const valor_pago = Number(formData.get('valor_pago'))
    const valor_pendente = honorarios - valor_pago

    const dataPgto = formData.get('data_pagamento') as string
    
    await prisma.financeiro.update({
      where: { id: params.id },
      data: {
        honorarios,
        valor_pago,
        valor_pendente,
        forma_pagamento: formData.get('forma_pagamento') as string || null,
        data_pagamento: dataPgto ? new Date(dataPgto) : null,
      }
    })
    redirect('/financeiro')
  }

  const dateValue = financeiro.data_pagamento ? financeiro.data_pagamento.toISOString().split('T')[0] : ''

  return (
    <div className="p-8 max-w-3xl mx-auto w-full mb-16">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/financeiro" className="p-2 hover:bg-muted rounded-lg smooth-transition">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Registro Financeiro</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Processo <span className="uppercase font-semibold text-primary">{financeiro.processo.id.slice(-6)}</span> • {financeiro.processo.cliente.nome}
            </p>
          </div>
        </div>
      </div>

      <form action={updateFinanceiro} className="bg-card border border-border rounded-xl shadow-sm p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="honorarios" className="text-sm font-semibold text-foreground">Honorários Previstos (R$) *</label>
            <input required defaultValue={financeiro.honorarios} type="number" step="0.01" id="honorarios" name="honorarios" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="valor_pago" className="text-sm font-semibold text-foreground">Valor Pago (R$) *</label>
            <input required defaultValue={financeiro.valor_pago} type="number" step="0.01" id="valor_pago" name="valor_pago" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-emerald-500 font-bold" />
            <p className="text-xs text-muted-foreground">O valor pendente será recalculado automaticamente.</p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="forma_pagamento" className="text-sm font-semibold text-foreground">Forma de Pagamento</label>
            <select defaultValue={financeiro.forma_pagamento || ''} id="forma_pagamento" name="forma_pagamento" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="">Selecione...</option>
              <option value="Pix">Pix</option>
              <option value="Boleto">Boleto</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Transferência">Transferência Bancária</option>
              <option value="Dinheiro">Dinheiro em Espécie</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="data_pagamento" className="text-sm font-semibold text-foreground">Data do Pagamento</label>
            <input defaultValue={dateValue} type="date" id="data_pagamento" name="data_pagamento" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border mt-2">
          <button type="submit" className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 smooth-transition shadow-sm">
            <Save className="w-4 h-4" />
            Salvar Registro
          </button>
        </div>
      </form>
    </div>
  )
}
