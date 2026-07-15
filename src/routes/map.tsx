import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef, useMemo } from "react";
import {
  MapPin,
  Search,
  SlidersHorizontal,
  Calendar,
  BookOpen,
  Headphones,
  Play,
  X,
  Layers,
  ArrowLeft,
  Navigation,
  Sparkles,
  Flame,
  User,
  Tags,
  Map as MapIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStoriesData } from "@/lib/stories-data";
import { useI18nStore, translateStory } from "@/lib/i18n";
import { useAudioStore } from "@/lib/audio-store";
import { SiteLayout } from "@/components/site/Layout";

export const Route = createFileRoute("/map")({
  component: InteractiveMapPage,
});

// GPS Coordinates for Indian States & Union Territories
const STATE_GPS: Record<string, { lat: number; lng: number }> = {
  "Andaman and Nicobar Islands": { lat: 11.7401, lng: 92.6586 },
  "Andhra Pradesh": { lat: 15.9129, lng: 79.74 },
  "Arunachal Pradesh": { lat: 28.218, lng: 94.7278 },
  Assam: { lat: 26.2006, lng: 92.9376 },
  Bihar: { lat: 25.0961, lng: 85.3131 },
  Chandigarh: { lat: 30.7333, lng: 76.7794 },
  Chhattisgarh: { lat: 21.2787, lng: 81.8661 },
  "Dadra and Nagar Haveli": { lat: 20.1809, lng: 73.0169 },
  "Daman and Diu": { lat: 20.4283, lng: 72.8397 },
  Delhi: { lat: 28.6139, lng: 77.209 },
  Goa: { lat: 15.2993, lng: 74.124 },
  Gujarat: { lat: 22.2587, lng: 71.1924 },
  Haryana: { lat: 29.0588, lng: 76.0856 },
  "Himachal Pradesh": { lat: 31.1048, lng: 77.1734 },
  "Jammu and Kashmir": { lat: 34.0837, lng: 74.7973 },
  Jharkhand: { lat: 23.6102, lng: 85.2799 },
  Karnataka: { lat: 15.3173, lng: 75.7139 },
  Kerala: { lat: 10.8505, lng: 76.2711 },
  Lakshadweep: { lat: 10.5667, lng: 72.6333 },
  "Madhya Pradesh": { lat: 22.9734, lng: 78.6569 },
  Maharashtra: { lat: 19.7515, lng: 75.7139 },
  Manipur: { lat: 24.6637, lng: 93.9063 },
  Meghalaya: { lat: 25.467, lng: 91.3662 },
  Mizoram: { lat: 23.1645, lng: 92.9376 },
  Nagaland: { lat: 26.1584, lng: 94.5624 },
  Odisha: { lat: 20.9517, lng: 85.0985 },
  Puducherry: { lat: 11.9416, lng: 79.8083 },
  Punjab: { lat: 31.1471, lng: 75.3412 },
  Rajasthan: { lat: 27.0238, lng: 74.2179 },
  Sikkim: { lat: 27.533, lng: 88.5122 },
  "Tamil Nadu": { lat: 11.1271, lng: 78.6569 },
  Telangana: { lat: 18.1124, lng: 79.0193 },
  Tripura: { lat: 23.9408, lng: 91.9882 },
  "Uttar Pradesh": { lat: 26.8467, lng: 80.9462 },
  Uttarakhand: { lat: 30.0668, lng: 79.0193 },
  "West Bengal": { lat: 22.9868, lng: 87.855 },
  Ladakh: { lat: 34.1526, lng: 77.5771 },
};

