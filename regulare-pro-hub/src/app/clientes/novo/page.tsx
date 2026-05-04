import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

export default function NovoClientePage() {
  async function createCliente(formData: FormData) {
    'use server'
    
    await prisma.cliente.create({
      data: {
        nome: formData.get('nome') as string,
        cpf_cnpj: formData.get('cpf_cnpj') as string,
        telefone: formData.get('telefone') as string,
        email: formData.get('email') as string,
        endereco: formData.get('endereco') as string,
        observacoes: formData.get('observacoes') as string,
      }
    })
    
    redirect('/clientes')
  }

  return (
    <div className="p-8 max-w-3xl mx-auto w-full mb-16">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/clientes" className="p-2 hover:bg-muted rounded-lg smooth-transition">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Novo Cliente</h1>
          <p className="text-sm text-muted-foreground mt-1">Cadastre um novo cliente no sistema.</p>
        </div>
      </div>

      <form action={createCliente} className="bg-card border border-border rounded-xl shadow-sm p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="nome" className="text-sm font-semibold text-foreground">Nome Completo / Razão Social *</label>
            <input required type="text" id="nome" name="nome" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Ex: João da Silva" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="cpf_cnpj" className="text-sm font-semibold text-foreground">CPF ou CNPJ *</label>
            <input required type="text" id="cpf_cnpj" name="cpf_cnpj" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="000.000.000-00" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="telefone" className="text-sm font-semibold text-foreground">Telefone / WhatsApp</label>
            <input type="text" id="telefone" name="telefone" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="(00) 00000-0000" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold text-foreground">E-mail</label>
            <input type="email" id="email" name="email" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="contato@email.com" />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label htmlFor="endereco" className="text-sm font-semibold text-foreground">Endereço Completo</label>
            <input type="text" id="endereco" name="endereco" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Rua, Número, Bairro, Cidade - UF" />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label htmlFor="observacoes" className="text-sm font-semibold text-foreground">Observações</label>
            <textarea id="observacoes" name="observacoes" rows={3} className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"></textarea>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border mt-2">
          <button type="submit" className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 smooth-transition shadow-sm">
            <Save className="w-4 h-4" />
            Salvar Cliente
          </button>
        </div>
      </form>
    </div>
  )
}
