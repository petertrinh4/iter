import L from "leaflet";

import redMarker from "leaflet-color-markers/img/marker-icon-red.png";
import shadow from "leaflet/dist/images/marker-shadow.png";

export const currentLocationIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:18px;
      height:18px;
      border-radius:50%;
      background:#3b82f6;
      border:3px solid white;
      box-shadow:0 0 10px rgba(59,130,246,.5);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export const routePointIcon = L.icon({
  iconUrl: redMarker,
  shadowUrl: shadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});