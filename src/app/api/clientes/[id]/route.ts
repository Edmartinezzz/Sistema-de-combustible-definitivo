import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { data, error } = await supabaseAdmin
      .from('clientes')
      .select('*, entidades(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al obtener cliente', details: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { 
      nombre, 
      cedula, 
      telefono, 
      cupo_gasolina, 
      cupo_gasoil, 
      entidad_id, 
      vehiculo, 
      placa, 
      password 
    } = body;

    const updates: any = {
      nombre,
      cedula,
      telefono,
      vehiculo,
      placa,
      cupo_gasolina: parseFloat(cupo_gasolina || 0),
      cupo_gasoil: parseFloat(cupo_gasoil || 0),
      entidad_id: entidad_id || null
    };

    // Si envían una nueva contraseña, la actualizamos
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    const { data, error } = await supabaseAdmin
      .from('clientes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al actualizar cliente', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { error } = await supabaseAdmin
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ message: 'Cliente eliminado correctamente' });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al eliminar cliente', details: error.message },
      { status: 500 }
    );
  }
}
