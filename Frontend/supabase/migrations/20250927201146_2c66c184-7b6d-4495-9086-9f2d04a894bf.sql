-- Fix RLS: allow client-side INSERTs into sustainability_table
ALTER TABLE public.sustainability_table ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "sustainability_table_public_insert"
  ON public.sustainability_table
  FOR INSERT
  WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;