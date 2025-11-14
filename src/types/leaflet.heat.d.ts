import "leaflet";

declare module "leaflet" {
  namespace heatLayer {
    interface HeatLayerOptions {
      radius?: number;
      blur?: number;
      maxZoom?: number;
      gradient?: { [key: number]: string };
      minOpacity?: number;
      max?: number;
    }
  }

  function heatLayer(
    points: Array<[number, number, number]>,
    options?: heatLayer.HeatLayerOptions
  ): Layer;
}

declare module "leaflet.heat" {
  import * as L from "leaflet";
  export = L;
}

