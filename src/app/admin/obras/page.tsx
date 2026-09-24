'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

// 🔑 CAMBIA ESTA CONTRASEÑA POR LA QUE TÚ QUIERAS
const ADMIN_PASSWORD = 'admin123';

interface DailyLog {
  id: string;
  obra_id: string;
  room_name: string;
  description: string;
  created_at: string;
}

export default function AdminObrasPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [obras, setObras] = useState<string[]>([]);
  const [selectedObra, setSelectedObra] = useState<string>('');
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiado, setCopiado] = useState(false);

  // Comprobar si ya había iniciado sesión previamente
  useEffect(() => {
    const isAuth = sessionStorage.getItem('admin_authenticated');
    if (isAuth === 'true') {
      setAuthenticated(true);
    }
  }, []);

  // Cargar obras solo cuando está autenticado
  useEffect(() => {
    if (!authenticated) return;

    async function cargarObras() {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('obra_id');

      if (!error && data) {
        const unicas = Array.from(new Set(data.map((item) => item.obra_id))).filter(Boolean);
        setObras(unicas);
        if (unicas.length > 0) {
          setSelectedObra(unicas[0]);
        }
      }
      setLoading(false);
    }

    cargarObras();
  }, [authenticated]);

  // Cargar partes de la obra seleccionada
  useEffect(() => {
    if (!authenticated || !selectedObra) return;

    async function cargarPartes() {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('obra_id', selectedObra)
        .order('created_at', { ascending: false });

      if (!error) {
        setLogs(data || []);
      }
    }

    cargarPartes();
  }, [authenticated, selectedObra]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_authenticated', 'true');
      setAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    setAuthenticated(false);
    setPasswordInput('');
  };

  const clienteUrl = typeof window !== 'undefined' && selectedObra
    ? `${window.location.origin}/cliente/obra/${selectedObra}`
    : '';

  const copiarEnlace = () => {
    navigator.clipboard.writeText(clienteUrl);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // PANTALLA DE ACCESO / CONTRASEÑA
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-sm w-full space-y-5 shadow-2xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-amber-400">Acceso Administrador</h1>
            <p className="text-xs text-slate-400 mt-1">Introduce la contraseña para ver todas las obras</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Contraseña Admin</label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              autoFocus
            />
            {passwordError && (
              <p className="text-red-400 text-xs mt-2">Contraseña incorrecta.</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition-colors"
          >
            Entrar al Panel
          </button>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-slate-400 hover:underline">
              ← Volver al Inicio
            </Link>
          </div>
        </form>
      </div>
    );
  }

  // PANTALLA DEL PANEL ADMIN
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 max-w-4xl mx-auto space-y-6">
      <header className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-amber-400">Panel de Administrador</h1>
          <p className="text-sm text-slate-400">Gestión global de obras y enlaces privados</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/trabajador/nuevo-parte"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition-colors"
          >
            + Nuevo Parte
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-sm transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando datos de obras...</div>
      ) : (
        <>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 space-y-4">
            <label className="block text-sm font-medium text-slate-300">
              Seleccionar Obra para inspeccionar:
            </label>
            <select
              value={selectedObra}
              onChange={(e) => setSelectedObra(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {obras.length === 0 ? (
                <option value="">No hay obras registradas</option>
              ) : (
                obras.map((obra) => (
                  <option key={obra} value={obra}>
                    {obra}
                  </option>
                ))
              )}
            </select>

            {selectedObra && (
              <div className="pt-2 border-t border-slate-700 flex flex-col sm:flex-row items-sm-center justify-between gap-3 text-sm">
                <span className="text-slate-400 truncate">
                  Enlace privado del cliente: <code className="text-blue-400">{clienteUrl}</code>
                </span>
                <button
                  onClick={copiarEnlace}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded text-xs font-bold shrink-0 transition-colors"
                >
                  {copiado ? '✓ ¡Copiado!' : 'Copiar Enlace para Cliente'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-200">
              Historial de avances ({logs.length})
            </h2>

            {logs.length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 text-center text-slate-400">
                No hay partes registrados en esta obra.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span className="font-semibold text-white text-base">{log.room_name}</span>
                    <span>{new Date(log.created_at).toLocaleString('es-ES')}</span>
                  </div>
                  <p className="text-slate-300 text-sm whitespace-pre-line">{log.description}</p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}