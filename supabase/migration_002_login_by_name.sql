-- =======================================================================
-- Migration 002 — Login por nome
-- Cria função public.email_for_name(text) que resolve nome → email,
-- permitindo que o front faça login informando o nome do usuário em vez
-- do email (útil para os Heads que pediram login por "nome e senha").
--
-- A função é SECURITY DEFINER (bypassa RLS para conseguir ler auth.users
-- e public.profiles antes do usuário estar autenticado) e é exposta a
-- "anon" para que o login funcione sem sessão prévia.
-- =======================================================================

create or replace function public.email_for_name(p_name text)
returns text
language sql security definer stable
set search_path = public
as $$
  select u.email
  from auth.users u
  join public.profiles p on p.id = u.id
  where lower(p.name) = lower(p_name)
  limit 1;
$$;

revoke all on function public.email_for_name(text) from public;
grant execute on function public.email_for_name(text) to anon, authenticated;

-- =======================================================================
-- Pronto. O front já está preparado para usar essa função.
-- =======================================================================
