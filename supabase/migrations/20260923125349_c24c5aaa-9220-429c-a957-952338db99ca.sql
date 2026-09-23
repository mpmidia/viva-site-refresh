ALTER TABLE public.editions
  ADD COLUMN IF NOT EXISTS imagens text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS video_url text;

ALTER TABLE public.next_edition
  ADD COLUMN IF NOT EXISTS data_fim date,
  ADD COLUMN IF NOT EXISTS inscricoes_encerramento date;

ALTER TABLE public.program_attractions
  ADD COLUMN IF NOT EXISTS imagem_url text;

CREATE TABLE IF NOT EXISTS public.registration_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  valor numeric(10,2),
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.registration_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registration_categories TO authenticated;
GRANT ALL ON public.registration_categories TO service_role;

ALTER TABLE public.registration_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read registration_categories" ON public.registration_categories FOR SELECT USING (true);
CREATE POLICY "Admins write registration_categories" ON public.registration_categories FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER registration_categories_updated_at BEFORE UPDATE ON public.registration_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  ativo boolean NOT NULL DEFAULT false,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.payment_methods TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_methods TO authenticated;
GRANT ALL ON public.payment_methods TO service_role;

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read payment_methods" ON public.payment_methods FOR SELECT USING (true);
CREATE POLICY "Admins write payment_methods" ON public.payment_methods FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER payment_methods_updated_at BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.registration_categories (nome, valor, ordem) VALUES
  ('A. Grupos teatrais, shows musicais e espetáculos de dança', 2500.00, 1),
  ('B. Performances, duetos, apresentações solo e propostas experimentais', 1500.00, 2),
  ('C. Artesanato, moda, pintura e linguagens similares', 1000.00, 3);

INSERT INTO public.payment_methods (nome, ativo, ordem) VALUES
  ('Pix', false, 1),
  ('Cartão de crédito', false, 2),
  ('Cartão de débito', false, 3),
  ('Boleto', false, 4);