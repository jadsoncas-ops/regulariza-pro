const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/processos/[id]/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

const startMarker = "      {/* ── TABS ── */}\r\n";
const endMarker = "      {/* ── MODAIS ── */}\r\n";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error("Markers not found");
    process.exit(1);
}

const newLayout = `      {/* ── COMMAND CENTER: HIGH DENSITY 3-COLUMN LAYOUT ── */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4 h-full min-h-0 bg-[#FDFDFD]">
        
        {/* LEFT COLUMN: IDENTITY & ACTIVITY (Col 3) */}
        <div className="col-span-12 md:col-span-3 flex flex-col gap-4 h-full overflow-y-auto pr-2 custom-scrollbar">
          
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                <Target size={14} className="text-slate-500" /> Identidade
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-100 text-slate-500">{processo.codigo_projeto || 'N/A'}</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-[12px] font-bold text-slate-900 leading-tight uppercase">{processo.tipo_regularizacao}</p>
                <div className="mt-2 p-3 bg-slate-50 rounded-xl">
                   <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Cliente</p>
                   <p className="text-[11px] font-bold text-slate-800">{processo.cliente?.nome}</p>
                </div>
                <div className="mt-2 p-3 bg-slate-50 rounded-xl">
                   <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Localização</p>
                   <p className="text-[11px] font-bold text-slate-800">{processo.imovel?.endereco}, {processo.imovel?.numero}</p>
                   <p className="text-[9px] text-slate-500 mt-0.5">{processo.imovel?.cidade}/{processo.imovel?.estado}</p>
                </div>
              </div>
              
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tempo Ativo</span>
                <span className={\`text-[10px] font-black uppercase tracking-widest \${Math.floor((Date.now() - new Date(processo.createdAt).getTime()) / 86400000) > 60 ? 'text-red-500' : 'text-slate-800'}\`}>
                  {Math.floor((Date.now() - new Date(processo.createdAt).getTime()) / 86400000)} dias
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex-1 min-h-[250px] flex flex-col">
             <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2 shrink-0">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                  <Activity size={14} /> Activity Timeline
                </div>
             </div>
             <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar pl-2">
                {processo.logs?.slice(0, 15).map((log: any, i: number) => (
                  <div key={i} className="flex gap-4 relative">
                     {i !== (processo.logs?.length > 15 ? 14 : processo.logs?.length - 1) && <div className="absolute left-[5px] top-4 bottom-[-16px] w-[2px] bg-slate-100" />}
                     <div className="w-3 h-3 rounded-full bg-slate-200 border-2 border-white relative z-10 shrink-0 mt-0.5 shadow-sm" />
                     <div>
                        <p className="text-[10px] font-bold text-slate-800 leading-tight uppercase">{log.acao}</p>
                        <p className="text-[8px] text-slate-400 uppercase font-medium mt-0.5 font-mono">{new Date(log.createdAt).toLocaleDateString('pt-BR')} • {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                     </div>
                  </div>
                ))}
                {(!processo.logs || processo.logs.length === 0) && (
                  <p className="text-[9px] text-slate-400 font-bold uppercase text-center py-6">Sem atividades</p>
                )}
             </div>
          </div>

        </div>

        {/* CENTER COLUMN: WORKFLOW ENGINE (Col 5) */}
        <div className="col-span-12 md:col-span-5 flex flex-col gap-4 h-full overflow-y-auto pr-2 custom-scrollbar">
           
           <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm shrink-0">
             <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase tracking-widest font-mono">
                  <Layers size={14} className="text-blue-500" /> Pipeline Dinâmico
                </div>
             </div>
             <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
                {['em_analise', 'levantamento', 'projeto', 'protocolo_prefeitura', 'cartorio', 'finalizado'].map((s, i, arr) => {
                  const currentIdx = arr.indexOf(processo.status || 'em_analise')
                  const isPast = i < currentIdx
                  const isCurrent = i === currentIdx
                  const label = STATUS_LABELS[s] || s
                  return (
                    <div key={s} className={\`flex-1 min-w-[100px] flex flex-col p-3 rounded-xl border transition-all \${
                      isCurrent ? 'bg-blue-50/50 border-blue-200 ring-1 ring-blue-500/20 shadow-sm' : 
                      isPast ? 'bg-emerald-50/20 border-emerald-100' : 'bg-slate-50 border-transparent opacity-60'
                    }\`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={\`text-[8px] font-black uppercase tracking-widest \${isCurrent ? 'text-blue-600' : isPast ? 'text-emerald-600' : 'text-slate-400'}\`}>0{i+1}</span>
                        {isPast && <CheckCircle2 size={10} className="text-emerald-500" />}
                        {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />}
                      </div>
                      <p className={\`text-[9px] font-bold leading-tight \${isCurrent ? 'text-slate-900' : 'text-slate-600'}\`}>{label}</p>
                    </div>
                  )
                })}
             </div>
           </div>

           <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex-1 flex flex-col min-h-[400px]">
             <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3 shrink-0">
                <div className="flex items-center gap-2 text-[10px] font-bold text-amber-500 uppercase tracking-widest font-mono">
                  <Zap size={14} className="text-amber-500" /> Autonomous Workflow
                </div>
                <div className="flex gap-1">
                   <button onClick={() => { setTarefaToEdit(null); setIsTaskModalOpen(true) }} className="btn-secondary py-1 px-2 text-[8px] uppercase tracking-widest"><Plus size={10} className="mr-1"/> Tarefa</button>
                   <button onClick={() => { setProtocoloToEdit(null); setIsProtocoloModalOpen(true) }} className="btn-secondary py-1 px-2 text-[8px] uppercase tracking-widest"><Plus size={10} className="mr-1"/> Órgão</button>
                </div>
             </div>
             
             <div className="flex-1 overflow-y-auto pr-2 relative">
                <div className="absolute left-[15px] top-4 bottom-4 w-px bg-slate-100 z-0" />
                <div className="space-y-4 relative z-10 pt-2">
                  {[
                    ...(processo.tarefas || []).map((t: any) => ({ ...t, type: 'task' })),
                    ...(processo.protocolos || []).map((p: any) => ({ ...p, type: 'protocol' }))
                  ]
                  .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                  .map((item, idx) => (
                    <div key={idx} className="relative pl-10 group">
                      <div className={\`absolute left-1 top-2 w-6 h-6 rounded-full shadow-sm flex items-center justify-center \${
                        item.status === 'concluido' ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-400 group-hover:border-primary group-hover:text-primary transition-colors'
                      }\`}>
                         {item.type === 'task' ? <ListTodo size={10} /> : <Building2 size={10} />}
                      </div>
                      
                      <div className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm group-hover:border-primary/20 group-hover:shadow-md transition-all flex items-start gap-3">
                         <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                               <span className={\`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest \${
                                 item.type === 'task' ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-blue-600'
                               }\`}>
                                 {item.type === 'task' ? 'TAREFA' : 'PROTOCOLO'}
                               </span>
                               <span className="text-[8px] font-bold text-slate-400 font-mono">{new Date(item.data).toLocaleDateString('pt-BR')}</span>
                               <span className={\`ml-auto text-[8px] font-bold uppercase px-1.5 py-0.5 rounded \${item.status === 'concluido' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}\`}>{item.status}</span>
                            </div>
                            <h4 className={\`text-[11px] font-bold \${item.status === 'concluido' ? 'text-slate-400 line-through' : 'text-slate-800'}\`}>
                               {item.type === 'task' ? item.titulo : \`\${item.orgao} - #\${item.numero_protocolo}\`}
                            </h4>
                         </div>
                         <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => item.type==='task' ? (setTarefaToEdit(item), setIsTaskModalOpen(true)) : (setProtocoloToEdit(item), setIsProtocoloModalOpen(true))} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"><Edit size={12}/></button>
                            <button onClick={() => item.type==='task' ? handleDeleteTarefa(item.id, item.titulo) : handleDeleteProtocolo(item.id, item.orgao)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400"><Trash2 size={12}/></button>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
           </div>

        </div>

        {/* RIGHT COLUMN: FINANCIAL & DOCS (Col 4) */}
        <div className="col-span-12 md:col-span-4 flex flex-col gap-4 h-full overflow-y-auto pr-2 custom-scrollbar">
           
           <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl relative overflow-hidden group shrink-0">
             <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform text-white">
                <Sparkles size={80} />
             </div>
             <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-2"><TrendingUp size={14}/> Financeiro</h3>
                <button onClick={() => { setFinanceiroToEdit(null); setIsFinanceiroModalOpen(true) }} className="text-slate-400 hover:text-white transition-colors p-1"><Plus size={14}/></button>
             </div>
             <div className="relative z-10">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Contrato Total</p>
                <p className="text-xl font-black text-white leading-none mb-4">{fmt(stats?.totalContratado || 0)}</p>
                
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                   <div>
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Recebido</p>
                      <p className="text-[11px] font-bold text-emerald-400">{fmt(stats?.totalRecebido || 0)}</p>
                   </div>
                   <div>
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Custos/Repasses</p>
                      <p className="text-[11px] font-bold text-red-400">{fmt(stats?.totalRepasses || 0)}</p>
                   </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                   <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: \`\${stats?.totalContratado ? (stats.totalRecebido / stats.totalContratado) * 100 : 0}%\` }} />
                   </div>
                   <span className="text-[8px] font-bold text-emerald-400 font-mono">{stats?.totalContratado ? Math.round((stats.totalRecebido / stats.totalContratado) * 100) : 0}%</span>
                </div>
             </div>
           </div>

           <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm shrink-0">
             <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Últimos Lançamentos</h3>
                <button onClick={() => setTab('financeiro')} className="text-[8px] uppercase font-bold text-primary hover:underline opacity-0">Ver Tudo</button>
             </div>
             <div className="space-y-2">
                {processo.financeiro?.slice(0,3).map((f:any) => (
                  <div key={f.id} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg group">
                     <div>
                        <p className="text-[10px] font-bold text-slate-800">{f.descricao}</p>
                        <p className="text-[8px] text-slate-400 font-mono">{new Date(f.data_vencimento || f.createdAt).toLocaleDateString('pt-BR')} • {f.status}</p>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className={\`text-[10px] font-bold \${f.tipo === 'receita' ? 'text-emerald-600' : 'text-red-500'}\`}>
                           {f.tipo === 'receita' ? '+' : '-'}{fmt(f.valor)}
                        </span>
                        <button onClick={() => handleDeleteFinanceiro(f.id, f.descricao)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"><Trash2 size={10}/></button>
                     </div>
                  </div>
                ))}
             </div>
           </div>

           <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex-1 flex flex-col min-h-[250px]">
             <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3 shrink-0">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest font-mono">
                  <FileText size={14} className="text-slate-500" /> Repositório (Docs)
                </div>
                <button onClick={() => { setDocumentoToEdit(null); setIsDocumentoModalOpen(true) }} className="p-1 hover:bg-slate-100 rounded text-slate-400 transition-colors"><Plus size={14}/></button>
             </div>
             <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                {processo.documentos?.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group">
                     <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm shrink-0">
                           {d.url.startsWith('http') ? <LinkIcon size={12}/> : <FileText size={12}/>}
                        </div>
                        <div className="min-w-0">
                           <p className="text-[10px] font-bold text-slate-800 truncate uppercase">{d.nome}</p>
                           <p className="text-[8px] font-medium text-slate-400 uppercase">{d.categoria} • {d.status}</p>
                        </div>
                     </div>
                     <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={d.url} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-white rounded shadow-sm text-slate-400 hover:text-primary"><ExternalLink size={10}/></a>
                        <button onClick={() => handleDeleteDocumento(d.id, d.nome)} className="p-1.5 hover:bg-white rounded shadow-sm text-slate-400 hover:text-red-500"><Trash2 size={10}/></button>
                     </div>
                  </div>
                ))}
                {(!processo.documentos || processo.documentos.length === 0) && (
                  <div className="text-center py-6 opacity-50">
                    <FileText size={20} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Nenhum anexo</p>
                  </div>
                )}
             </div>
           </div>

        </div>

      </div>
\n`;

const finalContent = content.substring(0, startIndex) + newLayout + content.substring(endIndex);
fs.writeFileSync(filePath, finalContent);
console.log('Successfully applied new Command Center Layout!');
