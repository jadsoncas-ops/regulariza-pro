import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AppSidebar from '@/components/layout/AppSidebar'

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-sans',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'Regulariza Pro | Gestão de Regularização Imobiliária',
  description: 'SaaS profissional para gestão de processos de regularização imobiliária, engenharia e arquitetura.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased bg-[hsl(var(--background))] text-slate-900 overflow-hidden`}>
        <div className="flex h-screen">
          <AppSidebar />
          <main className="flex-1 overflow-y-auto scrollbar-thin">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
