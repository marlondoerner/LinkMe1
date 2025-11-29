import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

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
  const [locations, setLocations] = useState<Location[]>([]);

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

    map.current.scrollZoom.disable();

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

  useEffect(() => {
    // Load locations for all profiles and add markers
    // This is a simplified version - in real app would fetch from database
    if (map.current && profiles.length > 0) {
      // Add markers for profiles with locations
      // For demo, we'll add random locations
      profiles.forEach((profile, index) => {
        if (!map.current) return;

        const lat = (Math.random() - 0.5) * 160;
        const lng = (Math.random() - 0.5) * 360;

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

        new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map.current!);
      });
    }
  }, [profiles, onProfileClick]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-background/20" />
    </div>
  );
};

export default MapView;
