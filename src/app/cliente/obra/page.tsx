'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

interface DailyLog {
  id: string;
  obra_id: string;
  room_name: string;
  description: string;
  created_at: string;
}

export default function AdminObrasPage() {
  const [obras, setObras] = useState<string[]>([]);
  const [selectedObra, setSelectedObra] = useState<string>('');
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiado, setCopiado] = useState(false);

  // 1. Cargar la lista completa de obras distintas para el Administrador
  useEffect(() => {
    async function cargarObras() {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('obra_id');

      if (!error && data) {
        // Filtrar obras unicas
        const unicas = Array.from(new Set(data.map((item) => item.obra_id))).filter(Boolean);
        setObras(unicas);
        if (unicas.length > 0) {
          setSelectedObra(unicas[0]);
        }
      }
      setLoading(false);
    }

    cargarObras();
  }, []);

  // 2. Cargar partes de la obra seleccionada en el panel de administrador
  useEffect(() => {
    async function cargarPartes() {
      if (!selectedObra) return;

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
  }, [selectedObra]);

  // Generar enlace directo del cliente para copiarlo fácilmente
  const clienteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/cliente/obra/${selectedObra}`
    : '';

  const copiarEnlace = () => {
    navigator.clipboard.writeText(clienteUrl);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6 flex items-center justify-center">
        <p className="text-slate-400">Cargando Panel de Administrador...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 max-w-4xl mx-auto space-y-6">
      {/* Encabezado Admin */}
      <header className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-amber-400">Panel de Administrador</h1>
          <p className="text-sm text-slate-400">Gestión global de obras y partes diarios</p>
        </div>
        <Link
          href="/trabajador/nuevo-parte"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition-colors text-center"
        >
          + Crear Nuevo Parte
        </Link>
      </header>

      {/* Selector de Obras global */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 space-y-4">
        <label className="block text-sm font-medium text-slate-300">
          Seleccionar Obra para inspeccionar:
        </label>
        <select
          value={selectedObra}
          onChange={(e) => setSelectedObra(e.target.value)}
          className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
        >
          {obras.map((obra) => (
            <option key={obra} value={obra}>
              {obra}
            </option>
          ))}
        </select>

        {/* Herramienta para copiar el link unico del cliente */}
        {selectedObra && (
          <div className="pt-2 border-t border-slate-700 flex flex-col sm:flex-row items-sm-center justify-between gap-3 text-sm">
            <span className="text-slate-400 truncate">
              Enlace directo del cliente: <code className="text-blue-400">{clienteUrl}</code>
            </span>
            <button
              onClick={copiarEnlace}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-semibold shrink-0 transition-colors"
            >
              {copiado ? '✓ ¡Copiado!' : 'Copiar Enlace para Cliente'}
            </button>
          </div>
        )}
      </div>

      {/* Listado de partes de la obra seleccionada */}
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
    </div>
  );
}