// Major City GPS Coordinates
const CITY_GPS: Record<string, { lat: number; lng: number }> = {
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Delhi: { lat: 28.6139, lng: 77.209 },
  Bangalore: { lat: 12.9716, lng: 77.5946 },
  Hyderabad: { lat: 17.385, lng: 78.4867 },
  Ahmedabad: { lat: 23.0225, lng: 72.5714 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Kolkata: { lat: 22.5726, lng: 88.3639 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Jaipur: { lat: 26.9124, lng: 75.7873 },
  Lucknow: { lat: 26.8467, lng: 80.9462 },
  Kanpur: { lat: 26.4499, lng: 80.3319 },
  Nagpur: { lat: 21.1458, lng: 79.0882 },
  Indore: { lat: 22.7196, lng: 75.8577 },
  Thane: { lat: 19.2183, lng: 72.9781 },
  Bhopal: { lat: 23.2599, lng: 77.4126 },
  Visakhapatnam: { lat: 17.6868, lng: 83.2185 },
  Pimpri: { lat: 18.6298, lng: 73.7997 },
  Patna: { lat: 25.5941, lng: 85.1376 },
  Vadodara: { lat: 22.3072, lng: 73.1812 },
  Ghaziabad: { lat: 28.6692, lng: 77.4538 },
  Ludhiana: { lat: 30.901, lng: 75.8573 },
  Agra: { lat: 27.1767, lng: 78.0081 },
  Nashik: { lat: 19.9975, lng: 73.7898 },
  Faridabad: { lat: 28.4089, lng: 77.3178 },
  Meerut: { lat: 28.9845, lng: 77.7064 },
  Rajkot: { lat: 22.3039, lng: 70.8022 },
  Kalyan: { lat: 19.2403, lng: 73.1305 },
  Vasai: { lat: 19.3913, lng: 72.8397 },
  Varanasi: { lat: 25.3176, lng: 82.9739 },
  Srinagar: { lat: 34.0837, lng: 74.7973 },
  Aurangabad: { lat: 19.8762, lng: 75.3433 },
  Dhanbad: { lat: 23.7957, lng: 86.4304 },
  Amritsar: { lat: 31.634, lng: 74.8723 },
  "Navi Mumbai": { lat: 19.033, lng: 73.0297 },
  Allahabad: { lat: 25.4358, lng: 81.8463 },
  Ranchi: { lat: 23.3441, lng: 85.3096 },
  Howrah: { lat: 22.5769, lng: 88.3186 },
  Coimbatore: { lat: 11.0168, lng: 76.9558 },
  Jabalpur: { lat: 23.167, lng: 79.9322 },
  Gwalior: { lat: 26.2183, lng: 78.1828 },
  Vijayawada: { lat: 16.5062, lng: 80.648 },
  Jodhpur: { lat: 26.2389, lng: 73.0243 },
  Madurai: { lat: 9.9252, lng: 78.1198 },
  Raipur: { lat: 21.2514, lng: 81.6296 },
  Kota: { lat: 25.18, lng: 75.83 },
  Guwahati: { lat: 26.1445, lng: 91.7362 },
  Chandigarh: { lat: 30.7333, lng: 76.7794 },
  Solapur: { lat: 17.6599, lng: 75.9064 },
  Hubli: { lat: 15.3647, lng: 75.124 },
  Bareilly: { lat: 28.364, lng: 79.415 },
  Moradabad: { lat: 28.8351, lng: 78.7749 },
  Mysore: { lat: 12.2958, lng: 76.6394 },
  Gurgaon: { lat: 28.4595, lng: 77.0266 },
  Aligarh: { lat: 27.8974, lng: 78.088 },
  Jalandhar: { lat: 31.326, lng: 75.5762 },
  Tiruchirappalli: { lat: 10.7905, lng: 78.7047 },
  Bhubaneswar: { lat: 20.2961, lng: 85.8245 },
  Salem: { lat: 11.6643, lng: 78.146 },
  Dehradun: { lat: 30.3165, lng: 78.0322 },
};

function loadLeaflet(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).L) {
      resolve();
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Leaflet"));
    document.body.appendChild(script);
  });
}

