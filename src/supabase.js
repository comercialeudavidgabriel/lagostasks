import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(url && anonKey);

// Cliente "stub" não-funcional quando env não está configurado.
// Evita o "throw" em tempo de import que quebrava toda a árvore React (tela branca).
export const supabase = isConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

if (!isConfigured && typeof window !== 'undefined') {
  console.error(
    '[Tasks Lagos] Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.'
  );
}
