import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Obtener el estado de ambos tanques (Gasolina y Gasoil)
export async function GET() {
  try {
    const { data: inventario, error } = await supabaseAdmin
      .from('inventario')
      .select('*');

    if (error) throw error;

    // Retornamos un objeto con ambos tipos para facilidad del frontend
    const gasolina = inventario.find(i => i.tipo_combustible === 'Gasolina');
    const gasoil = inventario.find(i => i.tipo_combustible === 'Gasoil');

    return NextResponse.json({ gasolina, gasoil });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al obtener inventario', details: error.message },
      { status: 500 }
    );
  }
}

// Actualizar o Crear cantidad en los tanques
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { tipo, cantidad_actual, capacidad_total } = body;

    if (!['Gasolina', 'Gasoil'].includes(tipo)) {
      return NextResponse.json({ error: 'Tipo de combustible inválido' }, { status: 400 });
    }

    // Usamos upsert para que cree el registro si no existe
    const { data, error } = await supabaseAdmin
      .from('inventario')
      .upsert({
        tipo_combustible: tipo,
        cantidad_actual: parseFloat(cantidad_actual),
        capacidad_total: parseFloat(capacidad_total)
      }, { onConflict: 'tipo_combustible' })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Error al actualizar inventario', 
      details: error.message 
    }, { status: 500 });
  }
}
