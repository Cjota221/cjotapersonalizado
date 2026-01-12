'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const supabase = createClient()
      
      // Tentar fazer login no Supabase Auth
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (signInError) {
        console.error('Erro de login:', signInError)
        
        // Mensagens de erro mais amigáveis
        if (signInError.message.includes('Invalid login credentials')) {
          setError('E-mail ou senha incorretos. Verifique suas credenciais.')
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('E-mail não confirmado. Verifique sua caixa de entrada.')
        } else {
          setError(signInError.message)
        }
        setLoading(false)
        return
      }
      
      if (data.user) {
        console.log('Login bem-sucedido:', data.user.email)
        // Redirecionar para o dashboard
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      console.error('Erro inesperado:', err)
      setError('Erro ao fazer login. Tente novamente.')
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CJota Sistema</h1>
          <p className="text-gray-600">Pedidos por Encomenda</p>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Entrar no Painel</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="form-label">E-mail</label>
              <input 
                type="email" 
                className="form-input" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
              />
            </div>
            
            <div>
              <label className="form-label">Senha</label>
              <input 
                type="password" 
                className="form-input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
                autoComplete="current-password"
              />
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-gray-600">Lembrar de mim</span>
              </label>
              <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
                Esqueci a senha
              </a>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar no Painel'}
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Credenciais de demonstração:
            </p>
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-mono text-gray-700">Email: carolineazevedo075@gmail.com</p>
              <p className="text-xs font-mono text-gray-700 mt-1">Senha: Cjota@015</p>
            </div>
          </div>
        </div>
        
        <p className="text-center text-sm text-gray-600 mt-6">
          © 2026 CJota Sistema. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}
