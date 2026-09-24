'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Inicio de sesión para el trabajador
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Error al iniciar sesión: ' + error.message);
    } else {
      router.push('/trabajador/nuevo-parte');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
      <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-xl border border-slate-700 max-w-sm w-full space-y-5 shadow-2xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-400">Acceso Trabajadores</h1>
          <p className="text-xs text-slate-400 mt-1">Introduce tus datos para acceder a tus obras</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Correo electrónico</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Contraseña</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 font-bold rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Iniciando sesión...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}