-- Run this script in your Supabase SQL Editor

-- 1. Create the products table
CREATE TABLE public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    image_url TEXT NOT NULL,
    genlook_external_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
CREATE POLICY "Public profiles are viewable by everyone."
ON public.products FOR SELECT
USING ( true );

-- 2. Create the tryons table to store generated images
CREATE TABLE public.tryons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    original_image_url TEXT,
    result_image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for tryons
ALTER TABLE public.tryons ENABLE ROW LEVEL SECURITY;

-- Allow users to see only their own tryons
CREATE POLICY "Users can view their own tryons."
ON public.tryons FOR SELECT
USING ( auth.uid() = user_id );

-- Allow users to insert their own tryons
CREATE POLICY "Users can insert their own tryons."
ON public.tryons FOR INSERT
WITH CHECK ( auth.uid() = user_id );

-- Optional: Insert dummy products
INSERT INTO public.products (name, description, price, image_url, genlook_external_id)
VALUES
('Classic White Tee', 'A timeless, comfortable 100% cotton white t-shirt.', 25.00, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', 'classic-white-tee'),
('Blue Denim Jacket', 'Rugged, stylish blue denim jacket perfect for layering.', 85.00, 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80', 'blue-denim-jacket'),
('Red Summer Dress', 'Lightweight and flowy red dress for summer outings.', 45.00, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80', 'red-summer-dress');

-- 3. Create orders table for RainyPay
CREATE TABLE public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    checkout_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own orders
CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
USING ( auth.uid() = user_id );

-- Allow users to insert their own orders
CREATE POLICY "Users can insert their own orders"
ON public.orders FOR INSERT
WITH CHECK ( auth.uid() = user_id );
