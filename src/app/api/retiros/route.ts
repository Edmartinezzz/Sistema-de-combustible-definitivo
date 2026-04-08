import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cliente_id, cantidad, placa, registrado_por, tipo_combustible } = body;

    if (!['Gasolina', 'Gasoil'].includes(tipo_combustible)) {
      return NextResponse.json({ error: 'Tipo de combustible inválido' }, { status: 400 });
    }

    // 1. Obtener datos del cliente y del inventario específico
    const { data: cliente } = await supabaseAdmin.from('clientes').select('*').eq('id', cliente_id).single();
    const { data: inventario } = await supabaseAdmin.from('inventario').select('*').eq('tipo_combustible', tipo_combustible).single();

    if (!cliente || !inventario) {
      return NextResponse.json({ error: 'Datos no encontrados' }, { status: 404 });
    }

    const cantidadNum = parseFloat(cantidad);
    
    // 2. Determinar qué cupo y consumo usar
    const cupoDisponible = tipo_combustible === 'Gasolina' 
      ? cliente.cupo_gasolina - cliente.consumo_gasolina 
      : cliente.cupo_gasoil - cliente.consumo_gasoil;

    // 3. Validar cupo del cliente y stock del tanque general
    if (cantidadNum > cupoDisponible) {
      return NextResponse.json({ error: `Cupo de ${tipo_combustible} insuficiente` }, { status: 400 });
    }
    if (inventario.cantidad_actual < cantidadNum) {
      return NextResponse.json({ error: `Tanque general de ${tipo_combustible} insuficiente` }, { status: 400 });
    }

    // 4. Registrar la transacción
    const { error: retiroError } = await supabaseAdmin.from('retiros').insert([{
      cliente_id,
      cantidad: cantidadNum,
      placa,
      registrado_por,
      tipo_combustible,
      fecha: new Date().toISOString()
    }]);

    if (retiroError) throw retiroError;

    // 5. Actualizar consumo del cliente
    if (tipo_combustible === 'Gasolina') {
      await supabaseAdmin.from('clientes').update({
        consumo_gasolina: cliente.consumo_gasolina + cantidadNum
      }).eq('id', cliente_id);
    } else {
      await supabaseAdmin.from('clientes').update({
        consumo_gasoil: cliente.consumo_gasoil + cantidadNum
      }).eq('id', cliente_id);
    }

    // 6. Actualizar inventario (Reserva General)
    await supabaseAdmin.from('inventario').update({
      cantidad_actual: inventario.cantidad_actual - cantidadNum
    }).eq('tipo_combustible', tipo_combustible);

    return NextResponse.json({ success: true, message: 'Despacho registrado correctamente' });

  } catch (error: any) {
    return NextResponse.json({ error: 'Error al procesar despacho', details: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('retiros')
      .select('*, clientes(nombre)')
      .order('fecha', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al obtener historial' }, { status: 500 });
  }
}
