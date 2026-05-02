-- =======================================================================
-- Migration 001 — Departments (áreas) + Clients
-- Rode este script INTEIRO no SQL Editor do Supabase, depois do schema.sql.
-- É aditivo: não apaga nada do que já existe.
-- =======================================================================

-- 1) Departamento na tabela profiles
alter table public.profiles
  add column if not exists department text
  check (department in (
    'editor_videos','designer','social_media','trafego_pago','sites'
  ) or department is null);

-- 2) Clientes
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  code int not null unique,                  -- 100, 101, 102, ...
  name text not null,                        -- "Cliente cliente"

  -- Operacional
  drive_link text,
  acessos text,                              -- credenciais/links/observações
  formulario text,                           -- link ou status do formulário
  onboarding text,
  estrategia text,
  momento text                               -- 'call_alinhamento' | 'producao_estrategica' | 'rodando'
    check (momento in ('call_alinhamento','producao_estrategica','rodando') or momento is null),
  has_crm boolean not null default false,
  crm_notes text,

  -- Comercial
  produto text,
  valor_pagamento numeric(12,2),
  plano text                                 -- 'silver' | 'gold' | 'lagos'
    check (plano in ('silver','gold','lagos') or plano is null),
  entregaveis text,
  contrato_link text,
  dia_pagamento int check (dia_pagamento between 1 and 31 or dia_pagamento is null),
  data_inicio date,
  situacao text                              -- 'ativo' | 'desativado' | 'em_fechamento' | 'pendencias'
    check (situacao in ('ativo','desativado','em_fechamento','pendencias') or situacao is null),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_code_idx on public.clients(code);

-- Trigger updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;

drop trigger if exists clients_touch on public.clients;
create trigger clients_touch
before update on public.clients
for each row execute function public.touch_updated_at();

-- 3) RLS para clients
alter table public.clients enable row level security;

drop policy if exists clients_select on public.clients;
drop policy if exists clients_modify_admin on public.clients;

-- Todos os autenticados podem LER (mesmo colaboradores), mas só admins podem modificar.
create policy clients_select on public.clients
  for select to authenticated using (true);

create policy clients_modify_admin on public.clients
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- 4) Seed inicial de exemplo (3 clientes)
insert into public.clients (code, name) values
  (100, 'Cliente cliente'),
  (101, 'Clientex clientex'),
  (102, 'Clientey clientey')
on conflict (code) do nothing;

-- =======================================================================
-- Próximos passos manuais:
--   1) UPDATE public.profiles SET department='social_media' WHERE name='Fulano';
--      (departamento dos colaboradores; admins ficam com department=null e veem tudo)
-- =======================================================================
