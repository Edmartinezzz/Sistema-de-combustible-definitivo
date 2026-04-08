import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY || 'gas-despacho-2026-premium-secret';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, SECRET_KEY);

    if (decoded.role !== 'cliente') {
      return NextResponse.json({ error: 'Perfil inválido' }, { status: 403 });
    }

    // Obtener datos frescos del cliente y su entidad madre
    const { data: cliente, error } = await supabaseAdmin
      .from('clientes')
      .select('*, entidades(*)')
      .eq('id', decoded.id)
      .single();

    if (error || !cliente) {
      return NextResponse.json({ error: 'No se encontraron datos' }, { status: 404 });
    }

    // Omitir el hash de la contraseña por seguridad
    const { password, ...datosSeguros } = cliente;

    return NextResponse.json(datosSeguros);

  } catch (error) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
}
