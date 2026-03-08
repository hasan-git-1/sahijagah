
CREATE TABLE public.maintenance_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants can view own requests" ON public.maintenance_requests
  FOR SELECT TO authenticated USING (auth.uid() = tenant_id);

CREATE POLICY "Tenants can create requests" ON public.maintenance_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Property owners can view requests" ON public.maintenance_requests
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.properties WHERE id = maintenance_requests.property_id AND owner_id = auth.uid())
  );

CREATE POLICY "Property owners can update requests" ON public.maintenance_requests
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.properties WHERE id = maintenance_requests.property_id AND owner_id = auth.uid())
  );
