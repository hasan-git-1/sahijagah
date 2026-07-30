GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_view_count(uuid) TO anon;

DROP TRIGGER IF EXISTS trg_notify_on_property_approval ON public.properties;
CREATE TRIGGER trg_notify_on_property_approval
AFTER UPDATE OF status ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.notify_on_property_approval();

DROP TRIGGER IF EXISTS trg_properties_updated_at ON public.properties;
CREATE TRIGGER trg_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();