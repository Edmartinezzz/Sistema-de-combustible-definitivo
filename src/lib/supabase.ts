import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Cliente estándar para operaciones desde el navegador (si aplica)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente de administración (Service Role) para el backend (API Routes)
// Este cliente TIENE permisos para saltarse las RLS si es necesario en el login
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export type SupabaseClient = typeof supabase;
