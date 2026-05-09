import { useState } from 'react'
import { X, Save, User, MapPin, Smartphone, Mail, FileText, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function EditClienteModal({
  isOpen,
  onClose,
  cliente,
  onSuccess
}: {
  isOpen: boolean
  onClose: () => void
  cliente: any
  onSuccess: () => void
}) {
  const [saving, setSaving] = useState(false)
  
  if (!isOpen || !cliente) return null

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    const payload = Object.fromEntries(formData.entries())
    
    try {
      const res = await fetch(`/api/clientes/${cliente.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        onSuccess()
        onClose()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">{children}</label>
  )

  const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input 
      {...props}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-300"
    />
  )

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 my-auto"
      >
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest font-mono">Editar Cadastro</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">Atualize as informações do cliente</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSave} className="p-8 space-y-8">
          {/* SEÇÃO: DADOS PESSOAIS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-4 bg-primary rounded-full" />
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Identificação e Contato</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Nome Completo / Razão Social</Label>
                <Input name="nome" defaultValue={cliente.nome} required placeholder="Nome do cliente" />
              </div>
              <div>
                <Label>CPF / CNPJ</Label>
                <Input name="cpf_cnpj" defaultValue={cliente.cpf_cnpj} placeholder="000.000.000-00" />
              </div>
              <div>
                <Label>RG / Inscrição Estadual</Label>
                <Input name="rg_ie" defaultValue={cliente.rg_ie} placeholder="RG ou IE" />
              </div>
              <div>
                <Label>Telefone / WhatsApp</Label>
                <Input name="telefone" defaultValue={cliente.telefone} placeholder="(00) 00000-0000" />
              </div>
              <div>
                <Label>E-mail Principal</Label>
                <Input name="email" type="email" defaultValue={cliente.email} placeholder="email@exemplo.com" />
              </div>
            </div>
          </div>

          {/* SEÇÃO: ENDEREÇO */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Localização e Correspondência</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4">
                <Label>CEP</Label>
                <Input name="cep" defaultValue={cliente.cep} placeholder="00000-000" />
              </div>
              <div className="md:col-span-8">
                <Label>Logradouro / Rua</Label>
                <Input name="endereco" defaultValue={cliente.endereco} placeholder="Rua, Avenida..." />
              </div>
              <div className="md:col-span-3">
                <Label>Número</Label>
                <Input name="numero" defaultValue={cliente.numero} placeholder="123" />
              </div>
              <div className="md:col-span-5">
                <Label>Bairro</Label>
                <Input name="bairro" defaultValue={cliente.bairro} placeholder="Bairro" />
              </div>
              <div className="md:col-span-4">
                <Label>Cidade</Label>
                <Input name="cidade" defaultValue={cliente.cidade} placeholder="Cidade" />
              </div>
              <div className="md:col-span-3">
                <Label>Estado / UF</Label>
                <Input name="estado" defaultValue={cliente.estado} placeholder="Ex: SP" />
              </div>
              <div className="md:col-span-9">
                <Label>Status do Cliente</Label>
                <select 
                  name="status" 
                  defaultValue={cliente.status || 'ativo'} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="pendente">Pendente / Em negociação</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={saving} 
              className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={saving} 
              className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center gap-2"
            >
              {saving ? 'Sincronizando...' : <><CheckCircle2 size={14} /> Salvar Alterações</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
