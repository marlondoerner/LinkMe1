/*
 * Zweck: Erstellt und exportiert den Supabase-Client für die App.
 * Kurz: Initialisiert Supabase mit Projekt-URL und Publishable Key.
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Supabase-URL und Publishable Key aus Umgebungsvariablen (Vite)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Hinweis: Import-Beispiel
// import { supabase } from "@/integrations/supabase/client";

// Client erzeugen: generisch typisiert mit `Database`-Typ
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    // Auth-Sitzung im localStorage speichern
    storage: localStorage,
    // Sitzung zwischen Seitenladevorgängen erhalten
    persistSession: true,
    // Token automatisch erneuern
    autoRefreshToken: true,
  }
});