'use client'

import { useEffect, useState } from 'react'
import { 
  ShieldCheck, UserPlus, Search, Filter, MoreVertical, 
  Mail, Shield, Activity, ChevronRight, UserCircle2,
  CheckCircle2, XCircle, Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function UsuariosPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const res = await fetch('/api/usuarios')
    if (res.ok) {
      const data = await res.json()
      setUsers(data)
    }
    setLoading(false)
  }

  const handleSave = async (userData: any) => {
    const method = userData.id ? 'PATCH' : 'POST'
    const res = await fetch('/api/usuarios', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    
    if (res.ok) {
      fetchUsers()
      setShowModal(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      
      {/* HEADER */}
      <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-none">Controle de Usuários</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestão de acessos & permissões da equipe</p>
          </div>
        </div>

        <button 
          onClick={() => { setSelectedUser(null); setShowModal(true); }}
          className="btn-premium py-2.5 px-5 text-[10px]"
        >
          <UserPlus size={14} /> NOVO COLABORADOR
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="px-8 py-4 bg-white border-b border-slate-100 flex items-center gap-4 shrink-0">
         <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou e-mail..."
              className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
            />
         </div>
         <div className="flex items-center gap-2">
            <button className="h-11 px-4 border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 uppercase flex items-center gap-2 hover:bg-slate-50">
               <Filter size={14} /> Filtros
            </button>
         </div>
      </div>

      {/* USER LIST */}
      <div className="flex-1 overflow-y-auto scroll-container p-8">
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
           <table className="w-full text-left">
              <thead>
                 <tr className="border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Colaborador</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Acesso / Role</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {loading ? (
                    <tr>
                       <td colSpan={4} className="py-20 text-center">
                          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carregando Time...</p>
                       </td>
                    </tr>
                 ) : users.map((user) => (
                    <motion.tr 
                      key={user.id} 
                      className="group hover:bg-slate-50/50 transition-all"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    >
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <UserCircle2 size={24} />
                             </div>
                             <div>
                                <p className="text-sm font-black text-slate-900 leading-tight">{user.name}</p>
                                <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                                   <Mail size={12} />
                                   <span className="text-[10px] font-bold lowercase">{user.email}</span>
                                </div>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                             <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                user.role === 'manager' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                             }`}>
                                {user.role}
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className={`flex items-center gap-2 text-[10px] font-black uppercase ${
                             user.status === 'ativo' ? 'text-emerald-600' : 'text-red-500'
                          }`}>
                             {user.status === 'ativo' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                             {user.status}
                          </div>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <button 
                            onClick={() => { setSelectedUser(user); setShowModal(true); }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                             <ChevronRight size={20} />
                          </button>
                       </td>
                    </motion.tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>

      {/* USER MODAL */}
      <AnimatePresence>
         {showModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-end p-6">
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
                 onClick={() => setShowModal(false)}
               />
               <motion.div 
                 initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
                 className="relative w-full max-w-md h-full bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
               >
                  <UserForm user={selectedUser} onSave={handleSave} onCancel={() => setShowModal(false)} />
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  )
}

function UserForm({ user, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    id: user?.id || '',
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'operator',
    status: user?.status || 'ativo'
  })

  return (
    <div className="flex flex-col h-full">
       <div className="p-8 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
             {user ? 'Editar Colaborador' : 'Novo Colaborador'}
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Defina o nível de acesso ao sistema</p>
       </div>

       <div className="flex-1 p-8 space-y-6">
          <div>
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Nome Completo</label>
             <input 
               className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold"
               value={formData.name}
               onChange={e => setFormData({ ...formData, name: e.target.value })}
             />
          </div>
          <div>
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">E-mail Corporativo</label>
             <input 
               className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold"
               value={formData.email}
               onChange={e => setFormData({ ...formData, email: e.target.value })}
               disabled={!!user}
             />
          </div>
          {!user && (
            <div>
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Senha Provisória</label>
               <input 
                 type="password"
                 className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold"
                 value={formData.password}
                 onChange={e => setFormData({ ...formData, password: e.target.value })}
               />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Role / Permissão</label>
                <select 
                   className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none"
                   value={formData.role}
                   onChange={e => setFormData({ ...formData, role: e.target.value })}
                >
                   <option value="operator">Operador</option>
                   <option value="manager">Gerente</option>
                   <option value="admin">Administrador</option>
                </select>
             </div>
             <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Status da Conta</label>
                <select 
                   className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none"
                   value={formData.status}
                   onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                   <option value="ativo">Ativo</option>
                   <option value="suspenso">Suspenso</option>
                </select>
             </div>
          </div>
       </div>

       <div className="p-8 border-t border-slate-100 bg-slate-50 flex items-center gap-4">
          <button onClick={onCancel} className="flex-1 h-12 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cancelar</button>
          <button 
            onClick={() => onSave(formData)}
            className="flex-[2] h-14 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20"
          >
             Salvar Colaborador
          </button>
       </div>
    </div>
  )
}
