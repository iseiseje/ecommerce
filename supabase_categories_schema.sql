-- Skrip SQL untuk Membuat Tabel Categories & Mengaktifkan Supabase Realtime
-- Jalankan skrip ini di SQL Editor Dasbor Supabase Anda

-- 1. Buat Tabel Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT DEFAULT '🏷️',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan Akses RLS
CREATE POLICY "Public categories are viewable by everyone"
ON public.categories FOR SELECT
USING ( true );

CREATE POLICY "Anyone can insert categories"
ON public.categories FOR INSERT
WITH CHECK ( true );

CREATE POLICY "Anyone can update categories"
ON public.categories FOR UPDATE
USING ( true );

CREATE POLICY "Anyone can delete categories"
ON public.categories FOR DELETE
USING ( true );

-- 4. Tambahkan Sampel Data Kategori Awal (Tanpa 'Semua')
INSERT INTO public.categories (name, slug, icon)
VALUES
  ('Nike', 'nike', '✔️'),
  ('Adidas', 'adidas', '👟'),
  ('Puma', 'puma', '🐆'),
  ('Rolex', 'rolex', '⌚'),
  ('Gucci', 'gucci', 'GB'),
  ('Elektronik', 'electronics', '📱')
ON CONFLICT (slug) DO NOTHING;

-- 5. Aktifkan Supabase Realtime untuk Tabel Categories
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
