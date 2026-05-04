import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AppSidebar from '@/components/layout/AppSidebar'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Regulariza Pro',
  description: 'SaaS para Gestão de Regularização Imobiliária',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="light">
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground overflow-hidden`}>
        <div className="flex h-screen bg-background relative selection:bg-primary/30 selection:text-primary-foreground">
          <AppSidebar />
          <div className="flex-1 flex flex-col h-screen overflow-y-auto relative z-0 smooth-transition">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
