import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Registrar un nuevo retiro (Despacho)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cliente_id, cantidad, placa, registrado_por } = body;

    // 1. Obtener datos del cliente y del inventario actual
    const { data: cliente } = await supabaseAdmin.from('clientes').select('*').eq('id', cliente_id).single();
    const { data: inventario } = await supabaseAdmin.from('inventario').select('*').eq('tipo_combustible', 'Gas GLP').single();

    if (!cliente || !inventario) {
      return NextResponse.json({ error: 'Cliente o Inventario no encontrado' }, { status: 404 });
    }

    // 2. Verificar cupo y stock
    const cantidadNum = parseFloat(cantidad);
    if ((cliente.cupo_consumido + cantidadNum) > cliente.cupo_mensual) {
      return NextResponse.json({ error: 'El cliente no tiene cupo suficiente' }, { status: 400 });
    }
    if (inventario.cantidad_actual < cantidadNum) {
      return NextResponse.json({ error: 'No hay suficiente combustible en inventario' }, { status: 400 });
    }

    // 3. Realizar la transacción (Retiro + Actualización de Cupo + Actualización de Stock)
    const { error: retiroError } = await supabaseAdmin.from('retiros').insert([{
      cliente_id,
      cantidad: cantidadNum,
      placa,
      registrado_por,
      fecha: new Date().toISOString()
    }]);

    if (retiroError) throw retiroError;

    // Actualizar cliente
    await supabaseAdmin.from('clientes').update({
      cupo_consumido: cliente.cupo_consumido + cantidadNum
    }).eq('id', cliente_id);

    // Actualizar inventario
    await supabaseAdmin.from('inventario').update({
      cantidad_actual: inventario.cantidad_actual - cantidadNum
    }).eq('tipo_combustible', 'Gas GLP');

    return NextResponse.json({ success: true, message: 'Despacho registrado con éxito' });

  } catch (error: any) {
    return NextResponse.json({ error: 'Error al registrar retiro', details: error.message }, { status: 500 });
  }
}

// Obtener historial de retiros
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('retiros')
      .select('*, clientes(nombre)')
      .order('fecha', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al obtener retiros' }, { status: 500 });
  }
}
