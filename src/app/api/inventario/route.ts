import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: inventario, error } = await supabaseAdmin
      .from('inventario')
      .select('*')
      .eq('tipo_combustible', 'Gas GLP')
      .single();

    if (error) throw error;

    return NextResponse.json(inventario);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al obtener inventario', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { cantidad_actual, capacidad_total } = body;

    const { data, error } = await supabaseAdmin
      .from('inventario')
      .update({
        cantidad_actual: parseFloat(cantidad_actual),
        capacidad_total: parseFloat(capacidad_total)
      })
      .eq('tipo_combustible', 'Gas GLP')
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al actualizar inventario' }, { status: 500 });
  }
}
