'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';

interface DailyLog {
  id: string;
  room_name: string;
  description: string;
  photos_urls: string[];
  created_at: string;
  obra_id: string;
}

export default function ObraClientePage() {
  const params = useParams();
  const obraId = params.obraId as string;
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      if (!obraId) return;

      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('obra_id', obraId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error cargando partes:', error);
      } else {
        setLogs(data || []);
      }
      setLoading(false);
    }

    fetchLogs();
  }, [obraId]);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 max-w-2xl mx-auto">
      <header className="mb-8 border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-bold">Estado de la Obra</h1>
        <p className="text-slate-400 text-sm mt-1">
          Código de obra: <span className="font-mono text-blue-400">{obraId}</span>
        </p>
      </header>

      {loading ? (
        <p className="text-slate-400">Cargando partes de la obra...</p>
      ) : logs.length === 0 ? (
        <p className="text-slate-400">No hay partes publicados para esta obra aún.</p>
      ) : (
        <div className="space-y-6">
          {logs.map((log) => (
            <div key={log.id} className="bg-slate-800 border border-slate-700 rounded-lg p-5 shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <span className="bg-blue-600 text-xs px-2.5 py-1 rounded font-semibold uppercase">
                  {log.room_name}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(log.created_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-slate-200 mb-4 whitespace-pre-wrap">{log.description}</p>
              
              {log.photos_urls && log.photos_urls.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {log.photos_urls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-40 object-cover rounded-md border border-slate-700 hover:opacity-90 transition-opacity cursor-pointer"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}