import { AlertTriangle, X } from 'lucide-react'

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  loading,
  description
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  loading?: boolean
  description?: React.ReactNode
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">{title}</h2>
          <div className="text-sm text-slate-600 space-y-2">
            {description}
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Excluindo...' : title.includes('Excluir') ? title : `Excluir ${title}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
