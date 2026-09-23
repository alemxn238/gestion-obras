'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function NuevoPartePage({ params }: { params: { projectId: string } }) {
  const [description, setDescription] = useState('');
  const [roomName, setRoomName] = useState('General');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let photoUrl = '';

      // 1. Subir la imagen al storage de Supabase
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data, error: uploadError } = await supabase.storage
          .from('obras-media')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('obras-media')
          .getPublicUrl(fileName);
        
        photoUrl = urlData.publicUrl;
      }

      // 2. Guardar el registro en la base de datos
      const { error: dbError } = await supabase.from('daily_logs').insert({
        project_id: params.projectId,
        room_name: roomName,
        description,
        photos_urls: photoUrl ? [photoUrl] : [],
      });

      if (dbError) throw dbError;

      // 3. Disparar webhook para notificación por WhatsApp
      await fetch('/api/notifications/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: params.projectId,
          message: `Nuevo avance en ${roomName}: ${description}`
        }),
      });

      alert('Parte diario registrado correctamente');
    } catch (error) {
      console.error(error);
      alert('Error al guardar el avance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Registrar Parte Diario</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Estancia</label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Ej. Cocina, Baño"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">¿Qué se ha hecho hoy?</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded h-24"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Foto del avance</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full border p-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
        >
          {loading ? 'Guardando...' : 'Publicar Avance'}
        </button>
      </form>
    </div>
  );
}