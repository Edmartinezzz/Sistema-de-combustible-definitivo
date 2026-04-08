import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Obtener todos los clientes
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('clientes')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al obtener clientes' }, { status: 500 });
  }
}

// Registrar nuevo cliente con cuotas duales
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, cedula, telefono, cupo_gasolina, cupo_gasoil } = body;

    const { data, error } = await supabaseAdmin
      .from('clientes')
      .insert([{
        nombre,
        cedula,
        telefono,
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
      { error: 'Error al crear cliente', details: error.message },
      { status: 500 }
    );
  }
}
