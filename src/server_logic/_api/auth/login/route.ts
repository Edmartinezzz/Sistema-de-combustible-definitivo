import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { ejecutarResetDiario } from '@/lib/resetDiario';

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

    // --- 1. INTENTAR COMO ADMINISTRADOR ---
    const { data: admin } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('usuario', usuario)
      .single();

    if (admin) {
      // Validación admin (soporta tanto bcrypt como texto plano por compatibilidad temporal)
      let passMatch = admin.contrasena === contrasena;
      
      // Si no coincide en plano, intentar con bcrypt (por si ya migramos los admins)
      if (!passMatch && admin.contrasena.startsWith('$2')) {
        passMatch = await bcrypt.compare(contrasena, admin.contrasena);
      }

      if (passMatch) {
        const token = jwt.sign(
          { id: admin.id, role: 'admin', nombre: admin.nombre },
          SECRET_KEY,
          { expiresIn: '8h' }
        );

        // Disparar reset diario automático (sin bloquear el login)
        ejecutarResetDiario().catch(console.error);

        return NextResponse.json({
          token,
          usuario: {
            id: admin.id,
            nombre: admin.nombre,
            rol: 'admin'
          }
        });
      }
    }

    // --- 2. INTENTAR COMO BENEFICIARIO (Cédula) ---
    // Limpiamos la cédula de puntos u otros caracteres que el usuario pueda haber introducido
    const cedulaLimpia = usuario.replace(/\D/g, '');
    
    const { data: cliente } = await supabaseAdmin
      .from('clientes')
      .select('*, entidades(*)')
      .eq('cedula', cedulaLimpia)
      .single();

    if (cliente && cliente.password) {
      const passMatch = await bcrypt.compare(contrasena, cliente.password);
      
      if (passMatch) {
         const token = jwt.sign(
           { id: cliente.id, role: 'cliente', nombre: cliente.nombre },
           SECRET_KEY,
           { expiresIn: '8h' }
         );
 
         // Disparar reset diario automático para beneficiarios también
         ejecutarResetDiario().catch(console.error);

         return NextResponse.json({
           token,
           usuario: {
             id: cliente.id,
             nombre: cliente.nombre,
             rol: 'cliente',
             entidad: cliente.entidades?.nombre || 'Particular'
           }
         });
      }
    }

    // --- 3. SI NADA COINCIDE ---
    return NextResponse.json(
      { error: 'Credenciales inválidas' },
      { status: 401 }
    );

  } catch (error: any) {
    console.error('Error en Login API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
