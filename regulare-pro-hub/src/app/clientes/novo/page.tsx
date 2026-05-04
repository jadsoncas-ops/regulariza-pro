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
    <div className="p-8 max-w-3xl mx-auto w-full mb-16 font-mono">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/clientes" className="p-2 border border-border rounded-sm hover:bg-muted smooth-transition">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground uppercase">Novo Cliente</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Cadastro de registro no sistema central // CRM.003</p>
        </div>
      </div>

      <form action={createCliente} className="bg-card border border-border rounded-sm shadow-sm p-8 flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-2">
            <label htmlFor="nome" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nome Completo / Razão Social *</label>
            <input required type="text" id="nome" name="nome" className="px-3 py-2 bg-background border border-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="EX: JOÃO DA SILVA" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="cpf_cnpj" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">CPF ou CNPJ *</label>
            <input required type="text" id="cpf_cnpj" name="cpf_cnpj" className="px-3 py-2 bg-background border border-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="000.000.000-00" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="telefone" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Telefone / WhatsApp</label>
            <input type="text" id="telefone" name="telefone" className="px-3 py-2 bg-background border border-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="(00) 00000-0000" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">E-mail</label>
            <input type="email" id="email" name="email" className="px-3 py-2 bg-background border border-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="CONTATO@EMAIL.COM" />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label htmlFor="endereco" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Endereço Completo</label>
            <input type="text" id="endereco" name="endereco" className="px-3 py-2 bg-background border border-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="RUA, NÚMERO, BAIRRO, CIDADE - UF" />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label htmlFor="observacoes" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Observações</label>
            <textarea id="observacoes" name="observacoes" rows={3} className="px-3 py-2 bg-background border border-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"></textarea>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-border">
          <button type="submit" className="flex items-center gap-2 bg-foreground text-background px-8 py-2.5 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition shadow-sm">
            <Save className="w-4 h-4" />
            Salvar Registro
          </button>
        </div>
      </form>
    </div>
  )
}

