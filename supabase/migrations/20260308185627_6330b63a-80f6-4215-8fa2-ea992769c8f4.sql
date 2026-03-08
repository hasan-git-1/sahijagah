
-- Fix permissive feedback insert policy - require name and message
DROP POLICY "Anyone can submit feedback" ON public.feedback;
CREATE POLICY "Anyone can submit feedback" ON public.feedback FOR INSERT WITH CHECK (
  name IS NOT NULL AND name != '' AND message IS NOT NULL AND message != '' AND rating BETWEEN 1 AND 5
);
