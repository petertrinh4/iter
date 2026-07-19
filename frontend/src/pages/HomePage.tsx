import { useEffect, useMemo, useState } from "react";
import CurrentLocationButton from "../components/CurrentLocationButton";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { Plus, Route, CalendarDays, Moon, Sun, User, ChevronLeft, LogOut } from "lucide-react";
import { getWalkingRoute } from "../services/routing";
import { useTheme } from "../hooks/use-theme";
import { Calendar } from "../components/ui/calendar";

// ---- Leaflet setup (moved here so it only loads on /home) ----
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { currentLocationIcon, routePointIcon } from "../components/icons";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

type Panel = "paths" | "calendar" | "profile";

type Run = {
  _id: string;
  pathName: string;
  distanceMiles: number;
  durationSeconds: number;
  waypoints: number[][];
  createdAt: string;
};

type SavedRoute = {
  _id: string;
  routeName: string;
  distanceMiles: number;
  waypoints: number[][];
};

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.round(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatPace(run: Run): string {
  if (!run.distanceMiles) return "—";
  return `${formatDuration(run.durationSeconds / run.distanceMiles)} /mi`;
}

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

function ZoomToRoute({ route }: { route: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (route.length === 0) return;

    map.fitBounds(route, {
      padding: [40, 40],
    });
  }, [route, map]);

  return null;
}

function FlyToUser({ location }: { location: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(location, 15);
  }, [location, map]);

  return null;
}

