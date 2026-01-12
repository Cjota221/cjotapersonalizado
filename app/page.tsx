import { redirect } from 'next/navigation'

export default function Home() {
  // Redirecionar direto para o login
  redirect('/login')
}
