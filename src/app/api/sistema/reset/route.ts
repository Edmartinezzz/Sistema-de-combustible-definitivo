import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Este endpoint reinicia los consumos diarios de clientes y entidades.
// Se llama automáticamente en cada login de admin.
export async function POST() {
  try {
    const hoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // 1. Verificar si ya se hizo el reset hoy
    const { data: config, error: configError } = await supabaseAdmin
      .from('sistema_config')
      .select('fecha_ultimo_reset')
      .eq('id', 1)
      .single();

    if (configError) {
      // Si no existe registro, crearlo
      await supabaseAdmin.from('sistema_config').upsert({
        id: 1,
        retiros_bloqueados: false,
        fecha_ultimo_reset: hoy
      });
      return NextResponse.json({ message: 'Config inicializada', reset: false });
    }

    const fechaUltimoReset = config?.fecha_ultimo_reset;

    // Si ya se reinició hoy, no hacer nada
    if (fechaUltimoReset === hoy) {
      return NextResponse.json({ message: 'Reset ya realizado hoy', reset: false });
    }

    // 2. Reiniciar consumos de todos los clientes
    const { error: clientesError } = await supabaseAdmin
      .from('clientes')
      .update({
        consumo_gasolina: 0,
        consumo_gasoil: 0
      })
      .eq('activo', true);

    if (clientesError) throw clientesError;

    // 3. Reiniciar consumos de todas las entidades
    const { error: entidadesError } = await supabaseAdmin
      .from('entidades')
      .update({
        consumo_gasolina: 0,
        consumo_gasoil: 0
      })
      .neq('id', 0); // Actualiza todos

    if (entidadesError) throw entidadesError;

    // 4. Actualizar la fecha del último reset
    await supabaseAdmin
      .from('sistema_config')
      .upsert({
        id: 1,
        fecha_ultimo_reset: hoy
      });

    console.log(`✅ Reset diario ejecutado: ${hoy}`);

    return NextResponse.json({
      message: 'Reset diario completado',
      reset: true,
      fecha: hoy
    });

  } catch (error: any) {
    console.error('Error en reset diario:', error);
    return NextResponse.json(
      { error: 'Error al ejecutar reset diario', details: error.message },
      { status: 500 }
    );
  }
}

// GET para verificar estado del reset (diagnóstico)
export async function GET() {
  try {
    const hoy = new Date().toISOString().split('T')[0];

    const { data: config } = await supabaseAdmin
      .from('sistema_config')
      .select('fecha_ultimo_reset, retiros_bloqueados')
      .eq('id', 1)
      .single();

    return NextResponse.json({
      hoy,
      fecha_ultimo_reset: config?.fecha_ultimo_reset || null,
      reset_realizado_hoy: config?.fecha_ultimo_reset === hoy,
      retiros_bloqueados: config?.retiros_bloqueados || false
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
