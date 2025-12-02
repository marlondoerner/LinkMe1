-- Zweck: Erstellt die Datenbank-Tabellen (`profiles`, `social_links`, `locations`, `comments`) und RLS-Policies.
-- Kurz: Schema-Migration für das Supabase-Projekt.

-- Tabelle: profiles - Speichert Nutzerprofil-Informationen
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_number text UNIQUE NOT NULL CHECK (profile_number ~ '^\d{4}$'),  -- 4-stellige eindeutige Nummer
  bio text,  -- Benutzerbeschreibung
  profile_picture_url text,  -- URL zum Profilbild
  qr_code_url text,  -- QR-Code (für Profile teilbar)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabelle: social_links - Social-Media-Links pro Profil
CREATE TABLE public.social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,  -- FK zu Profil
  platform text NOT NULL,  -- z.B. "TikTok", "Instagram"
  url text NOT NULL,  -- Link zur Social-Media-Seite
  created_at timestamptz DEFAULT now()
);

-- Tabelle: locations - Standorte, die Nutzer auf der Karte markieren
CREATE TABLE public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,  -- FK zu Profil
  name text NOT NULL,  -- Standort-Name
  latitude double precision NOT NULL,  -- Breitengrad
  longitude double precision NOT NULL,  -- Längengrad
  created_at timestamptz DEFAULT now()
);

-- Tabelle: comments - Kommentare, die andere auf Profile schreiben können
CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,  -- FK zu Profil (dessen Profil)
  commenter_number text NOT NULL,  -- 4-stellige Nummer des Kommentators
  content text NOT NULL,  -- Kommentarinhalt
  created_at timestamptz DEFAULT now()
);

-- Row Level Security aktivieren (Datenschutz auf DB-Ebene)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Policies für `profiles`: öffentlich lesbar, aber veränderbar (Demo-App)
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);  -- Jeder kann alle Profile sehen

CREATE POLICY "Users can create profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);  -- Jeder kann Profile erstellen

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (true);  -- Vereinfacht: jeder kann updaten (idealer: nur eigenes Profil)

-- Policies für `social_links`: öffentlich, aber nutzbar
CREATE POLICY "Social links are viewable by everyone"
  ON public.social_links FOR SELECT
  USING (true);

CREATE POLICY "Users can create social links"
  ON public.social_links FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their social links"
  ON public.social_links FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete their social links"
  ON public.social_links FOR DELETE
  USING (true);

-- Policies für `locations`: öffentlich sichtbar
CREATE POLICY "Locations are viewable by everyone"
  ON public.locations FOR SELECT
  USING (true);

CREATE POLICY "Users can create locations"
  ON public.locations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete their locations"
  ON public.locations FOR DELETE
  USING (true);

-- Policies für `comments`: öffentlich lesbar, jeder kann kommentieren
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (true);

-- Indexe: verbessern Abfrage-Performance
CREATE INDEX idx_profiles_number ON public.profiles(profile_number);  -- Schnelle Suche nach Nummer
CREATE INDEX idx_social_links_profile ON public.social_links(profile_id);
CREATE INDEX idx_locations_profile ON public.locations(profile_id);
CREATE INDEX idx_comments_profile ON public.comments(profile_id);

-- Trigger-Funktion: aktualisiert `updated_at` Timestamp automatisch
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger auf `profiles` registrieren
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Realtime Subscriptions aktivieren: ermöglicht Live-Updates via WebSocket
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.social_links;
ALTER PUBLICATION supabase_realtime ADD TABLE public.locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;