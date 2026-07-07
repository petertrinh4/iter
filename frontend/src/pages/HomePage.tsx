import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import { Plus, Route, CalendarDays } from "lucide-react";
import { getWalkingRoute } from "../services/routing";

type Panel = "create" | "saved" | "calendar";

type Run = {
  route: string;
  distance: number;
};

type SavedRoute = {
  _id: string;
  routeName: string;
  distanceMiles: number;
  waypoints: number[][];
};

function PathDrawer({
  onAddPoint,
}: {
  onAddPoint: (point: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      onAddPoint([e.latlng.lat, e.latlng.lng]);
    },
  });

  return null;
}

export function HomePage() {
  const [activePanel, setActivePanel] = useState<Panel>("create");

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [pathPoints, setPathPoints] =
  useState<[number, number][]>([]);

const [routeGeometry, setRouteGeometry] =
  useState<[number, number][]>([]);

const [distance, setDistance] =
  useState(0);

  const [selectedRoute, setSelectedRoute] =
  useState<[number, number][]>([]);

  const [routeName, setRouteName] = useState("");

  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);

const calculateRoute = async () => {
  try {
    const result = await getWalkingRoute(
      pathPoints as [number, number][]
    );

    setRouteGeometry(result.geometry);
    setDistance(result.distanceMiles);

    return result;

  } catch(error) {
    console.error(error);
    alert("Could not calculate walking route");
  }
};

  /*
   * Load saved routes from backend
   */
  const loadRoutes = async () => {
    try {
      const token = localStorage.getItem("idToken");

      const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/routes/my-routes`,
    {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      setSavedRoutes(data);
    } catch (error) {
      console.error("Failed loading routes:", error);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  /*
   * Save route to backend
   */
  const saveRoute = async (
  routeData: {
    geometry: [number, number][];
    distanceMiles: number;
  }
) => {
    if (routeName.trim() === "" || pathPoints.length < 2) {
      alert("Add at least 2 points and a name");

      return;
    }

    const token = localStorage.getItem("idToken");

    const waypoints = routeData.geometry.map(
  ([lat, lng]) => [
    lng,
    lat
  ]
);

    const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/routes/save`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        routeName,

        distanceMiles: distance,

        waypoints,
      }),
    });

    if (response.ok) {
      alert("Route saved");

      setRouteName("");

      setPathPoints([]);

      loadRoutes();
    } else {
      alert("Failed saving route");
    }
  };

  /*
   * Fake calendar data for now
   */
  const runs: Record<string, Run> = {
    "2026-07-03": {
      route: "UCF Loop",
      distance: 3.1,
    },

    "2026-07-05": {
      route: "Lake Eola",
      distance: 5.2,
    },

    "2026-07-08": {
      route: "Neighborhood Run",
      distance: 2.4,
    },
  };

  const today = new Date();

  const year = today.getFullYear();

  const month = today.getMonth();

  const { monthName, calendarCells } = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const firstDay = new Date(year, month, 1).getDay();

    const cells: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(day);
    }

    return {
      monthName: new Date(year, month).toLocaleString("default", {
        month: "long",
      }),

      calendarCells: cells,
    };
  }, [month, year]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground">
      <div className="flex h-full">
        <main className="flex-1">
          <MapContainer
            center={[28.6024, -81.2001]}
            zoom={13}
            scrollWheelZoom
            className="h-full w-full"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <PathDrawer
              onAddPoint={(point) => {
                if (activePanel === "create") {
                  setPathPoints((prev) => [...prev, point]);
                }
              }}
            />

            {routeGeometry.length > 0 && (
  <Polyline
    positions={routeGeometry}
  />
)}

            {selectedRoute.length > 0 && <Polyline positions={selectedRoute} />}

            {pathPoints.map((point, index) => (
              <Marker key={index} position={point} />
            ))}

            <Marker position={[28.6024, -81.2001]}>
              <Popup>Running App 🏃</Popup>
            </Marker>
          </MapContainer>
        </main>

        {/* SIDEBAR */}
        <aside className="flex w-80 flex-col border-l border-sidebar-border bg-card">
          {/* Header */}
          <div className="border-b border-sidebar-border p-6">
            <h2 className="text-xl font-semibold">Dashboard</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Route planning tools
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-3 p-5">
            <button
              onClick={() => setActivePanel("create")}
              className={`flex w-full items-center gap-3 rounded-xl border p-4 transition ${
                activePanel === "create"
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-border bg-muted/40 hover:bg-accent"
              }`}
            >
              <Plus size={20} />
              Create Path
            </button>

            <button
              onClick={() => setActivePanel("saved")}
              className={`flex w-full items-center gap-3 rounded-xl border p-4 transition ${
                activePanel === "saved"
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-border bg-muted/40 hover:bg-accent"
              }`}
            >
              <Route size={20} />
              Saved Paths
            </button>

            <button
              onClick={() => setActivePanel("calendar")}
              className={`flex w-full items-center gap-3 rounded-xl border p-4 transition ${
                activePanel === "calendar"
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-border bg-muted/40 hover:bg-accent"
              }`}
            >
              <CalendarDays size={20} />
              Calendar
            </button>
          </div>

          {/* PANEL CONTENT */}
          <div className="flex-1 overflow-y-auto border-t border-sidebar-border p-5">
            {/* CREATE PATH */}
            {activePanel === "create" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-semibold">Create Path</h3>

                  <p className="text-sm text-muted-foreground">
                    Click on the map to create a route.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  Points Added:
                  <span className="ml-2 font-bold">{pathPoints.length}</span>
                </div>

                <input
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  placeholder="Morning Run"
                  className="w-full rounded-xl border border-input bg-input px-4 py-3"
                />

                <button
                  onClick={async () => {

  const routeData = await calculateRoute();

  if (!routeData) return;

  await saveRoute(routeData);

}}

                  className="
                    w-full rounded-xl
                    bg-green-500
                    px-4 py-3
                    font-semibold
                    text-black
                    hover:opacity-90
                  "
                >
                  Save Path
                </button>

                <button
                  onClick={() => {
                    setPathPoints([]);
                  }}

                  className="
                    w-full rounded-xl
                    border border-border
                    px-4 py-3
                    hover:bg-muted
                  "
                >
                  Clear Path
                </button>
              </div>
            )}

            {/* SAVED ROUTES */}
            {activePanel === "saved" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Saved Paths</h3>

                {savedRoutes.length === 0 && (
                  <div
                    className="
                    rounded-xl
                    border border-dashed
                    border-border
                    p-4
                  "
                  >
                    No saved routes.
                  </div>
                )}

                {savedRoutes.map((route) => (
                  <button
                    key={route._id}

                    onClick={() => {
                      const points = route.waypoints.map(
  ([lng, lat]) => [lat, lng] as [number, number]
);

setSelectedRoute(points);

                      setSelectedRoute(points);
                    }}

                    className="
                      w-full
                      rounded-xl
                      border border-border
                      bg-muted/20
                      p-4
                      text-left
                      transition
                      hover:bg-accent
                    "
                  >
                    <h4 className="font-semibold">{route.routeName}</h4>

                    <p className="text-sm text-muted-foreground">
                      {route.distanceMiles} miles
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {route.waypoints.length} points
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* CALENDAR */}
            {activePanel === "calendar" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-semibold">
                    {monthName} {year}
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Running history
                  </p>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                    <div
                      key={day}
                      className="
                        text-center
                        text-xs
                        text-muted-foreground
                      "
                    >
                      {day}
                    </div>
                  ))}

                  {calendarCells.map((day, index) => {
                    if (!day) {
                      return <div key={index} className="aspect-square" />;
                    }

                    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

                    const run = runs[dateKey];

                    return (
                      <button
                        key={dateKey}

                        onClick={() => setSelectedDate(dateKey)}

                        className={`
                          aspect-square
                          rounded-lg
                          border
                          text-sm

                          ${
                            run
                              ? "border-green-500 bg-green-500/20 text-green-400"
                              : "border-border bg-muted/30"
                          }

                        `}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                {selectedDate && (
                  <div
                    className="
                    rounded-xl
                    border border-border
                    bg-muted/20
                    p-4
                  "
                  >
                    <h4 className="font-semibold">{selectedDate}</h4>

                    {runs[selectedDate] ? (
                      <div className="mt-3 text-sm space-y-2">
                        <p>
                          Route:
                          <span className="ml-2">
                            {runs[selectedDate].route}
                          </span>
                        </p>

                        <p>
                          Distance:
                          <span className="ml-2">
                            {runs[selectedDate].distance} mi
                          </span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-3">
                        No run recorded.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
