CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

INSERT INTO public.categories (title, description)
VALUES
  ('Free Fire Diamond', 'Top-up packs for Free Fire diamonds'),
  ('PUBG UC', 'Top-up packs for PUBG UC'),
  ('COC Gems', 'Top-up packs for Clash of Clans gems')
ON CONFLICT (title) DO NOTHING;

INSERT INTO public.categories (title)
SELECT DISTINCT p.category
FROM public.products p
WHERE p.category IS NOT NULL
  AND length(trim(p.category)) > 0
  AND NOT EXISTS (
    SELECT 1
    FROM public.categories c
    WHERE lower(trim(c.title)) = lower(trim(p.category))
  );

UPDATE public.products p
SET category_id = c.id
FROM public.categories c
WHERE p.category_id IS NULL
  AND lower(trim(c.title)) = lower(trim(p.category));

CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone" ON public.categories
  FOR SELECT USING (true);
