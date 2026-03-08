
-- Allow properties without an owner for seed data
ALTER TABLE public.properties ALTER COLUMN owner_id DROP NOT NULL;
