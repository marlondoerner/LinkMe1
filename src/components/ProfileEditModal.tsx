/*
 * Zweck: Modal zum Erstellen/Ändern eines Profils.
 * Kurz: UI zum Bearbeiten von Profilnummer, Bio, Bild-URL, Social Links und Standorten.
 */
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, MapPin, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile {
  id: string;
  profile_number: string;
  bio: string | null;
  profile_picture_url: string | null;
  qr_code_url: string | null;
}

interface SocialLink {
  id?: string;
  platform: string;
  url: string;
}

interface Location {
  id?: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface ProfileEditModalProps {
  profile: Profile | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProfileEditModal = ({ profile, isOpen, onClose }: ProfileEditModalProps) => {
  const [profileNumber, setProfileNumber] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileNumber(profile.profile_number);
      setBio(profile.bio || "");
      setProfilePicture(profile.profile_picture_url || "");
      loadSocialLinks();
      loadLocations();
    } else {
      // Reset for new profile
      setProfileNumber("");
      setBio("");
      setProfilePicture("");
      setSocialLinks([]);
      setLocations([]);
    }
  }, [profile]);

  // Lädt initial Social Links und Locations wenn ein Profil übergeben wurde

  const loadSocialLinks = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from("social_links")
      .select("*")
      .eq("profile_id", profile.id);

    if (data && !error) {
      setSocialLinks(data);
    }
  };

  // Lädt Social Links aus der DB für das gegebene Profil

  const loadLocations = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .eq("profile_id", profile.id);

    if (data && !error) {
      setLocations(data);
    }
  };

  // Lädt gespeicherte Standorte für das Profil

  const handleAddSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: "", url: "" }]);
  };

  const handleRemoveSocialLink = async (index: number) => {
    const link = socialLinks[index];
    if (link.id) {
      await supabase.from("social_links").delete().eq("id", link.id);
    }
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const handleAddLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocations([
            ...locations,
            {
              name: "",
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          ]);
        },
        () => {
          toast.error("Could not get your location");
        }
      );
    } else {
      toast.error("Geolocation is not supported");
    }
  };

  // Fügt aktuellen Standort hinzu (falls Berechtigung vorhanden)

  const handleRemoveLocation = async (index: number) => {
    const loc = locations[index];
    if (loc.id) {
      await supabase.from("locations").delete().eq("id", loc.id);
    }
    setLocations(locations.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!profileNumber || profileNumber.length !== 4) {
      toast.error("Please enter a valid 4-digit number");
      return;
    }

    setIsLoading(true);

    try {
      // Save or update profile
      let profileId = profile?.id;

      if (profile) {
        // Update existing profile
        const { error } = await supabase
          .from("profiles")
          .update({
            bio,
            profile_picture_url: profilePicture,
          })
          .eq("id", profile.id);

        if (error) throw error;
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from("profiles")
          .insert({
            profile_number: profileNumber,
            bio,
            profile_picture_url: profilePicture,
          })
          .select()
          .single();

        if (error) {
          if (error.code === "23505") {
            toast.error("This number is already taken");
            setIsLoading(false);
            return;
          }
          throw error;
        }

        profileId = data.id;
        localStorage.setItem("my_profile_number", profileNumber);
      }

      // Save social links
      if (profileId) {
        // Delete old links and insert new ones
        await supabase.from("social_links").delete().eq("profile_id", profileId);

        const linksToInsert = socialLinks
          .filter((link) => link.platform && link.url)
          .map((link) => ({
            profile_id: profileId,
            platform: link.platform,
            url: link.url,
          }));

        if (linksToInsert.length > 0) {
          await supabase.from("social_links").insert(linksToInsert);
        }

        // Save locations
        await supabase.from("locations").delete().eq("profile_id", profileId);

        const locationsToInsert = locations
          .filter((loc) => loc.name)
          .map((loc) => ({
            profile_id: profileId,
            name: loc.name,
            latitude: loc.latitude,
            longitude: loc.longitude,
          }));

        if (locationsToInsert.length > 0) {
          await supabase.from("locations").insert(locationsToInsert);
        }
      }

      toast.success("Profile saved successfully!");
      onClose();
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Speichert Profil + zugehörige SocialLinks und Locations in der DB

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-card border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold neon-text">
            {profile ? "Edit Profile" : "Create Profile"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Number */}
          <div className="space-y-2">
            <Label>Profile Number (4 digits)</Label>
            <Input
              placeholder="0000"
              value={profileNumber}
              onChange={(e) => setProfileNumber(e.target.value.replace(/\D/g, "").slice(0, 4))}
              maxLength={4}
              disabled={!!profile}
              className="glass-card border-primary/30"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="glass-card border-primary/30"
            />
          </div>

          {/* Profile Picture */}
          <div className="space-y-2">
            <Label>Profile Picture URL</Label>
            <Input
              placeholder="https://..."
              value={profilePicture}
              onChange={(e) => setProfilePicture(e.target.value)}
              className="glass-card border-primary/30"
            />
          </div>

          {/* Social Links */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Social Links</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSocialLink}
                className="border-primary/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Link
              </Button>
            </div>
            <div className="space-y-2">
              {socialLinks.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Platform (e.g., TikTok)"
                    value={link.platform}
                    onChange={(e) => {
                      const newLinks = [...socialLinks];
                      newLinks[index].platform = e.target.value;
                      setSocialLinks(newLinks);
                    }}
                    className="glass-card border-primary/30"
                  />
                  <Input
                    placeholder="URL"
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...socialLinks];
                      newLinks[index].url = e.target.value;
                      setSocialLinks(newLinks);
                    }}
                    className="glass-card border-primary/30"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSocialLink(index)}
                    className="hover:bg-destructive/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Locations</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLocation}
                className="border-primary/30"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Add Current Location
              </Button>
            </div>
            <div className="space-y-2">
              {locations.map((loc, index) => (
                <div key={index} className="flex gap-2 items-center glass-card p-2 rounded">
                  <MapPin className="w-4 h-4 text-primary" />
                  <Input
                    placeholder="Location name"
                    value={loc.name}
                    onChange={(e) => {
                      const newLocs = [...locations];
                      newLocs[index].name = e.target.value;
                      setLocations(newLocs);
                    }}
                    className="flex-1 border-primary/30"
                  />
                  <span className="text-xs text-muted-foreground">
                    {loc.latitude.toFixed(2)}, {loc.longitude.toFixed(2)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveLocation(index)}
                    className="hover:bg-destructive/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary to-secondary text-lg py-6"
          >
            {isLoading ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditModal;
