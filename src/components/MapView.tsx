/*
 * Zweck: Weltkarte mit Profil-Markern.
 * Kurz: Initialisiert Mapbox, lädt `locations` aus Supabase und zeigt Marker mit Profilbild.
 */
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  profile_number: string;
  bio: string | null;
  profile_picture_url: string | null;
  qr_code_url: string | null;
}

interface Location {
  id: string;
  profile_id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface MapViewProps {
  mapboxToken: string;
  profiles: Profile[];
  onProfileClick: (profile: Profile) => void;
}

const MapView = ({ mapboxToken, profiles, onProfileClick }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  // useEffect: Karte initialisieren und Rotation konfigurieren

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      projection: { name: "globe" },
      zoom: 1.5,
      center: [0, 20],
      pitch: 45,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      "top-right"
    );

    map.current.on("style.load", () => {
      map.current?.setFog({
        color: "rgb(10, 15, 20)",
        "high-color": "rgb(30, 40, 50)",
        "horizon-blend": 0.2,
      });
    });

    // Rotation animation
    const secondsPerRevolution = 240;
    const maxSpinZoom = 5;
    const slowSpinZoom = 3;
    let userInteracting = false;
    let spinEnabled = true;

    function spinGlobe() {
      if (!map.current) return;

      const zoom = map.current.getZoom();
      if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
        let distancePerSecond = 360 / secondsPerRevolution;
        if (zoom > slowSpinZoom) {
          const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
          distancePerSecond *= zoomDif;
        }
        const center = map.current.getCenter();
        center.lng -= distancePerSecond;
        map.current.easeTo({ center, duration: 1000, easing: (n) => n });
      }
    }

    map.current.on("mousedown", () => {
      userInteracting = true;
    });

    map.current.on("dragstart", () => {
      userInteracting = true;
    });

    map.current.on("mouseup", () => {
      userInteracting = false;
      spinGlobe();
    });

    map.current.on("touchend", () => {
      userInteracting = false;
      spinGlobe();
    });

    map.current.on("moveend", () => {
      spinGlobe();
    });

    spinGlobe();

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Lädt alle Locations aus der Datenbank und abonniert Realtime-Änderungen
  useEffect(() => {
    const loadLocations = async () => {
      const { data, error } = await supabase.from("locations").select("*");
      if (data && !error) setLocations(data);
    };
    loadLocations();

    // Subscribe to realtime updates for locations
    const channel = supabase
      .channel("locations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "locations",
        },
        () => {
          loadLocations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Aktualisiert Marker auf der Karte wenn `locations` oder `profiles` sich ändern
  useEffect(() => {
    if (!map.current || locations.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Create a map of profile_id to profile for quick lookup
    const profileMap = new Map(profiles.map(p => [p.id, p]));

    // Add markers for each location
    locations.forEach((location) => {
      const profile = profileMap.get(location.profile_id);
      if (!profile || !map.current) return;

      const el = document.createElement("div");
      el.className = "marker";
      el.style.width = "40px";
      el.style.height = "40px";
      el.style.borderRadius = "50%";
      el.style.border = "3px solid rgba(0, 255, 255, 0.6)";
      el.style.cursor = "pointer";
      el.style.backgroundImage = profile.profile_picture_url
        ? `url(${profile.profile_picture_url})`
        : "linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(255, 0, 255, 0.3))";
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center";
      el.style.boxShadow = "0 0 20px rgba(0, 255, 255, 0.5)";

      el.addEventListener("click", () => {
        onProfileClick(profile);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([location.longitude, location.latitude])
        .addTo(map.current!);
      
      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, [locations, profiles, onProfileClick]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-background/20" />
    </div>
  );
};

export default MapView;
