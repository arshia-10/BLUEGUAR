import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

interface HeatmapLayerProps {
  points: Array<[number, number, number]>; // [lat, lng, intensity]
  options?: {
    radius?: number;
    blur?: number;
    maxZoom?: number;
    gradient?: { [key: number]: string };
    minOpacity?: number;
    max?: number;
  };
}

export const HeatmapLayer = ({ points, options }: HeatmapLayerProps) => {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) {
      return;
    }

    // Default gradient similar to Snapchat's heatmap style
    const defaultGradient: { [key: number]: string } = {
      0.0: "rgba(0, 0, 255, 0)",      // Transparent blue
      0.2: "rgba(0, 255, 255, 0.3)",  // Cyan
      0.4: "rgba(0, 255, 0, 0.5)",    // Green
      0.6: "rgba(255, 255, 0, 0.7)",  // Yellow
      0.8: "rgba(255, 165, 0, 0.8)",  // Orange
      1.0: "rgba(255, 0, 0, 1)",      // Red
    };

    const heatmapOptions = {
      radius: options?.radius ?? 25,
      blur: options?.blur ?? 15,
      maxZoom: options?.maxZoom ?? 18,
      gradient: options?.gradient ?? defaultGradient,
      minOpacity: options?.minOpacity ?? 0.05,
      max: options?.max ?? 1.0,
    };

    // Create heatmap layer
    const heatLayer = (L as any).heatLayer(points, heatmapOptions);
    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, options]);

  return null;
};