function InteractiveMapPage() {
  const { stories: dbStories } = useStoriesData();
  const lang = useI18nStore((s) => s.lang);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapType, setMapType] = useState<"dark" | "satellite" | "terrain">("dark");
  const [overlayMode, setOverlayMode] = useState<"pins" | "heatmap" | "clusters">("pins");
  const [selectedStory, setSelectedStory] = useState<any>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [yearRange, setYearRange] = useState<[number, number]>([1947, 2026]);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);

  // Localized and translated stories data
  const localizedStories = useMemo(() => {
    return dbStories.map((s) => translateStory(s, lang));
  }, [dbStories, lang]);

  // Unique list values for Filter Dropdowns
  const statesList = useMemo(() => {
    const list = new Set(localizedStories.map((s) => s.region).filter(Boolean));
    return Array.from(list).sort();
  }, [localizedStories]);

  const themesList = useMemo(() => {
    const list = new Set<string>();
    localizedStories.forEach((s) => {
      if (Array.isArray(s.themes)) {
        s.themes.forEach((t) => list.add(t));
      }
    });
    return Array.from(list).sort();
  }, [localizedStories]);

  const authorsList = useMemo(() => {
    const list = new Set(localizedStories.map((s) => s.authorName).filter(Boolean));
    return Array.from(list).sort();
  }, [localizedStories]);

  // Filtered stories based on current control inputs
  const filteredStories = useMemo(() => {
    return localizedStories.filter((s: any) => {
      const cityVal = s.city?.name || s.city || "";
      const matchSearch =
        !searchQuery ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cityVal && cityVal.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchState = !selectedState || s.region === selectedState;
      const matchTheme =
        !selectedTheme || (Array.isArray(s.themes) && s.themes.includes(selectedTheme));
      const matchAuthor = !selectedAuthor || s.authorName === selectedAuthor;

      // Extract year from story publication date or fallback to 2026
      const pubDate = s.publishedAt || s.publishDate;
      const pubYear = pubDate ? new Date(pubDate).getFullYear() : 2026;
      const matchYear = pubYear >= yearRange[0] && pubYear <= yearRange[1];

      return matchSearch && matchState && matchTheme && matchAuthor && matchYear;
    });
  }, [localizedStories, searchQuery, selectedState, selectedTheme, selectedAuthor, yearRange]);

  // Dynamically assign geocoded offsets to stories
  const storyLocations = useMemo(() => {
    // Keep track of offsets used per coordinate to disperse overlapping points
    const coordUsage: Record<string, number> = {};

    return filteredStories.map((story: any) => {
      let lat = 20.5937; // default center of India
      let lng = 78.9629;

      const cityName = story.city?.name || story.city || "";
      if (cityName && CITY_GPS[cityName]) {
        lat = CITY_GPS[cityName].lat;
        lng = CITY_GPS[cityName].lng;
      } else if (story.region && STATE_GPS[story.region]) {
        lat = STATE_GPS[story.region].lat;
        lng = STATE_GPS[story.region].lng;
      }

      // Disperse points slightly if they share the exact same city/state coordinates
      const key = `${lat.toFixed(3)}_${lng.toFixed(3)}`;
      const index = coordUsage[key] || 0;
      coordUsage[key] = index + 1;

      if (index > 0) {
        // Disperse points outward spirally
        const angle = index * 0.5;
        const radius = 0.08 + index * 0.02;
        lat += Math.sin(angle) * radius;
        lng += Math.cos(angle) * radius;
      }

      return {
        ...story,
        lat,
        lng,
      };
    });
  }, [filteredStories]);

  // Initialize Map
  useEffect(() => {
    let active = true;

    loadLeaflet()
      .then(() => {
        if (!active || !mapContainerRef.current) return;

        const L = (window as any).L;

        // Initialize Map
        const map = L.map(mapContainerRef.current, {
          center: [22.9734, 78.6569], // Central India
          zoom: 5,
          zoomControl: false,
          maxBounds: [
            [6, 68],
            [38, 98],
          ],
        });

        // Add zoom controls to the bottom right
        L.control.zoom({ position: "bottomright" }).addTo(map);

        mapRef.current = map;
        markersGroupRef.current = L.featureGroup().addTo(map);
        setMapLoaded(true);
      })
      .catch((err) => console.error(err));

    return () => {
      active = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Base Tile Layers based on map type selection
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const L = (window as any).L;

    // Remove existing tile layers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = "";
    let attribution = "";

    if (mapType === "satellite") {
      tileUrl =
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      attribution = "Tiles © Esri";
    } else if (mapType === "terrain") {
      tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png";
      attribution = "© OpenStreetMap";
    } else {
      // Dark elegant style
      tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{y}/{x}{r}.png";
      attribution = "© CARTO";
    }

    L.tileLayer(tileUrl, {
      maxZoom: 18,
      minZoom: 4,
      attribution,
    }).addTo(map);
  }, [mapLoaded, mapType]);

  // Render Markers, Clusters or Heatmaps dynamically
  useEffect(() => {
    const map = mapRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    const L = (window as any).L;

    // Clear previous markers
    markersGroup.clearLayers();

    if (overlayMode === "pins" || overlayMode === "clusters") {
      // Render story marker pins
      storyLocations.forEach((story) => {
        const markerIcon = L.divIcon({
          className: "custom-story-pin",
          html: `
            <div style="
              width: 12px;
              height: 12px;
              background-color: #C8A96A;
              border: 2px solid #000;
              border-radius: 50%;
              box-shadow: 0 0 10px #C8A96A;
              cursor: pointer;
            "></div>
          `,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const marker = L.marker([story.lat, story.lng], { icon: markerIcon });

        marker.on("click", () => {
          setSelectedStory(story);
          map.setView([story.lat, story.lng], 7, { animate: true });
        });

        // Simple hover tooltip
        marker.bindTooltip(
          `<div style="font-family: sans-serif; font-size: 11px; padding: 2px 4px; background: #141414; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: white;">
            <strong>${story.title}</strong><br/>
            <span style="color: #C8A96A;">${(story as any).city?.name || story.city || story.region}</span>
          </div>`,
          {
            permanent: false,
            direction: "top",
            opacity: 0.9,
            className: "custom-leaflet-tooltip",
          },
        );

        markersGroup.addLayer(marker);
      });
    } else if (overlayMode === "heatmap") {
      // Custom canvas-based heatmap render
      storyLocations.forEach((story) => {
        // Renders visual pulse heat wave markers
        const pulseIcon = L.divIcon({
          className: "custom-heat-pulse",
          html: `
            <div style="
              width: 32px;
              height: 32px;
              background-color: rgba(200, 169, 106, 0.15);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 8px;
                height: 8px;
                background-color: #C8A96A;
                border-radius: 50%;
                box-shadow: 0 0 10px #C8A96A;
              "></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const pulseMarker = L.marker([story.lat, story.lng], { icon: pulseIcon });
        pulseMarker.on("click", () => {
          setSelectedStory(story);
          map.setView([story.lat, story.lng], 7, { animate: true });
        });

        markersGroup.addLayer(pulseMarker);
      });
    }
  }, [storyLocations, overlayMode]);

  // Adjust zoom bounding boxes on filter changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || storyLocations.length === 0) return;

    const L = (window as any).L;

    // Pan map to fit the filter bounds
    const bounds = L.latLngBounds(storyLocations.map((s) => [s.lat, s.lng]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
  }, [selectedState, selectedTheme, selectedAuthor]);

  const handleListen = (story: any) => {
    const episode = {
      id: story.id || story.slug,
      slug: story.slug,
      title: story.title,
      titleHi: story.titleHi,
      excerpt: story.excerpt,
      excerptHi: story.excerptHi,
      audioUrl: `/api/stories/${story.slug}/audio`,
      duration: (parseInt(story.readTime || "5") || 5) * 60,
      authorName: story.authorName || "India Story Project",
      imageUrl: story.image || "/logo.png",
    };
    useAudioStore.getState().playEpisode(episode, lang);
    useAudioStore.getState().setPlayerOpen(true);
  };

  return (
    <SiteLayout>
      <div
        style={{
          height: "calc(100vh - 64px)", // subtract navbar height
          width: "100%",
          display: "flex",
          backgroundColor: "#0d0d0d",
          overflow: "hidden",
          color: "white",
        }}
      >
        {/* ────────────────── LEFT SIDEBAR FILTERS ────────────────── */}
        <aside
          style={{
            width: "360px",
            backgroundColor: "#141414",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            flexDirection: "column",
            zIndex: 10,
          }}
          className="hidden md:flex shrink-0"
        >
          {/* Header Title */}
          <div style={{ padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#C8A96A",
                marginBottom: "4px",
              }}
            >
              <Navigation size={18} />
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                Interactive Explorer
              </span>
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, margin: 0, fontFamily: "serif" }}>
              India Story Map
            </h1>
          </div>

          {/* Search bar */}
          <div style={{ padding: "16px 20px 8px 20px" }}>
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#707070",
                }}
              />
              <input
                type="text"
                placeholder="Search stories, cities, states..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  padding: "10px 12px 10px 38px",
                  fontSize: "13px",
                  color: "white",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Filter dropdowns scroll section */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px 24px 20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Select State */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    color: "#808080",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                    fontWeight: 600,
                  }}
                >
                  Explore State
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    fontSize: "13px",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  <option value="">All States ({statesList.length})</option>
                  {statesList.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Theme */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    color: "#808080",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                    fontWeight: 600,
                  }}
                >
                  Theme
                </label>
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    fontSize: "13px",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  <option value="">All Themes</option>
                  {themesList.map((th) => (
                    <option key={th} value={th}>
                      {th}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Author */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    color: "#808080",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                    fontWeight: 600,
                  }}
                >
                  Author
                </label>
                <select
                  value={selectedAuthor}
                  onChange={(e) => setSelectedAuthor(e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    fontSize: "13px",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  <option value="">All Authors</option>
                  {authorsList.map((au) => (
                    <option key={au} value={au}>
                      {au}
                    </option>
                  ))}
                </select>
              </div>

              {/* Timeline slider */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "11px",
                      color: "#808080",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}
                  >
                    Timeline Range
                  </label>
                  <span style={{ fontSize: "12px", color: "#C8A96A", fontWeight: 600 }}>
                    {yearRange[0]} - {yearRange[1]}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="range"
                    min="1947"
                    max="2026"
                    value={yearRange[0]}
                    onChange={(e) => setYearRange([parseInt(e.target.value), yearRange[1]])}
                    style={{ flex: 1, accentColor: "#C8A96A" }}
                  />
                  <input
                    type="range"
                    min="1947"
                    max="2026"
                    value={yearRange[1]}
                    onChange={(e) => setYearRange([yearRange[0], parseInt(e.target.value)])}
                    style={{ flex: 1, accentColor: "#C8A96A" }}
                  />
                </div>
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px" }}>
                <div style={{ fontSize: "12px", color: "#a0a0a0" }}>
                  Showing <strong style={{ color: "white" }}>{storyLocations.length}</strong>{" "}
                  stories on the map
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ────────────────── MAIN MAP DISPLAY CANVAS ────────────────── */}
        <main style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
          {/* Controls Widgets Row at Top of Map */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              right: "20px",
              zIndex: 100,
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              pointerEvents: "none",
            }}
          >
            {/* View Mode Toggle Controls */}
            <div
              style={{
                display: "flex",
                backgroundColor: "rgba(20, 20, 20, 0.8)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                padding: "4px",
                pointerEvents: "auto",
              }}
            >
              <button
                onClick={() => setMapType("dark")}
                style={{
                  padding: "6px 12px",
                  fontSize: "11px",
                  fontWeight: 600,
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  color: mapType === "dark" ? "black" : "white",
                  backgroundColor: mapType === "dark" ? "#C8A96A" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <MapIcon size={12} />
                Vector
              </button>
              <button
                onClick={() => setMapType("satellite")}
                style={{
                  padding: "6px 12px",
                  fontSize: "11px",
                  fontWeight: 600,
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  color: mapType === "satellite" ? "black" : "white",
                  backgroundColor: mapType === "satellite" ? "#C8A96A" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Layers size={12} />
                Satellite
              </button>
              <button
                onClick={() => setMapType("terrain")}
                style={{
                  padding: "6px 12px",
                  fontSize: "11px",
                  fontWeight: 600,
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  color: mapType === "terrain" ? "black" : "white",
                  backgroundColor: mapType === "terrain" ? "#C8A96A" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Navigation size={12} />
                Outdoors
              </button>
            </div>

            {/* Overlay Layers Select */}
            <div
              style={{
                display: "flex",
                backgroundColor: "rgba(20, 20, 20, 0.8)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                padding: "4px",
                pointerEvents: "auto",
              }}
            >
              <button
                onClick={() => setOverlayMode("pins")}
                style={{
                  padding: "6px 12px",
                  fontSize: "11px",
                  fontWeight: 600,
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  color: overlayMode === "pins" ? "black" : "white",
                  backgroundColor: overlayMode === "pins" ? "#C8A96A" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <MapPin size={12} />
                Pins
              </button>
              <button
                onClick={() => setOverlayMode("heatmap")}
                style={{
                  padding: "6px 12px",
                  fontSize: "11px",
                  fontWeight: 600,
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  color: overlayMode === "heatmap" ? "black" : "white",
                  backgroundColor: overlayMode === "heatmap" ? "#C8A96A" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Flame size={12} />
                Pulse
              </button>
            </div>
          </div>

          {/* Leaflet map hook container */}
          <div ref={mapContainerRef} style={{ flex: 1, zIndex: 1, cursor: "grab" }} />

          {/* ────────────────── FLOATING ACTIVE STORY PREVIEW OVERLAY ────────────────── */}
          <AnimatePresence>
            {selectedStory && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                style={{
                  position: "absolute",
                  bottom: "20px",
                  left: "20px",
                  right: "20px",
                  maxWidth: "480px",
                  backgroundColor: "rgba(20, 20, 20, 0.9)",
                  backdropFilter: "blur(18px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  padding: "16px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                  zIndex: 200,
                  color: "white",
                }}
              >
                <button
                  onClick={() => setSelectedStory(null)}
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    background: "transparent",
                    border: "none",
                    color: "#a0a0a0",
                    cursor: "pointer",
                  }}
                >
                  <X size={16} />
                </button>

                <div style={{ display: "flex", gap: "16px" }}>
                  {selectedStory.image && (
                    <img
                      src={selectedStory.image}
                      alt={selectedStory.title}
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "8px",
                        objectFit: "cover",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: "9px",
                        color: "#C8A96A",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                      }}
                    >
                      {selectedStory.region} •{" "}
                      {selectedStory.city?.name || selectedStory.city || "Region"}
                    </span>
                    <h3
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        marginTop: "4px",
                        marginBottom: "6px",
                        lineHeight: "1.3",
                        fontFamily: "serif",
                      }}
                    >
                      {selectedStory.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#a0a0a0",
                        lineHeight: "1.4",
                        margin: 0,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {selectedStory.excerpt}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "16px",
                    display: "flex",
                    gap: "10px",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    paddingTop: "12px",
                  }}
                >
                  <Link
                    to="/stories/$slug"
                    params={{ slug: selectedStory.slug }}
                    style={{
                      flex: 1,
                      backgroundColor: "#C8A96A",
                      color: "black",
                      textDecoration: "none",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <BookOpen size={14} />
                    Read Story
                  </Link>

                  <button
                    onClick={() => handleListen(selectedStory)}
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(255,255,255,0.05)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.08)",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <Headphones size={14} />
                    Listen Audio
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </SiteLayout>
  );
}
