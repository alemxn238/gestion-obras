import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
            Gestión de Obras
          </h1>
          <p className="text-slate-400 text-sm">
            Plataforma de comunicación diaria entre trabajadores y clientes.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <Link
            href="/trabajador/nuevo-parte"
            className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors"
          >
            Panel del Trabajador (Nuevo Parte)
          </Link>

          <Link
            href="/cliente/obra"
            className="w-full flex items-center justify-center px-6 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold rounded-lg transition-colors"
          >
            Vista del Cliente (Línea de Tiempo)
          </Link>
        </div>
      </div>
    </main>
  );
}