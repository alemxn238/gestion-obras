import { supabase } from './supabase';

export async function getObrasActivas(): Promise<string[]> {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('obra_id');

  if (error || !data) {
    console.error('Error al obtener obras:', error);
    return [];
  }

  // Extraer valores únicos de obra_id
  const obrasUnicas = Array.from(new Set(data.map((item) => item.obra_id)));
  return obrasUnicas;
}