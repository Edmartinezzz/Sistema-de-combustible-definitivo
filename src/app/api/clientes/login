import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { ejecutarResetDiario } from '@/lib/resetDiario';

const SECRET_KEY = process.env.SECRET_KEY || 'gas-despacho-2026-premium-secret';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cedula, contrasena } = body;

    if (!cedula || !contrasena) {
      return NextResponse.json(
        { error: 'Se requieren cédula y contraseña' },
        { status: 400 }
      );
    }

    // Buscar cliente por cédula
    const { data: cliente, error } = await supabaseAdmin
      .from('clientes')
      .select('*, entidades(*)')
      .eq('cedula', cedula)
      .eq('activo', true)
      .single();

    if (error || !cliente) {
      return NextResponse.json(
        { error: 'Cédula o contraseña incorrecta' },
        { status: 401 }
      );
    }

    // Verificar que el cliente tiene contraseña configurada
    if (!cliente.password) {
      return NextResponse.json(
        { error: 'Este usuario no tiene contraseña configurada. Contacte al administrador.' },
        { status: 401 }
      );
    }

    // Validar contraseña con bcrypt
    const passMatch = await bcrypt.compare(contrasena, cliente.password);
    if (!passMatch) {
      return NextResponse.json(
        { error: 'Cédula o contraseña incorrecta' },
        { status: 401 }
      );
    }

    // Generar token
    const token = jwt.sign(
      { id: cliente.id, role: 'cliente', nombre: cliente.nombre },
      SECRET_KEY,
      { expiresIn: '8h' }
    );

    // Disparar reset diario automático
    ejecutarResetDiario().catch(console.error);

    // Omitir el hash de la contraseña en la respuesta
    const { password, ...clienteSeguro } = cliente;

    return NextResponse.json({
      token,
      cliente: clienteSeguro,
      usuario: {
        id: cliente.id,
        nombre: cliente.nombre,
        rol: 'cliente',
        entidad: cliente.entidades?.nombre || 'Particular'
      }
    });

  } catch (error: any) {
    console.error('Error en Login Cliente:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