export function HomePage() {
  const [activePanel, setActivePanel] = useState<Panel | null>(null);
  const [pathsTab, setPathsTab] = useState<"create" | "saved">("create");

  // ── Profile state ──────────────────────────────────────────────
  const [username, setUsername] = useState("");
  const [memberSince, setMemberSince] = useState("");

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const [myRuns, setMyRuns] = useState<Run[]>([]);

  const [pathPoints, setPathPoints] = useState<[number, number][]>([]);

  const [routeGeometry, setRouteGeometry] = useState<[number, number][]>([]);

  const [distance, setDistance] = useState(0);

  const [selectedRoute, setSelectedRoute] = useState<[number, number][]>([]);

  const [routeName, setRouteName] = useState("");

  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);

  const [selectedSavedRoute, setSelectedSavedRoute] =
    useState<SavedRoute | null>(null);

  const { isDark, toggleTheme } = useTheme();

  const DEFAULT_LOCATION: [number, number] = [28.6024, -81.2001];

  const [userLocation, setUserLocation] =
    useState<[number, number]>(DEFAULT_LOCATION);

  const calculateRoute = async () => {
    try {
      const result = await getWalkingRoute(pathPoints as [number, number][]);

      setRouteGeometry(result.geometry);
      setDistance(result.distanceMiles);

      return result;
    } catch (error) {
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
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      () => {
        console.log("Location permission denied.");
      },
      {
        enableHighAccuracy: true,
      }
    );
  }, []);

  useEffect(() => {
    loadRoutes();
  }, []);

  /*
   * Load the logged-in user's completed runs (read-only, logged via the mobile app)
   */
  const loadRuns = async () => {
    const token = localStorage.getItem("idToken");
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/runs/my-runs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      setMyRuns(data);
    } catch (error) {
      console.error("Failed loading runs:", error);
    }
  };

  useEffect(() => {
    loadRuns();
  }, []);

  // ── Read user info from the JWT already in localStorage ────────
  useEffect(() => {
    const token = localStorage.getItem("idToken");
    if (!token) return;
    try {
      // JWT payload is the second base64url segment
      const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      // preferred_username is the human-readable username set at registration
      setUsername(payload["preferred_username"] ?? payload["email"] ?? "User");
      // "iat" (issued-at) is seconds since epoch — use as a proxy for account context
      // If your backend stores a real createdAt, prefer that instead
      if (payload["iat"]) {
        const d = new Date(payload["iat"] * 1000);
        setMemberSince(d.toLocaleDateString("en-US", { month: "long", year: "numeric" }));
      }
    } catch {
      console.error("Could not decode idToken");
    }
  }, []);


  const handleSignOut = () => {
    localStorage.removeItem("idToken");
    localStorage.removeItem("accessToken");
    window.location.href = "/";
  };

  const deleteRoute = async () => {
    if (!selectedSavedRoute) return;

    const confirmed = window.confirm(
      `Delete "${selectedSavedRoute.routeName}"?`
    );

    if (!confirmed) return;

    const token = localStorage.getItem("idToken");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/routes/${selectedSavedRoute._id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      alert("Route deleted");

      setSelectedSavedRoute(null);
      setSelectedRoute([]);

      loadRoutes();
    } else {
      alert("Failed to delete route");
    }
  };

  useEffect(() => {
    if (pathPoints.length < 2) {
      setRouteGeometry([]);
      setDistance(0);
      return;
    }

    calculateRoute();
  }, [pathPoints]);

  /*
   * Save route to backend
   */
  const saveRoute = async (routeData: {
    geometry: [number, number][];
    distanceMiles: number;
  }) => {
    if (routeName.trim() === "" || pathPoints.length < 2) {
      alert("Add at least 2 points and a name");

      return;
    }

    const token = localStorage.getItem("idToken");

    const waypoints = routeData.geometry.map(([lat, lng]) => [lng, lat]);

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
          distanceMiles: routeData.distanceMiles,
          waypoints,
        }),
      }
    );

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
   * Bucket runs by the calendar day they happened on
   */
  const runsByDay = useMemo(() => {
    const map: Record<string, Run[]> = {};

    for (const run of myRuns) {
      const key = dateKey(new Date(run.createdAt));
      (map[key] ??= []).push(run);
    }

    return map;
  }, [myRuns]);

  const selectedDayRuns = selectedDate ? (runsByDay[dateKey(selectedDate)] ?? []) : [];

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground">
      <div className="flex h-full">
        <main className="flex-1">
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
                  // Hide any previously selected saved route
                  setSelectedRoute([]);

                  setPathPoints((prev) => [...prev, point]);
                }
              }}
            />

            <ZoomToRoute
              route={selectedRoute.length > 0 ? selectedRoute : routeGeometry}
            />

            {routeGeometry.length > 0 && <Polyline positions={routeGeometry} />}

            {selectedRoute.length > 0 && <Polyline positions={selectedRoute} />}

            {pathPoints.map((point, index) => (
              <Marker
                key={index}
                position={point}
                icon={routePointIcon}
                eventHandlers={{
                  click: () => {
                    if (window.confirm(`Delete point ${index + 1}?`)) {
                      setPathPoints((prev) =>
                        prev.filter((_, i) => i !== index)
                      );
                    }
                  },
                }}
              ></Marker>
            ))}

            <Marker position={userLocation} icon={currentLocationIcon}>
              <Popup>Your Current Location</Popup>
            </Marker>
          </MapContainer>
        </main>

        {/* SLIDE-OUT PANEL */}
        <div
          className={`flex flex-col overflow-hidden border-l border-sidebar-border bg-card transition-all duration-300 ease-in-out ${
            activePanel ? "w-80" : "w-0"
          }`}
        >
          {activePanel && (
            <div className="flex h-full w-80 flex-col">
              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-sidebar-border px-5 py-4">
                <h2 className="text-base font-semibold tracking-wide">
                  {activePanel === "paths" && "Paths"}
                  {activePanel === "calendar" && "Calendar"}
                  {activePanel === "profile" && "Profile"}
                </h2>
                <button
                  onClick={() => setActivePanel(null)}
                  className="rounded-lg p-1.5 transition hover:bg-muted"
                  aria-label="Close panel"
                >
                  <ChevronLeft size={18} />
                </button>
              </div>

              {/* Panel body */}
              <div className="flex-1 overflow-y-auto p-5">

                {/* ── PATHS ── */}
                {activePanel === "paths" && (
                  <div className="space-y-5">
                    <div className="flex rounded-xl border border-border bg-muted/30 p-1">
                      <button
                        onClick={() => setPathsTab("create")}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition ${
                          pathsTab === "create" ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Plus size={15} /> Create
                      </button>
                      <button
                        onClick={() => setPathsTab("saved")}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition ${
                          pathsTab === "saved" ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Route size={15} /> Saved
                      </button>
                    </div>

                    {pathsTab === "create" && (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Click on the map to place points and build a route.
                        </p>
                        <div className="rounded-xl border border-border bg-muted/20 p-4">
                          <p className="text-xs text-muted-foreground">Distance</p>
                          <p className="mt-1 text-2xl font-bold">{distance.toFixed(2)} mi</p>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="routeName" className="text-sm font-medium text-muted-foreground">
                            Route Name
                          </label>
                          <input
                            id="routeName"
                            value={routeName}
                            onChange={(e) => setRouteName(e.target.value)}
                            placeholder="Morning Run"
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 transition placeholder:text-muted-foreground focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                          />
                        </div>
                        <button
                          onClick={() => saveRoute({ geometry: routeGeometry, distanceMiles: distance })}
                          className="w-full rounded-xl bg-green-500 px-4 py-3 font-semibold text-black hover:opacity-90"
                        >
                          Save Path
                        </button>
                        <button
                          onClick={() => setPathPoints((prev) => prev.slice(0, -1))}
                          disabled={pathPoints.length === 0}
                          className="w-full rounded-xl border border-border px-4 py-3 font-semibold hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Undo Last Point
                        </button>
                        <button
                          onClick={() => setPathPoints([])}
                          className="w-full rounded-xl border border-border px-4 py-3 hover:bg-muted"
                        >
                          Clear Path
                        </button>
                      </div>
                    )}

                    {pathsTab === "saved" && (
                      <div className="space-y-4">
                        {savedRoutes.length === 0 && (
                          <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                            No saved routes yet.
                          </div>
                        )}
                        {savedRoutes.map((route) => (
                          <button
                            key={route._id}
                            onClick={() => {
                              const points = route.waypoints.map(([lng, lat]) => [lat, lng] as [number, number]);
                              setSelectedSavedRoute(route);
                              setSelectedRoute(points);
                            }}
                            className="w-full rounded-xl border border-border bg-muted/20 p-4 text-left transition hover:bg-accent"
                          >
                            <h4 className="font-semibold">{route.routeName}</h4>
                            <p className="text-sm text-muted-foreground">{route.distanceMiles.toFixed(2)} miles</p>
                          </button>
                        ))}
                        {selectedSavedRoute && (
                          <button
                            onClick={deleteRoute}
                            className="w-full rounded-xl bg-red-500 px-4 py-3 font-semibold text-white hover:bg-red-600"
                          >
                            Delete Path
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ── CALENDAR ── */}
                {activePanel === "calendar" && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-lg font-semibold">My Runs</h3>
                      <p className="text-sm text-muted-foreground">Activity history</p>
                    </div>

                    {myRuns.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                        No runs yet. Complete a run in the iter mobile app and it'll show up here.
                      </div>
                    ) : (
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        modifiers={{
                          hasRun: (date) => Boolean(runsByDay[dateKey(date)]),
                        }}
                        modifiersClassNames={{
                          hasRun: "border border-green-500 bg-green-500/20 text-green-400",
                        }}
                        className="rounded-xl border border-border bg-muted/20"
                      />
                    )}

                    {selectedDate && (
                      <div className="rounded-xl border border-border bg-muted/20 p-4">
                        <h4 className="font-semibold">
                          {selectedDate.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })}
                        </h4>
                        {selectedDayRuns.length === 0 ? (
                          <p className="mt-3 text-sm text-muted-foreground">No activity recorded.</p>
                        ) : (
                          <div className="mt-3 space-y-2">
                            {selectedDayRuns.map((run) => (
                              <button
                                key={run._id}
                                onClick={() => {
                                  const points = run.waypoints.map(([lng, lat]) => [lat, lng] as [number, number]);
                                  setSelectedRoute(points);
                                }}
                                className="w-full rounded-lg border border-border bg-background/40 p-3 text-left text-sm transition hover:bg-accent"
                              >
                                <p className="font-semibold">{run.pathName}</p>
                                <p className="mt-1 text-muted-foreground">
                                  {run.distanceMiles.toFixed(2)} mi · {formatDuration(run.durationSeconds)} · {formatPace(run)}
                                </p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ── PROFILE ── */}
                {activePanel === "profile" && (
                  <div className="space-y-6">

                    {/* Avatar + identity */}
                    <div className="flex flex-col items-center gap-3 pt-2">
                      <div
                        className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white"
                        style={{ backgroundColor: "#3C2A1E" }}
                      >
                        {username.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold">{username}</p>
                        {memberSince && (
                          <p className="text-sm text-muted-foreground">Member since {memberSince}</p>
                        )}
                      </div>
                    </div>

                    {/* All-time stats */}
                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        All-time stats
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col items-center rounded-xl border border-border bg-muted/20 p-3">
                          <span className="text-xl font-bold">
                            {savedRoutes.reduce((sum, r) => sum + r.distanceMiles, 0).toFixed(1)}
                          </span>
                          <span className="mt-1 text-center text-[11px] leading-tight text-muted-foreground">Total miles</span>
                        </div>
                        <div className="flex flex-col items-center rounded-xl border border-border bg-muted/20 p-3">
                          <span className="text-xl font-bold">{savedRoutes.length}</span>
                          <span className="mt-1 text-center text-[11px] leading-tight text-muted-foreground">Total runs</span>
                        </div>
                        <div className="flex flex-col items-center rounded-xl border border-border bg-muted/20 p-3">
                          <span className="text-xl font-bold">
                            {savedRoutes.length > 0
                              ? Math.max(...savedRoutes.map((r) => r.distanceMiles)).toFixed(1)
                              : "—"}
                          </span>
                          <span className="mt-1 text-center text-[11px] leading-tight text-muted-foreground">Longest run</span>
                        </div>
                      </div>
                    </div>

                    {/* Log out */}
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/40 px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-500/10"
                    >
                      <LogOut size={16} />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ICON RAIL */}
        <div
          className="flex w-20 flex-col items-center justify-between py-5"
          style={{ backgroundColor: "#3C2A1E" }}
        >
          {/* Brand */}
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex flex-col items-center gap-1 pb-3 border-b border-white/10 w-full">
              <img
                src="/iter-logo.png"
                alt="iter mascot"
                className="w-10 h-10 object-contain"
              />
              <span className="text-white font-bold text-base tracking-widest">iter</span>
            </div>

            {/* Nav icons */}
            {(
              [
                { id: "paths", icon: <Route size={20} />, label: "Paths" },
                { id: "calendar", icon: <CalendarDays size={20} />, label: "Calendar" },
                { id: "profile", icon: <User size={20} />, label: "Profile" },
              ] as { id: Panel; icon: React.ReactNode; label: string }[]
            ).map(({ id, icon, label }) => (
              <button
                key={id}
                onClick={() => {
                  setActivePanel((prev) => (prev === id ? null : id));
                  if (id !== "paths") setSelectedRoute([]);
                }}
                aria-label={label}
                title={label}
                className={`flex w-14 flex-col items-center gap-1 rounded-xl px-2 py-3 transition ${
                  activePanel === id
                    ? "bg-white/20 text-white"
                    : "text-white/50 hover:bg-white/10 hover:text-white/80"
                }`}
              >
                {icon}
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </button>
            ))}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-xl p-2.5 text-white/50 transition hover:bg-white/10 hover:text-white/80"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}