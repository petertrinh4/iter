const OSRM_URL =
  "https://router.project-osrm.org/route/v1/walking";

export async function getWalkingRoute(
  points: [number, number][]
) {
  if (points.length < 2) {
    throw new Error("Need at least 2 points");
  }

  // Leaflet uses [lat,lng]
  // OSRM requires [lng,lat]
  const coordinates = points
    .map(([lat, lng]) => `${lng},${lat}`)
    .join(";");


  const response = await fetch(
    `${OSRM_URL}/${coordinates}?overview=full&geometries=geojson`
  );


  if (!response.ok) {
    throw new Error("OSRM request failed");
  }


  const data = await response.json();


  const route = data.routes[0];


  // OSRM returns [lng,lat]
  // Leaflet needs [lat,lng]
  const geometry: [number, number][] =
    route.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [
        lat,
        lng,
      ]
    );


  return {
    geometry,

    distanceMiles:
      route.distance / 1609.34,
  };
}