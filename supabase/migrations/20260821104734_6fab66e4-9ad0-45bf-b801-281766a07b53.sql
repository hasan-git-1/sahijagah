DROP VIEW IF EXISTS public.public_profiles;
REVOKE EXECUTE ON FUNCTION public.increment_view_count(uuid) FROM anon;
