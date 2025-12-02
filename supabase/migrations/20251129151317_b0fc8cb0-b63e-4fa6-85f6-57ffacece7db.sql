-- Fix the function search path security issue
-- Zweck: Migration zur Korrektur der Trigger-Funktion (search_path/security).
-- Kurz: Setzt `SECURITY DEFINER` und `search_path` für die Trigger-Funktion.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;