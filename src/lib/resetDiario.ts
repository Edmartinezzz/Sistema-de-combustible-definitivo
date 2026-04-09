import { supabaseAdmin } from '@/lib/supabase';

/**
 * Ejecuta el reset diario de consumos si aún no se ha hecho hoy.
 * Retorna true si se ejecutó el reset, false si ya estaba hecho.
 */
export async function ejecutarResetDiario(): Promise<boolean> {
  try {
    const hoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // 1. Verificar si ya se hizo el reset hoy
    const { data: config } = await supabaseAdmin
      .from('sistema_config')
      .select('fecha_ultimo_reset')
      .eq('id', 1)
      .single();

    // Si ya se reinició hoy, no hacer nada
    if (config?.fecha_ultimo_reset === hoy) {
      return false;
    }

    // 2. Reiniciar consumos de todos los clientes activos
    await supabaseAdmin
      .from('clientes')
      .update({ consumo_gasolina: 0, consumo_gasoil: 0 })
      .eq('activo', true);

    // 3. Reiniciar consumos de todas las entidades
    await supabaseAdmin
      .from('entidades')
      .update({ consumo_gasolina: 0, consumo_gasoil: 0 })
      .gte('id', 1); // todos los registros

    // 4. Actualizar fecha del último reset (retiros_bloqueados es INTEGER en la BD)
    await supabaseAdmin
      .from('sistema_config')
      .upsert({ id: 1, fecha_ultimo_reset: hoy });

    console.log(`✅ Reset diario ejecutado: ${hoy}`);
    return true;

  } catch (error) {
    console.error('Error en reset diario:', error);
    return false;
  }
}
