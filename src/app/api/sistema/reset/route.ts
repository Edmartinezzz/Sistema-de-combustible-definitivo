import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ejecutarResetDiario } from '@/lib/resetDiario';

// POST: Ejecutar el reset diario
export async function POST() {
  try {
    const ejecutado = await ejecutarResetDiario();

    return NextResponse.json({
      message: ejecutado ? 'Reset diario completado' : 'Reset ya realizado hoy',
      reset: ejecutado
    });

  } catch (error: any) {
    console.error('Error en reset diario:', error);
    return NextResponse.json(
      { error: 'Error al ejecutar reset diario', details: error.message },
      { status: 500 }
    );
  }
}

// GET: Verificar estado del reset (diagnóstico)
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
      retiros_bloqueados: config?.retiros_bloqueados ?? 0
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
