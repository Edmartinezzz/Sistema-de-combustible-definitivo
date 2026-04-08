import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Obtener todos los clientes
export async function GET() {
  try {
    const { data: clientes, error } = await supabaseAdmin
      .from('clientes')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;

    return NextResponse.json(clientes);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al obtener clientes', details: error.message },
      { status: 500 }
    );
  }
}

// Registrar un nuevo cliente
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, cedula, telefono, cupo_mensual } = body;

    const { data: newCliente, error } = await supabaseAdmin
      .from('clientes')
      .insert([
        { 
          nombre, 
          cedula, 
          telefono, 
          cupo_mensual: parseFloat(cupo_mensual),
          cupo_consumido: 0,
          activo: true
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(newCliente);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al crear cliente', details: error.message },
      { status: 500 }
    );
  }
}
