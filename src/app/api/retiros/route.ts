import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Registrar un nuevo despacho con validación jerárquica
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cliente_id, cantidad, placa, registrado_por, tipo_combustible } = body;

    if (!['Gasolina', 'Gasoil'].includes(tipo_combustible)) {
      return NextResponse.json({ error: 'Tipo de combustible inválido' }, { status: 400 });
    }

    const cantidadNum = parseFloat(cantidad);

    // 1. Obtener datos del cliente (y su entidad vinculada)
    const { data: cliente } = await supabaseAdmin
      .from('clientes')
      .select('*, entidades(*)')
      .eq('id', cliente_id)
      .single();

    if (!cliente) {
      return NextResponse.json({ error: 'Beneficiario no encontrado' }, { status: 404 });
    }

    // 2. Obtener datos del inventario general (tanque)
    const { data: inventario } = await supabaseAdmin
      .from('inventario')
      .select('*')
      .eq('tipo_combustible', tipo_combustible)
      .single();

    if (!inventario) {
      return NextResponse.json({ error: 'Tanque general no configurado' }, { status: 404 });
    }

    // --- VALIDACIONES ---

    // A. Cupo del Cliente
    const dispCliente = tipo_combustible === 'Gasolina' 
      ? cliente.cupo_gasolina - cliente.consumo_gasolina 
      : cliente.cupo_gasoil - cliente.consumo_gasoil;

    if (cantidadNum > dispCliente) {
      return NextResponse.json({ error: `Cupo personal de ${tipo_combustible} insuficiente (${dispCliente} GL disponibles)` }, { status: 400 });
    }

    // B. Cupo de la Entidad/Secretaría
    if (cliente.entidades) {
      const dispEntidad = tipo_combustible === 'Gasolina'
        ? cliente.entidades.cupo_gasolina - cliente.entidades.consumo_gasolina
        : cliente.entidades.cupo_gasoil - cliente.entidades.consumo_gasoil;

      if (cantidadNum > dispEntidad) {
        return NextResponse.json({ error: `Cupo de la Secretaría ${cliente.entidades.nombre} insuficiente (${dispEntidad} GL disponibles)` }, { status: 400 });
      }
    }

    // C. Stock del Tanque General
    if (cantidadNum > inventario.cantidad_actual) {
      return NextResponse.json({ error: `Reserva general de ${tipo_combustible} insuficiente en la planta` }, { status: 400 });
    }

    // --- PROCESAMIENTO (Transaccional) ---

    // 1. Registrar Retiro
    const { error: retiroError } = await supabaseAdmin.from('retiros').insert([{
      cliente_id,
      cantidad: cantidadNum,
      placa,
      registrado_por,
      tipo_combustible,
      fecha: new Date().toISOString()
    }]);

    if (retiroError) throw retiroError;

    // 2. Actualizar Consumo de Cliente
    if (tipo_combustible === 'Gasolina') {
      await supabaseAdmin.from('clientes').update({
        consumo_gasolina: cliente.consumo_gasolina + cantidadNum
      }).eq('id', cliente_id);
    } else {
      await supabaseAdmin.from('clientes').update({
        consumo_gasoil: cliente.consumo_gasoil + cantidadNum
      }).eq('id', cliente_id);
    }

    // 3. Actualizar Consumo de Entidad
    if (cliente.entidades) {
      if (tipo_combustible === 'Gasolina') {
        await supabaseAdmin.from('entidades').update({
          consumo_gasolina: cliente.entidades.consumo_gasolina + cantidadNum
        }).eq('id', cliente.entidad_id);
      } else {
        await supabaseAdmin.from('entidades').update({
          consumo_gasoil: cliente.entidades.consumo_gasoil + cantidadNum
        }).eq('id', cliente.entidad_id);
      }
    }

    // 4. Actualizar Tanque General
    await supabaseAdmin.from('inventario').update({
      cantidad_actual: inventario.cantidad_actual - cantidadNum
    }).eq('tipo_combustible', tipo_combustible);

    return NextResponse.json({ success: true, message: 'Despacho jerárquico procesado con éxito' });

  } catch (error: any) {
    return NextResponse.json({ error: 'Error al procesar el despacho jerárquico', details: error.message }, { status: 500 });
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
