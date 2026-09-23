ALTER TABLE public.program_attractions ADD COLUMN next_edition_id uuid;
ALTER TABLE public.registrations ADD COLUMN next_edition_id uuid;
ALTER TABLE public.registration_cities ADD COLUMN next_edition_id uuid;
ALTER TABLE public.registration_categories ADD COLUMN next_edition_id uuid;
ALTER TABLE public.payment_methods ADD COLUMN next_edition_id uuid;

UPDATE public.program_attractions
SET next_edition_id = (SELECT id FROM public.next_edition ORDER BY created_at ASC LIMIT 1)
WHERE next_edition_id IS NULL;
UPDATE public.registrations
SET next_edition_id = (SELECT id FROM public.next_edition ORDER BY created_at ASC LIMIT 1)
WHERE next_edition_id IS NULL;
UPDATE public.registration_cities
SET next_edition_id = (SELECT id FROM public.next_edition ORDER BY created_at ASC LIMIT 1)
WHERE next_edition_id IS NULL;
UPDATE public.registration_categories
SET next_edition_id = (SELECT id FROM public.next_edition ORDER BY created_at ASC LIMIT 1)
WHERE next_edition_id IS NULL;
UPDATE public.payment_methods
SET next_edition_id = (SELECT id FROM public.next_edition ORDER BY created_at ASC LIMIT 1)
WHERE next_edition_id IS NULL;

ALTER TABLE public.program_attractions
  ALTER COLUMN next_edition_id SET NOT NULL,
  ADD CONSTRAINT program_attractions_next_edition_id_fkey FOREIGN KEY (next_edition_id) REFERENCES public.next_edition(id) ON DELETE CASCADE;
ALTER TABLE public.registrations
  ALTER COLUMN next_edition_id SET NOT NULL,
  ADD CONSTRAINT registrations_next_edition_id_fkey FOREIGN KEY (next_edition_id) REFERENCES public.next_edition(id) ON DELETE CASCADE;
ALTER TABLE public.registration_cities
  ALTER COLUMN next_edition_id SET NOT NULL,
  ADD CONSTRAINT registration_cities_next_edition_id_fkey FOREIGN KEY (next_edition_id) REFERENCES public.next_edition(id) ON DELETE CASCADE;
ALTER TABLE public.registration_categories
  ALTER COLUMN next_edition_id SET NOT NULL,
  ADD CONSTRAINT registration_categories_next_edition_id_fkey FOREIGN KEY (next_edition_id) REFERENCES public.next_edition(id) ON DELETE CASCADE;
ALTER TABLE public.payment_methods
  ALTER COLUMN next_edition_id SET NOT NULL,
  ADD CONSTRAINT payment_methods_next_edition_id_fkey FOREIGN KEY (next_edition_id) REFERENCES public.next_edition(id) ON DELETE CASCADE;

CREATE INDEX program_attractions_next_edition_id_idx ON public.program_attractions(next_edition_id);
CREATE INDEX registrations_next_edition_id_idx ON public.registrations(next_edition_id);
CREATE INDEX registration_cities_next_edition_id_idx ON public.registration_cities(next_edition_id);
CREATE INDEX registration_categories_next_edition_id_idx ON public.registration_categories(next_edition_id);
CREATE INDEX payment_methods_next_edition_id_idx ON public.payment_methods(next_edition_id);
CREATE INDEX next_edition_event_date_idx ON public.next_edition(data_evento, created_at);