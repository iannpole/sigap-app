import type { FeatureCollection, Polygon } from "geojson";

export const area: FeatureCollection<Polygon> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [106.6, -6.265],
            [106.72, -6.262],
            [106.78, -6.3],
            [106.7, -6.36],
            [106.62, -6.35],
            [106.6, -6.265],
          ],
        ],
      },
    },
  ],
};
