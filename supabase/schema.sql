-- =======================================================================
-- Tasks Lagos — Schema Supabase
-- Rode este script inteiro no SQL Editor do Supabase (Project → SQL Editor)
-- =======================================================================

create extension if not exists pgcrypto;

-- =======================================================================
-- Tabelas
-- =======================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null default 'collaborator' check (role in ('admin','collaborator')),
  created_at timestamptz not null default now()
);

create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  name text not null,
  position int not null default 0,
  color text,
  is_done boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  column_id uuid references public.columns(id) on delete set null,
  title text not null,
  description text,
  reference_link text,
  drive_link text,
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  due_date date,
  created_by uuid references public.profiles(id) on delete set null,
  assigned_to uuid not null references public.profiles(id) on delete cascade,
  position int not null default 0,
  seen_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_board_id_idx     on public.tasks(board_id);
create index if not exists tasks_assigned_to_idx  on public.tasks(assigned_to);
create index if not exists tasks_column_id_idx    on public.tasks(column_id);
create index if not exists columns_board_id_idx   on public.columns(board_id);

-- =======================================================================
-- Helpers (SECURITY DEFINER → não disparam RLS recursiva)
-- =======================================================================

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql security definer stable
set search_path = public
as $$
  select coalesce((select role = 'admin' from public.profiles where id = user_id), false);
$$;
grant execute on function public.is_admin(uuid) to authenticated;

create or replace function public.my_role()
returns text
language sql security definer stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;
grant execute on function public.my_role() to authenticated;

-- =======================================================================
-- Trigger: ao criar usuário (signup) → profile + board + colunas default
-- =======================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  new_board_id uuid;
  user_name text;
begin
  user_name := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));

  insert into public.profiles (id, name, role)
  values (new.id, user_name, 'collaborator')
  on conflict (id) do nothing;

  insert into public.boards (owner_id, name)
  values (new.id, user_name || ' Board')
  returning id into new_board_id;

  insert into public.columns (board_id, name, position, is_done) values
    (new_board_id, 'To do',       0, false),
    (new_board_id, 'In Progress', 1, false),
    (new_board_id, 'Review',      2, false),
    (new_board_id, 'Done',        3, true);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =======================================================================
-- Triggers: manter completed_at coerente com a coluna is_done
-- =======================================================================

create or replace function public.handle_task_insert()
returns trigger language plpgsql as $$
declare
  is_done_col boolean;
begin
  if new.column_id is not null then
    select is_done into is_done_col from public.columns where id = new.column_id;
    if coalesce(is_done_col, false) and new.completed_at is null then
      new.completed_at := now();
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists tasks_before_insert on public.tasks;
create trigger tasks_before_insert
before insert on public.tasks
for each row execute function public.handle_task_insert();

create or replace function public.handle_task_update()
returns trigger language plpgsql as $$
declare
  new_is_done boolean;
  old_is_done boolean;
begin
  new.updated_at := now();

  if new.column_id is distinct from old.column_id then
    select is_done into new_is_done from public.columns where id = new.column_id;
    select is_done into old_is_done from public.columns where id = old.column_id;

    if coalesce(new_is_done, false) and not coalesce(old_is_done, false) then
      new.completed_at := now();
    elsif not coalesce(new_is_done, false) and coalesce(old_is_done, false) then
      new.completed_at := null;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists tasks_before_update on public.tasks;
create trigger tasks_before_update
before update on public.tasks
for each row execute function public.handle_task_update();

-- =======================================================================
-- RLS
-- =======================================================================

alter table public.profiles enable row level security;
alter table public.boards   enable row level security;
alter table public.columns  enable row level security;
alter table public.tasks    enable row level security;

-- profiles
drop policy if exists profiles_select       on public.profiles;
drop policy if exists profiles_update_self  on public.profiles;
drop policy if exists profiles_update_admin on public.profiles;

create policy profiles_select on public.profiles
  for select to authenticated using (true);

create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = public.my_role());

create policy profiles_update_admin on public.profiles
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- boards
drop policy if exists boards_select on public.boards;
drop policy if exists boards_modify on public.boards;

create policy boards_select on public.boards
  for select to authenticated
  using (owner_id = auth.uid() or public.is_admin(auth.uid()));

create policy boards_modify on public.boards
  for all to authenticated
  using (public.is_admin(auth.uid()) or owner_id = auth.uid())
  with check (public.is_admin(auth.uid()) or owner_id = auth.uid());

-- columns
drop policy if exists columns_select on public.columns;
drop policy if exists columns_insert on public.columns;
drop policy if exists columns_update on public.columns;
drop policy if exists columns_delete on public.columns;

create policy columns_select on public.columns
  for select to authenticated using (
    public.is_admin(auth.uid())
    or board_id in (select id from public.boards where owner_id = auth.uid())
  );

create policy columns_insert on public.columns
  for insert to authenticated with check (
    public.is_admin(auth.uid())
    or board_id in (select id from public.boards where owner_id = auth.uid())
  );

create policy columns_update on public.columns
  for update to authenticated
  using (
    public.is_admin(auth.uid())
    or board_id in (select id from public.boards where owner_id = auth.uid())
  )
  with check (
    public.is_admin(auth.uid())
    or board_id in (select id from public.boards where owner_id = auth.uid())
  );

create policy columns_delete on public.columns
  for delete to authenticated using (
    public.is_admin(auth.uid())
    or board_id in (select id from public.boards where owner_id = auth.uid())
  );

-- tasks
drop policy if exists tasks_select on public.tasks;
drop policy if exists tasks_insert on public.tasks;
drop policy if exists tasks_update on public.tasks;
drop policy if exists tasks_delete on public.tasks;

create policy tasks_select on public.tasks
  for select to authenticated using (
    public.is_admin(auth.uid())
    or assigned_to = auth.uid()
  );

create policy tasks_insert on public.tasks
  for insert to authenticated with check (
    public.is_admin(auth.uid())
    or assigned_to = auth.uid()
  );

create policy tasks_update on public.tasks
  for update to authenticated
  using (
    public.is_admin(auth.uid())
    or assigned_to = auth.uid()
  )
  with check (
    public.is_admin(auth.uid())
    or assigned_to = auth.uid()
  );

create policy tasks_delete on public.tasks
  for delete to authenticated using (
    public.is_admin(auth.uid())
    or assigned_to = auth.uid()
  );

-- =======================================================================
-- Pronto. Próximos passos manuais (ver supabase/README.md):
--   1) Authentication → Settings → desativar "Confirm email"
--   2) Authentication → Users → criar David, Rafael, Alexandre
--   3) UPDATE public.profiles SET role='admin' WHERE name IN ('David','Rafael','Alexandre');
-- =======================================================================
