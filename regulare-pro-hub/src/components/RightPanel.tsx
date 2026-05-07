// src/components/RightPanel.tsx

'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

/**
 * RightPanel - contextual information panel (details, notes, finance, etc.)
 * It slides in from the right and overlays the main content on small screens.
 */
export default function RightPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  // Example placeholder content – can be populated by context providers later
  return (
    <aside
      className={`fixed inset-y-0 right-0 z-40 w-[320px] max-w-full bg-slate-900/90 backdrop-blur-lg border-l border-white/5 shadow-2xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <h2 className="text-sm font-black uppercase text-white tracking-wider">
          Contextual Panel
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      <div className="p-4 overflow-y-auto h-full">
        <p className="text-xs text-slate-400">
          Here you can render details, notes, finance summaries or any contextual information
          related to the selected record. This area will be populated via React Context or
          component props from individual pages.
        </p>
      </div>
    </aside>
  );
}
