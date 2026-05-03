
-- Drop legacy check constraint blocking 'approved'
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_status_check;

-- Add new columns
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Migrate existing 'active' -> 'approved'
UPDATE public.properties SET status = 'approved' WHERE status = 'active';

-- New check constraint
ALTER TABLE public.properties
  ADD CONSTRAINT properties_status_check CHECK (status IN ('pending', 'approved', 'rejected'));

ALTER TABLE public.properties ALTER COLUMN status SET DEFAULT 'pending';

-- profiles is_banned
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false;

-- Properties RLS
DROP POLICY IF EXISTS "Properties viewable by everyone" ON public.properties;
DROP POLICY IF EXISTS "Public can view approved visible properties" ON public.properties;
CREATE POLICY "Public can view approved visible properties"
ON public.properties FOR SELECT
USING (
  (status = 'approved' AND is_visible = true
    AND (owner_id IS NULL OR NOT EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = properties.owner_id AND p.is_banned = true
    )))
  OR auth.uid() = owner_id
  OR public.has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "Admins can update any property" ON public.properties;
CREATE POLICY "Admins can update any property"
ON public.properties FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete any property" ON public.properties;
CREATE POLICY "Admins can delete any property"
ON public.properties FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Owners can insert properties" ON public.properties;
CREATE POLICY "Owners can insert properties"
ON public.properties FOR INSERT
WITH CHECK (
  auth.uid() = owner_id
  AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_banned = true)
);

-- Profiles admin policies
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- user_roles admin policies
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Update approval notify trigger
CREATE OR REPLACE FUNCTION public.notify_on_property_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'approved' AND NEW.owner_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (NEW.owner_id, 'Property Approved! 🎉', 'Your listing "' || NEW.title || '" has been approved and is now live.', 'approval', '/app/property/' || NEW.id);
  END IF;
  IF OLD.status = 'pending' AND NEW.status = 'rejected' AND NEW.owner_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (NEW.owner_id, 'Property Rejected', 'Your listing "' || NEW.title || '" was not approved' || COALESCE(': ' || NEW.rejection_reason, '') || '.', 'general', '/app/owner');
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_notify_on_property_approval ON public.properties;
CREATE TRIGGER trg_notify_on_property_approval
AFTER UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_property_approval();
