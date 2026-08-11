-- Run this in your Supabase SQL Editor to automatically sync new user signups to the public.users table

-- 1. Create a trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (name, email, avatar_url, phone_number, is_verified, password, created_at, updated_at)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), 
    NEW.email, 
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.phone,
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN true ELSE false END,
    -- Default random password since auth is handled by Supabase
    '$2y$12$randompasswordhashplaceholderwhichisnotusedforlogin',
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    phone_number = EXCLUDED.phone_number,
    is_verified = EXCLUDED.is_verified,
    updated_at = EXCLUDED.updated_at;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
