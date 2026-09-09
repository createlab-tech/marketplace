-- Grant admin access to the marketplace owner account.
INSERT INTO public.profiles (id, email, is_admin)
SELECT id, email, true
FROM auth.users
WHERE lower(email) = lower('createlab.tech@gmail.com')
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    is_admin = true;