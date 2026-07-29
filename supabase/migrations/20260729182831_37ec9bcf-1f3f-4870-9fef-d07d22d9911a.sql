
CREATE TABLE public.ai_review_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  realness_score int,
  verdict text,
  reasons jsonb DEFAULT '[]'::jsonb,
  flagged_issues jsonb DEFAULT '[]'::jsonb,
  photo_notes text,
  pre_check_flags jsonb DEFAULT '{}'::jsonb,
  resulting_status text,
  admin_override text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.ai_review_logs TO authenticated;
GRANT ALL ON public.ai_review_logs TO service_role;

ALTER TABLE public.ai_review_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view ai review logs"
  ON public.ai_review_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update ai review logs"
  ON public.ai_review_logs FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX ai_review_logs_property_id_idx ON public.ai_review_logs(property_id);
CREATE INDEX ai_review_logs_created_at_idx ON public.ai_review_logs(created_at DESC);
