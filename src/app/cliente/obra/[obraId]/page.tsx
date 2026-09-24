'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function BuscarObraPage() {
  const [obras, setObras] = useState<string[]>([]);
  const [selectedObra, setSelectedObra] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchObras() {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('obra_id');

      if (!error && data) {
        const unicas = Array.from(new Set(data.map((item) => item.obra_id)));
        setObras(unicas);
        if (unicas.length > 0) setSelectedObra(unicas[0]);
      }
      setLoading(false);
    }

    fetchObras();
  }, []);

  const handleAcceder = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedObra.trim()) {
      router.push(`/cliente/obra/${selectedObra.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 p-6 rounded-lg border border-slate-700 text-center shadow-xl">
        <h1 className="text-2xl font-bold mb-2">Acceso a tu Obra</h1>
        <p className="text-slate-400 text-sm mb-6">
          Selecciona una obra activa de la lista para ver el seguimiento diario.
        </p>

        {loading ? (
          <p className="text-slate-400">Cargando obras activas...</p>
        ) : (
          <form onSubmit={handleAcceder} className="space-y-4">
            {obras.length > 0 ? (
              <div>
                <label className="block text-left text-xs text-slate-400 mb-1">
                  Obras en curso
                </label>
                <select
                  value={selectedObra}
                  onChange={(e) => setSelectedObra(e.target.value)}
                  className="w-full p-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {obras.map((obra) => (
                    <option key={obra} value={obra}>
                      {obra}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  required
                  placeholder="Ej. chalet-torrent"
                  value={selectedObra}
                  onChange={(e) => setSelectedObra(e.target.value)}
                  className="w-full p-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 font-bold rounded transition-colors"
            >
              Ver Seguramiento de Obra
            </button>
          </form>
        )}
      </div>
    </div>
  );
}