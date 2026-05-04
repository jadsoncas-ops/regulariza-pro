import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, Edit3 } from 'lucide-react'

export default async function EditarClientePage({ params }: { params: { id: string } }) {
  const cliente = await prisma.cliente.findUnique({
    where: { id: params.id },
    include: { processos: true }
  })

  if (!cliente) return redirect('/clientes')

  async function updateCliente(formData: FormData) {
    'use server'
    await prisma.cliente.update({
      where: { id: params.id },
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

  async function deleteCliente() {
    'use server'
    await prisma.cliente.delete({ where: { id: params.id } })
    redirect('/clientes')
  }

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/clientes" className="p-2 hover:bg-muted rounded-lg smooth-transition">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Editar Cliente</h1>
            <p className="text-sm text-muted-foreground mt-1">Atualize os dados ou exclua este registro.</p>
          </div>
        </div>
        
        <form action={deleteCliente}>
          <button type="submit" className="flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-lg text-sm font-medium hover:bg-destructive hover:text-white smooth-transition shadow-sm">
            <Trash2 className="w-4 h-4" />
            Excluir Cliente
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form action={updateCliente} className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="nome" className="text-sm font-semibold text-foreground">Nome Completo / Razão Social *</label>
              <input required defaultValue={cliente.nome} type="text" id="nome" name="nome" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="cpf_cnpj" className="text-sm font-semibold text-foreground">CPF ou CNPJ *</label>
              <input required defaultValue={cliente.cpf_cnpj} type="text" id="cpf_cnpj" name="cpf_cnpj" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="telefone" className="text-sm font-semibold text-foreground">Telefone / WhatsApp</label>
              <input defaultValue={cliente.telefone || ''} type="text" id="telefone" name="telefone" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-semibold text-foreground">E-mail</label>
              <input defaultValue={cliente.email || ''} type="email" id="email" name="email" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label htmlFor="endereco" className="text-sm font-semibold text-foreground">Endereço Completo</label>
              <input defaultValue={cliente.endereco || ''} type="text" id="endereco" name="endereco" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label htmlFor="observacoes" className="text-sm font-semibold text-foreground">Observações</label>
              <textarea defaultValue={cliente.observacoes || ''} id="observacoes" name="observacoes" rows={3} className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"></textarea>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border mt-2">
            <button type="submit" className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 smooth-transition shadow-sm">
              <Save className="w-4 h-4" />
              Salvar Alterações
            </button>
          </div>
        </form>

        <div className="bg-muted/30 border border-border rounded-xl shadow-sm p-6 flex flex-col gap-4 h-fit">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            Processos Vinculados ({cliente.processos.length})
          </h3>
          <div className="flex flex-col gap-3">
            {cliente.processos.map(p => (
              <Link href={`/processos/${p.id}`} key={p.id} className="p-3 bg-card border border-border rounded-lg hover:border-primary/50 smooth-transition">
                <div className="text-xs font-mono text-muted-foreground">{p.id.slice(-6).toUpperCase()}</div>
                <div className="font-medium text-sm text-foreground mt-1">{p.tipo_regularizacao}</div>
                <div className="text-xs font-semibold mt-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full w-fit capitalize">{p.status}</div>
              </Link>
            ))}
            {cliente.processos.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum processo iniciado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
