import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Obtener todas las entidades (Secretarías, Gobernación, etc)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('entidades')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al obtener entidades' }, { status: 500 });
  }
}

// Crear una nueva entidad/sub-categoría
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, cupo_gasolina, cupo_gasoil } = body;

    const { data, error } = await supabaseAdmin
      .from('entidades')
      .insert([{
        nombre,
        cupo_gasolina: parseFloat(cupo_gasolina || 0),
        consumo_gasolina: 0,
        cupo_gasoil: parseFloat(cupo_gasoil || 0),
        consumo_gasoil: 0
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al crear entidad', details: error.message },
      { status: 500 }
    );
  }
}

// Actualizar cupos de una entidad
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, cupo_gasolina, cupo_gasoil } = body;

    const { data, error } = await supabaseAdmin
      .from('entidades')
      .update({
        cupo_gasolina: parseFloat(cupo_gasolina),
        cupo_gasoil: parseFloat(cupo_gasoil)
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al actualizar entidad' }, { status: 500 });
  }
}
