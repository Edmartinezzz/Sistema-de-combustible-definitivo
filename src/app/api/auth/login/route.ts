import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY || 'gas-despacho-2026-premium-secret';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { usuario, contrasena } = body;

    if (!usuario || !contrasena) {
      return NextResponse.json(
        { error: 'Se requieren usuario y contraseña' },
        { status: 400 }
      );
    }

    // Consultar usuario en Supabase directamente
    const { data: user, error } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('usuario', usuario)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 401 }
      );
    }

    // Validación de contraseña (Texto plano según el sistema actual)
    if (user.contrasena !== contrasena) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    // Generar Token JWT
    const token = jwt.sign(
      {
        id: user.id,
        usuario: user.usuario,
        es_admin: user.es_admin,
      },
      SECRET_KEY,
      { expiresIn: '8h' }
    );

    return NextResponse.json({
      token,
      usuario: {
        id: user.id,
        usuario: user.usuario,
        nombre: user.nombre,
        es_admin: user.es_admin
      }
    });

  } catch (error: any) {
    console.error('Error en Login API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
