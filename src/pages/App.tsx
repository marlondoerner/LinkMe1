import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, Search, User, Settings, Plus } from "lucide-react";
import MapView from "@/components/MapView";
import ProfileModal from "@/components/ProfileModal";
import ProfileEditModal from "@/components/ProfileEditModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile {
  id: string;
  profile_number: string;
  bio: string | null;
  profile_picture_url: string | null;
  qr_code_url: string | null;
}

const AppPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mapboxToken, setMapboxToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(true);
  const [searchNumber, setSearchNumber] = useState("");
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("mapbox_token");
    if (token) {
      setMapboxToken(token);
      setShowTokenInput(false);
    }

    loadMyProfile();
    loadAllProfiles();

    // Check if URL has a profile number
    const urlNumber = searchParams.get("profile");
    if (urlNumber) {
      handleSearch(urlNumber);
    }

    // Subscribe to realtime updates
    const channel = supabase
      .channel("profiles-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        () => {
          loadAllProfiles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [searchParams]);

  const loadMyProfile = async () => {
    const storedNumber = localStorage.getItem("my_profile_number");
    if (storedNumber) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("profile_number", storedNumber)
        .maybeSingle();

      if (data && !error) {
        setMyProfile(data);
      }
    }
  };

  const loadAllProfiles = async () => {
    const { data, error } = await supabase.from("profiles").select("*");

    if (data && !error) {
      setAllProfiles(data);
    }
  };

  const handleSaveToken = () => {
    if (mapboxToken.trim()) {
      localStorage.setItem("mapbox_token", mapboxToken);
      setShowTokenInput(false);
      toast.success("Mapbox token saved!");
    }
  };

  const handleSearch = async (number?: string) => {
    const searchNum = number || searchNumber;
    if (searchNum.length !== 4) {
      toast.error("Please enter a 4-digit number");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("profile_number", searchNum)
      .maybeSingle();

    if (data && !error) {
      setSelectedProfile(data);
      setShowProfileModal(true);
    } else {
      toast.error("Profile not found");
    }
  };

  const handleCreateProfile = () => {
    setSelectedProfile(null);
    setShowEditModal(true);
  };

  const handleEditMyProfile = () => {
    if (myProfile) {
      setSelectedProfile(myProfile);
      setShowEditModal(true);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Navigation Bar */}
      <div className="glass-card border-b border-primary/20 p-4 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="hover:bg-primary/20"
          >
            <Home className="w-5 h-5" />
          </Button>

          <div className="flex-1 max-w-md">
            <div className="flex gap-2">
              <Input
                placeholder="Search by number (4 digits)"
                value={searchNumber}
                onChange={(e) => setSearchNumber(e.target.value.replace(/\D/g, "").slice(0, 4))}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="glass-card border-primary/30"
                maxLength={4}
              />
              <Button
                onClick={() => handleSearch()}
                className="bg-primary/80 hover:bg-primary"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            {myProfile ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEditMyProfile}
                className="hover:bg-primary/20"
              >
                <Settings className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                onClick={handleCreateProfile}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Map */}
      <div className="flex-1 relative">
        {showTokenInput ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm z-10">
            <div className="glass-card p-8 rounded-xl max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4 neon-text">Enter Mapbox Token</h2>
              <p className="text-muted-foreground mb-4">
                To view the map, please enter your Mapbox API token.
              </p>
              <Input
                placeholder="Mapbox API Token"
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                className="mb-4 glass-card border-primary/30"
              />
              <Button
                onClick={handleSaveToken}
                className="w-full bg-gradient-to-r from-primary to-secondary"
              >
                Save Token
              </Button>
            </div>
          </div>
        ) : (
          <MapView
            mapboxToken={mapboxToken}
            profiles={allProfiles}
            onProfileClick={(profile) => {
              setSelectedProfile(profile);
              setShowProfileModal(true);
            }}
          />
        )}
      </div>

      {/* Modals */}
      {showProfileModal && selectedProfile && (
        <ProfileModal
          profile={selectedProfile}
          isOpen={showProfileModal}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedProfile(null);
          }}
        />
      )}

      {showEditModal && (
        <ProfileEditModal
          profile={selectedProfile}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProfile(null);
            loadMyProfile();
            loadAllProfiles();
          }}
        />
      )}
    </div>
  );
};

export default AppPage;
