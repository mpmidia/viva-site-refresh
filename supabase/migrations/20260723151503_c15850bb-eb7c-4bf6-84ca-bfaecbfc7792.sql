
-- Enum de papéis
create type public.app_role as enum ('admin', 'user');

-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  nome text,
  telefone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Users read own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);

-- user_roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

-- has_role function
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- editions
create table public.editions (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  data date not null,
  local text not null,
  participantes integer not null default 0,
  descricao text not null,
  inscricao_url text,
  imagem_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.editions to anon, authenticated;
grant insert, update, delete on public.editions to authenticated;
grant all on public.editions to service_role;
alter table public.editions enable row level security;
create policy "Public read editions" on public.editions for select using (true);
create policy "Admins insert editions" on public.editions for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update editions" on public.editions for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete editions" on public.editions for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger editions_updated_at before update on public.editions for each row execute function public.set_updated_at();
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();

-- Auto create profile + assign role on new user. First user becomes admin.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  is_first boolean;
begin
  insert into public.profiles (id, email, nome)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'nome', ''));

  select not exists (select 1 from public.user_roles where role = 'admin') into is_first;
  if is_first then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'user');
  end if;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
