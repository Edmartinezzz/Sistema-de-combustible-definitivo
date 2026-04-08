import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

// Obtener todos los clientes (con sus entidades vinculadas)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('clientes')
      .select('*, entidades(*)')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al obtener clientes' }, { status: 500 });
  }
}

// Registrar nuevo cliente con cuotas duales, vehículo y seguridad
export async function POST(request: Request) {
  try {
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

    // Encriptar la contraseña antes de guardar
    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const { data, error } = await supabaseAdmin
      .from('clientes')
      .insert([{
        nombre,
        cedula,
        telefono,
        vehiculo,
        placa,
        password: hashedPassword,
        cupo_gasolina: parseFloat(cupo_gasolina || 0),
        consumo_gasolina: 0,
        cupo_gasoil: parseFloat(cupo_gasoil || 0),
        consumo_gasoil: 0,
        entidad_id: entidad_id || null
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
