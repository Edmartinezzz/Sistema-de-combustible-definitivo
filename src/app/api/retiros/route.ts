import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY || 'gas-despacho-2026-premium-secret';

// Registrar un nuevo despacho (Compatible con Admin y Beneficiario)
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, SECRET_KEY);

    const body = await request.json();
    let { cliente_id, cantidad, placa, tipo_combustible } = body;

    // SEGURIDAD: Si es un cliente, forzar su propio ID
    if (decoded.role === 'cliente') {
      cliente_id = decoded.id;
    }

    if (!['Gasolina', 'Gasoil'].includes(tipo_combustible)) {
      return NextResponse.json({ error: 'Tipo de combustible inválido' }, { status: 404 });
    }

    const cantidadNum = parseFloat(cantidad);

    // 1. Obtener datos del cliente y su entidad
    const { data: cliente } = await supabaseAdmin
      .from('clientes')
      .select('*, entidades(*)')
      .eq('id', cliente_id)
      .single();

    if (!cliente) return NextResponse.json({ error: 'Beneficiario no encontrado' }, { status: 404 });

    // 2. Obtener datos del inventario general
    const { data: inventario } = await supabaseAdmin
      .from('inventario')
      .select('*')
      .eq('tipo_combustible', tipo_combustible)
      .single();

    if (!inventario) return NextResponse.json({ error: 'Tanque no configurado' }, { status: 404 });

    // --- TRIPLE VALIDACIÓN JERÁRQUICA ---
    
    // A. Cupo del Cliente
    const dispCliente = tipo_combustible === 'Gasolina' 
      ? cliente.cupo_gasolina - cliente.consumo_gasolina 
      : cliente.cupo_gasoil - cliente.consumo_gasoil;

    if (cantidadNum > dispCliente) {
      return NextResponse.json({ error: `Cupo personal insuficiente (${dispCliente.toFixed(1)} GL disponibles)` }, { status: 400 });
    }

    // B. Cupo de la Entidad Madre
    if (cliente.entidades) {
      const dispEntidad = tipo_combustible === 'Gasolina'
        ? cliente.entidades.cupo_gasolina - cliente.entidades.consumo_gasolina
        : cliente.entidades.cupo_gasoil - cliente.entidades.consumo_gasoil;

      if (cantidadNum > dispEntidad) {
        return NextResponse.json({ error: `Cupo de la Entidad insuficiente (${dispEntidad.toFixed(1)} GL disponibles)` }, { status: 400 });
      }
    }

    // C. Stock General
    if (cantidadNum > inventario.cantidad_actual) {
      return NextResponse.json({ error: `No hay stock suficiente en la planta` }, { status: 400 });
    }

    // --- EJECUCIÓN (Transaccional) ---

    // 1. Registrar Retiro
    await supabaseAdmin.from('retiros').insert([{
      cliente_id,
      cantidad: cantidadNum,
      placa: placa || cliente.placa,
      registrado_por: decoded.nombre || 'Autogestión',
      tipo_combustible,
      fecha: new Date().toISOString()
    }]);

    // 2. Actualizar Cliente
    if (tipo_combustible === 'Gasolina') {
      await supabaseAdmin.from('clientes').update({ consumo_gasolina: cliente.consumo_gasolina + cantidadNum }).eq('id', cliente_id);
    } else {
      await supabaseAdmin.from('clientes').update({ consumo_gasoil: cliente.consumo_gasoil + cantidadNum }).eq('id', cliente_id);
    }

    // 3. Actualizar Entidad Madre
    if (cliente.entidades) {
      if (tipo_combustible === 'Gasolina') {
        await supabaseAdmin.from('entidades').update({ consumo_gasolina: cliente.entidades.consumo_gasolina + cantidadNum }).eq('id', cliente.entidad_id);
      } else {
        await supabaseAdmin.from('entidades').update({ consumo_gasoil: cliente.entidades.consumo_gasoil + cantidadNum }).eq('id', cliente.entidad_id);
      }
    }

    // 4. Actualizar Inventario
    await supabaseAdmin.from('inventario').update({ cantidad_actual: inventario.cantidad_actual - cantidadNum }).eq('tipo_combustible', tipo_combustible);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ error: 'Error al procesar el despacho' }, { status: 500 });
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
