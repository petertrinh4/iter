import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";

import type { Coordinate } from "../../types/geo";
import type { Panel } from "../../types/homepage";

import CurrentLocationButton from "../common/CurrentLocationButton";
import { currentLocationIcon, routePointIcon } from "../../constants/icons";
import FlyToUser from "../map/FlyToUser";
import PathDrawer from "../map/PathDrawer";
import ZoomToRoute from "../map/ZoomToRoute";

type HomeMapProps = {
  userLocation: Coordinate;
  isDark: boolean;

  activePanel: Panel | null;
  pathsTab: "create" | "saved";

  pathPoints: Coordinate[];
  setPathPoints: React.Dispatch<
    React.SetStateAction<Coordinate[]>
  >;

  routeGeometry: Coordinate[];
  selectedRoute: Coordinate[];
  setSelectedRoute: React.Dispatch<
    React.SetStateAction<Coordinate[]>
  >;
};

export default function HomeMap({
  userLocation,
  isDark,
  activePanel,
  pathsTab,
  pathPoints,
  setPathPoints,
  routeGeometry,
  selectedRoute,
  setSelectedRoute,
}: HomeMapProps) {
  return (
    <MapContainer
      center={userLocation}
      zoom={13}
      scrollWheelZoom
      className="h-full w-full"
    >
      <FlyToUser location={userLocation} />

      <CurrentLocationButton location={userLocation} />

      <TileLayer
        attribution={
          isDark
            ? '&copy; <a href="https://carto.com/">CARTO</a>'
            : "&copy; OpenStreetMap contributors"
        }
        url={
          isDark
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        }
      />

      <PathDrawer
        onAddPoint={(point) => {
          if (activePanel === "paths" && pathsTab === "create") {
            setSelectedRoute([]);

            setPathPoints((prev) => [
              ...prev,
              point,
            ]);
          }
        }}
      />

      <ZoomToRoute
        route={
          selectedRoute.length > 0
            ? selectedRoute
            : routeGeometry
        }
      />

      {routeGeometry.length > 0 && (
        <Polyline positions={routeGeometry} />
      )}

      {selectedRoute.length > 0 && (
        <Polyline positions={selectedRoute} />
      )}

      {pathPoints.map((point, index) => (
        <Marker
          key={index}
          position={point}
          icon={routePointIcon}
          title={`Way point ${index + 1}`}
          alt={`Route way point ${index + 1}`}
          eventHandlers={{
            click: () => {
              setPathPoints((prev) =>
                prev.filter((_, i) => i !== index)
              );
            },
          }}
        />
      ))}

      <Marker
        position={userLocation}
        icon={currentLocationIcon}
        title="Your Current Location"
        alt="Marker showing your current location"
      >
        <Popup>Your Current Location</Popup>
      </Marker>
    </MapContainer>
  );
}