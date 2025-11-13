import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import markerIcon2xUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PermissionState = "idle" | "loading" | "granted" | "denied" | "error";

export interface MapMarker {
  id: string | number;
  position: [number, number];
  title?: string;
  description?: string;
  status?: string;
  timestamp?: string;
}

interface LocationMapProps {
  markers?: MapMarker[];
  className?: string;
  height?: number | string;
  showUserMarker?: boolean;
  zoom?: number;
  emptyMessage?: string;
  focusPosition?: LatLngExpression;
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

        {userPosition && showUserMarker && (
          <>
            <CircleMarker
              center={userPosition}
              pathOptions={{ color: "#2563eb", fillColor: "#93c5fd", fillOpacity: 0.6 }}
              radius={10}
            />
            <Marker position={userPosition}>
              <Popup>You're here</Popup>
            </Marker>
            <Recenter position={userPosition} />
          </>
        )}

        {!userPosition && <Recenter position={mapCenter} />}

        {focusPosition && <Recenter position={focusPosition} />}

        {markers.map((marker) => (
          <Marker key={marker.id} position={marker.position}>
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
          </Marker>
        ))}
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

