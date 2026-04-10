import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Obtener detalles públicos de un retiro para verificación de ticket
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: retiro, error } = await supabaseAdmin
      .from('retiros')
      .select('*, clientes(*, entidades(*))')
      .eq('id', id)
      .single();

    if (error || !retiro) {
      return NextResponse.json({ error: 'Ticket no encontrado o inválido' }, { status: 404 });
    }

    return NextResponse.json(retiro);
  } catch (error) {
    return NextResponse.json({ error: 'Error al consultar el ticket' }, { status: 500 });
  }
}
