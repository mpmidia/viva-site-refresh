create table public.sponsorship_settings (
  id uuid primary key default gen_random_uuid(),
  whatsapp text,
  midia_kit_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.sponsorship_settings to anon, authenticated;
grant insert, update, delete on public.sponsorship_settings to authenticated;
grant all on public.sponsorship_settings to service_role;
alter table public.sponsorship_settings enable row level security;
create policy "Public read sponsorship" on public.sponsorship_settings for select using (true);
create policy "Admins write sponsorship" on public.sponsorship_settings for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger sponsorship_settings_updated_at before update on public.sponsorship_settings for each row execute function public.set_updated_at();