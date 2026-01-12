import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          CJota Personalizado
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Sistema de Catálogo Online Personalizado
        </p>

        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="block w-full px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            Acessar Dashboard
          </Link>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              Exemplo de loja (substitua pelo slug da sua loja):
            </p>
            <Link
              href="/boutique-carol"
              className="block w-full px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              Ver Loja de Exemplo
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Sistema completo de catálogo com integração WhatsApp
          </p>
        </div>
      </div>
    </div>
  );
}
