'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

interface DailyLog {
  id: string;
  room_name: string;
  description: string;
  photos_urls: string[];
  created_at: string;
}

export default function ClienteObraPage() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error cargando partes de obra:', error);
      } else {
        setLogs(data || []);
      }
      setLoading(false);
    }

    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 max-w-3xl mx-auto">
      <header className="mb-8 border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white">Estado de la Obra</h1>
        <p className="text-sm text-slate-400">
          Línea de tiempo con los avances diarios y fotos de la reforma.
        </p>
      </header>

      {loading ? (
        <div className="text-center py-10 text-slate-400">Cargando actualizaciones...</div>
      ) : logs.length === 0 ? (
        <div className="bg-slate-800 p-6 rounded-lg shadow-sm text-center text-slate-400 border border-slate-700">
          Aún no se han registrado partes diarios para esta obra.
        </div>
      ) : (
        <div className="space-y-6">
          {logs.map((log) => (
            <div key={log.id} className="bg-slate-800 p-5 rounded-lg border border-slate-700 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="inline-block bg-blue-600 text-white text-xs px-2.5 py-1 rounded font-semibold">
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

              <p className="text-slate-200 text-sm mb-4 leading-relaxed">{log.description}</p>

              {log.photos_urls && log.photos_urls.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {log.photos_urls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Foto ${idx + 1} - ${log.room_name}`}
                      className="w-full h-40 object-cover rounded-md border border-slate-700"
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