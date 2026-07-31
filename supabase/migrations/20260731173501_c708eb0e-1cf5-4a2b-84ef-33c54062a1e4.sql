CREATE OR REPLACE FUNCTION public.is_user_banned(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE((SELECT p.is_banned FROM public.profiles p WHERE p.id = _user_id), false)
$$;

REVOKE EXECUTE ON FUNCTION public.is_user_banned(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_user_banned(uuid) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Public can view approved visible properties" ON public.properties;

CREATE POLICY "Public can view approved visible properties"
ON public.properties FOR SELECT
USING (
  (status = 'approved' AND is_visible = true
    AND (owner_id IS NULL OR NOT public.is_user_banned(owner_id)))
  OR auth.uid() = owner_id
  OR public.has_role(auth.uid(), 'admin')
);