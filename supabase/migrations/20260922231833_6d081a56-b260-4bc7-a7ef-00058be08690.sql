CREATE TABLE public.site_images (
  id uuid primary key default gen_random_uuid(),
  chave text not null unique,
  rotulo text not null,
  url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT SELECT ON public.site_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_images TO authenticated;
GRANT ALL ON public.site_images TO service_role;
ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read site_images" ON public.site_images FOR SELECT USING (true);
CREATE POLICY "Admins write site_images" ON public.site_images FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER site_images_updated_at BEFORE UPDATE ON public.site_images FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.next_edition (
  id uuid primary key default gen_random_uuid(),
  cidade text,
  data_evento date,
  locais text[] not null default '{}',
  video_url text,
  capas text[] not null default '{}',
  inscricoes_abertura date,
  regulamento_url text,
  programacao_data date,
  possui_oficinas boolean not null default false,
  logos_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT SELECT ON public.next_edition TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.next_edition TO authenticated;
GRANT ALL ON public.next_edition TO service_role;
ALTER TABLE public.next_edition ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read next_edition" ON public.next_edition FOR SELECT USING (true);
CREATE POLICY "Admins write next_edition" ON public.next_edition FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER next_edition_updated_at BEFORE UPDATE ON public.next_edition FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
INSERT INTO public.next_edition (cidade) VALUES (NULL);

CREATE TABLE public.program_attractions (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text not null default '',
  data date,
  local text,
  horario text,
  publicado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT SELECT ON public.program_attractions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.program_attractions TO authenticated;
GRANT ALL ON public.program_attractions TO service_role;
ALTER TABLE public.program_attractions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published attractions" ON public.program_attractions FOR SELECT USING (publicado = true);
CREATE POLICY "Admins read all attractions" ON public.program_attractions FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins write attractions" ON public.program_attractions FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER program_attractions_updated_at BEFORE UPDATE ON public.program_attractions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.registration_cities (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT SELECT ON public.registration_cities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registration_cities TO authenticated;
GRANT ALL ON public.registration_cities TO service_role;
ALTER TABLE public.registration_cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read registration_cities" ON public.registration_cities FOR SELECT USING (true);
CREATE POLICY "Admins write registration_cities" ON public.registration_cities FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER registration_cities_updated_at BEFORE UPDATE ON public.registration_cities FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
INSERT INTO public.registration_cities (nome, ordem) VALUES
  ('Embu das Artes', 1), ('Cotia', 2), ('Embu-Guaçu', 3), ('Itapecerica da Serra', 4),
  ('São Paulo', 5), ('Taboão da Serra', 6), ('outra', 7);

CREATE TABLE public.registrations (
  id uuid primary key default gen_random_uuid(),
  nome_artistico text not null,
  responsavel text not null,
  cpf text not null,
  email text not null,
  whatsapp text not null,
  cidade text not null,
  forma_cache text not null,
  categoria text not null,
  titulo_trabalho text not null,
  descricao_trabalho text not null,
  fotos text[] not null default '{}',
  video_url text,
  redes_sociais text,
  duracao_minutos integer,
  classificacao text not null,
  oficina_titulo text,
  oficina_descricao text,
  oficina_faixas text[] not null default '{}',
  oficina_participantes integer,
  oficina_materiais text,
  declaracoes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT INSERT ON public.registrations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registrations TO authenticated;
GRANT ALL ON public.registrations TO service_role;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a registration" ON public.registrations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read registrations" ON public.registrations FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage registrations" ON public.registrations FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER registrations_updated_at BEFORE UPDATE ON public.registrations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();