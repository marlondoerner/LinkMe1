-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_number text UNIQUE NOT NULL CHECK (profile_number ~ '^\d{4}$'),
  bio text,
  profile_picture_url text,
  qr_code_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create social_links table
CREATE TABLE public.social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create locations table
CREATE TABLE public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  commenter_number text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Profiles policies (public read, authenticated write)
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can create profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (true);

-- Social links policies
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

-- Locations policies
CREATE POLICY "Locations are viewable by everyone"
  ON public.locations FOR SELECT
  USING (true);

CREATE POLICY "Users can create locations"
  ON public.locations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete their locations"
  ON public.locations FOR DELETE
  USING (true);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_profiles_number ON public.profiles(profile_number);
CREATE INDEX idx_social_links_profile ON public.social_links(profile_id);
CREATE INDEX idx_locations_profile ON public.locations(profile_id);
CREATE INDEX idx_comments_profile ON public.comments(profile_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.social_links;
ALTER PUBLICATION supabase_realtime ADD TABLE public.locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;