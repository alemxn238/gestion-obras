'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function NuevoPartePage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [misObras, setMisObras] = useState<string[]>([]);
  const [obraId, setObraId] = useState('');
  const [nuevaObraInput, setNuevaObraInput] = useState('');
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);

  // 1. Verificar sesión del trabajador y obtener solo SUS obras asignadas
  useEffect(() => {
    async function inicializarTrabajador() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Redirigir al inicio de sesión si no hay usuario autenticado
        router.push('/login');
        return;
      }

      setUserId(user.id);

      // Consultar únicamente los partes de obras creadas por este trabajador
      const { data, error } = await supabase
        .from('daily_logs')
        .select('obra_id')
        .eq('user_id', user.id);

      if (!error && data) {
        // Filtrar obras únicas asignadas a este trabajador
        const unicas = Array.from(new Set(data.map((item) => item.obra_id))).filter(Boolean);
        setMisObras(unicas);
        if (unicas.length > 0) {
          setObraId(unicas[0]);
        } else {
          setObraId('nueva');
        }
      } else {
        setObraId('nueva');
      }

      setLoadingPage(false);
    }

    inicializarTrabajador();
  }, [router]);

  // Manejador de cierre de sesión
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // 2. Enviar el parte diario asignado obligatoriamente al trabajador activo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!userId) {
        alert('Debes estar autenticado para publicar un parte.');
        router.push('/login');
        return;
      }

      // Determinar la obra seleccionada o la nueva creada
      const targetObraId = obraId === 'nueva' ? nuevaObraInput.trim() : obraId;

      if (!targetObraId) {
        alert('Por favor, especifica un código o nombre de obra.');
        setLoading(false);
        return;
      }

      const photoUrls: string[] = [];

      // Subida de imágenes al bucket
      if (files) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
          const filePath = `${targetObraId}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('obras-media')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from('obras-media')
            .getPublicUrl(filePath);

          photoUrls.push(publicUrlData.publicUrl);
        }
      }

      // Guardar en la base de datos vinculando el user_id
      const { error: insertError } = await supabase.from('daily_logs').insert([
        {
          obra_id: targetObraId,
          room_name: roomName,
          description: description,
          photos_urls: photoUrls,
          user_id: userId, // Garantiza el aislamiento por trabajador
        },
      ]);

      if (insertError) throw insertError;

      alert('Parte publicado correctamente');
      
      // Limpiar formulario o actualizar lista de sus obras
      if (!misObras.includes(targetObraId)) {
        setMisObras([...misObras, targetObraId]);
      }
      setObraId(targetObraId);
      setRoomName('');
      setDescription('');
      setFiles(null);
    } catch (error: any) {
      alert('Error al guardar el parte: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6 flex items-center justify-center">
        <p className="text-slate-400">Verificando sesión del trabajador...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold">Panel de Trabajador</h1>
        <button
          onClick={handleLogout}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Desplegable limitado a SUS obras */}
        <div>
          <label className="block text-sm font-medium mb-1">Tus Obras Asignadas</label>
          <select
            value={obraId}
            onChange={(e) => setObraId(e.target.value)}
            className="w-full p-3 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {misObras.map((obra) => (
              <option key={obra} value={obra}>
                {obra}
              </option>
            ))}
            <option value="nueva">+ Asignar/Crear nueva obra...</option>
          </select>

          {obraId === 'nueva' && (
            <input
              type="text"
              required
              placeholder="Código o nombre de la obra"
              value={nuevaObraInput}
              onChange={(e) => setNuevaObraInput(e.target.value)}
              className="w-full p-3 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
            />
          )}
        </div>

        {/* Estancia */}
        <div>
          <label className="block text-sm font-medium mb-1">Estancia / Habitación</label>
          <input
            type="text"
            required
            placeholder="Ej. Salón, Baño principal"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full p-3 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium mb-1">Descripción del trabajo</label>
          <textarea
            required
            rows={4}
            placeholder="Describe los avances del día..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Imágenes */}
        <div>
          <label className="block text-sm font-medium mb-1">Fotografías de la obra</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setFiles(e.target.files)}
            className="w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
          />
        </div>

        {/* Envío */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 font-bold rounded transition-colors disabled:opacity-50 mt-4"
        >
          {loading ? 'Subiendo datos y fotos...' : 'Publicar Parte'}
        </button>
      </form>
    </div>
  );
}