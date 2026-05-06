import { redirect } from 'next/navigation'

export default function RootPage() {
  // Redireciona para o novo Dashboard Kanban por padrão
  redirect('/dashboard')
}
