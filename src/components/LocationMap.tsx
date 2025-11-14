import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import markerIcon2xUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HeatmapLayer } from "./HeatmapLayer";

type PermissionState = "idle" | "loading" | "granted" | "denied" | "error";

export interface MapMarker {
  id: string | number;
  position: [number, number];
  title?: string;
  description?: string;
  status?: string;
  timestamp?: string;
  color?: string; // Color for heatmap visualization (e.g., "#ef4444" for red, "#fbbf24" for yellow, "#10b981" for green)
}

interface LocationMapProps {
  markers?: MapMarker[];
  className?: string;
  height?: number | string;
  showUserMarker?: boolean;
  zoom?: number;
  emptyMessage?: string;
  focusPosition?: LatLngExpression;
  showHeatmap?: boolean;
  heatmapIntensity?: number; // Intensity multiplier for heatmap points
}

// Configure default Leaflet marker assets
const DefaultIcon = L.icon({
  iconRetinaUrl: markerIcon2xUrl,
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const DEFAULT_CENTER: LatLngExpression = [20.5937, 78.9629]; // India centroid

const Recenter = ({ position }: { position: LatLngExpression }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(position, map.getZoom(), { animate: true });
  }, [map, position]);

  return null;
};

export const LocationMap = ({
  markers = [],
  className,
  height = "24rem",
  showUserMarker = true,
  zoom = 13,
  emptyMessage = "No data to display on the map yet.",
  focusPosition,
  showHeatmap = false,
  heatmapIntensity = 1.0,
}: LocationMapProps) => {
  const isClient = typeof window !== "undefined";
  const [permissionState, setPermissionState] = useState<PermissionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userPosition, setUserPosition] = useState<LatLngExpression | null>(null);

  const requestLocation = useCallback(() => {
    if (!isClient) {
      return;
    }

    if (!("geolocation" in navigator)) {
      setPermissionState("error");
      setErrorMessage("Geolocation is not supported by this browser.");
      return;
    }

    setPermissionState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition([pos.coords.latitude, pos.coords.longitude]);
        setPermissionState("granted");
        setErrorMessage(null);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionState("denied");
          setErrorMessage("Location permission denied. Enable it to see nearby incidents.");
        } else {
          setPermissionState("error");
          setErrorMessage(error.message || "Unable to retrieve your location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [isClient]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const mapCenter: LatLngExpression = useMemo(() => {
    if (userPosition) {
      return userPosition;
    }

    if (markers.length > 0) {
      return markers[0].position;
    }

    return DEFAULT_CENTER;
  }, [markers, userPosition]);

  // Prepare heatmap data points from markers
  const heatmapPoints = useMemo(() => {
    if (!showHeatmap || markers.length === 0) {
      return [];
    }

    // Group markers by location to calculate density
    const locationMap = new Map<string, { count: number; lat: number; lng: number }>();
    
    markers.forEach((marker) => {
      const [lat, lng] = marker.position;
      // Round to 3 decimal places (~100m precision) for clustering
      const key = `${Math.round(lat * 1000) / 1000},${Math.round(lng * 1000) / 1000}`;
      
      if (locationMap.has(key)) {
        locationMap.get(key)!.count += 1;
      } else {
        locationMap.set(key, { count: 1, lat, lng });
      }
    });

    // Convert to heatmap format: [lat, lng, intensity]
    // Intensity is normalized based on max count in the dataset
    const counts = Array.from(locationMap.values()).map(v => v.count);
    const maxCount = counts.length > 0 ? Math.max(...counts) : 1;
    
    return Array.from(locationMap.values()).map(({ lat, lng, count }) => {
      // Normalize intensity (0.1 to 1.0) based on count relative to max
      const intensity = Math.max(0.1, (count / maxCount) * heatmapIntensity);
      return [lat, lng, intensity] as [number, number, number];
    });
  }, [markers, showHeatmap, heatmapIntensity]);

  if (!isClient) {
    return (
      <div
        className={cn(
          "flex h-full min-h-[16rem] w-full items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground",
          className
        )}
      >
        Loading map...
      </div>
    );
  }

  return (
    <div className={cn("relative w-full overflow-hidden rounded-lg border", className)} style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Heatmap Layer - shown when showHeatmap is true */}
        {showHeatmap && heatmapPoints.length > 0 && (
          <HeatmapLayer
            points={heatmapPoints}
            options={{
              radius: 30,
              blur: 20,
              maxZoom: 18,
              minOpacity: 0.1,
            }}
          />
        )}

        {userPosition && showUserMarker && (
          <>
            <CircleMarker
              center={userPosition as LatLngExpression}
              pathOptions={{ color: "#2563eb", fillColor: "#93c5fd", fillOpacity: 0.6 }}
              radius={10}
            />
            <Marker position={userPosition as LatLngExpression}>
              <Popup>You're here</Popup>
            </Marker>
            <Recenter position={userPosition as LatLngExpression} />
          </>
        )}

        {!userPosition && <Recenter position={mapCenter} />}

        {focusPosition && <Recenter position={focusPosition} />}

        {/* Show markers only when heatmap is not enabled, or show both if needed */}
        {(!showHeatmap || !heatmapPoints.length) && markers.map((marker) => {
          // Use CircleMarker for color-coded heatmap visualization
          const markerColor = marker.color || "#3b82f6"; // default blue if no color specified
          return (
            <CircleMarker
              key={marker.id}
              center={marker.position}
              pathOptions={{
                color: markerColor,
                fillColor: markerColor,
                fillOpacity: 0.7,
                weight: 2,
              }}
              radius={8}
            >
              <Popup>
                <div className="space-y-1 text-sm">
                  {marker.title && <p className="font-semibold">{marker.title}</p>}
                  {marker.status && (
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Status: {marker.status}
                    </p>
                  )}
                  {marker.description && <p className="text-xs">{marker.description}</p>}
                  {marker.timestamp && (
                    <p className="text-xs text-muted-foreground">Updated: {marker.timestamp}</p>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {markers.length === 0 && permissionState !== "loading" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      )}

      {permissionState === "loading" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm text-sm font-medium">
          Requesting location access…
        </div>
      )}

      {(permissionState === "denied" || permissionState === "error") && (
        <div className="absolute inset-x-4 bottom-4 rounded-lg border bg-background/95 p-4 shadow-lg">
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>{errorMessage}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" onClick={requestLocation}>
                Retry Location
              </Button>
              <span>If the issue persists, allow location access in your browser settings.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationMap;

