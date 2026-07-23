import { useEffect, useMemo, useState } from "react";
import HomeSidebar from "../components/home/HomeSidebar";
import { getWalkingRoute } from "../services/routing";
import { useTheme } from "../hooks/use-theme";
import { useAuthGuard } from "../hooks/use-auth-guard";
import { dateKey } from "../utils/date";
import type { Run } from "../types/run";
import type { Panel } from "../types/homepage";
import "leaflet/dist/leaflet.css";
import "../lib/leaflet";
import HomeMap from "../components/home/HomeMap";
import IconRail from "../components/home/IconRail";
import PathsPanel from "../components/home/PathsPanel";
import CalendarPanel from "../components/home/CalendarPanel";
import ProfilePanel from "../components/home/ProfilePanel";
import { DEFAULT_LOCATION } from "../constants/map";
import { getUserInfoFromToken } from "../utils/auth";
import { getMyRuns } from "../services/runApi";
import { useRoutes } from "../hooks/useRoutes";

export function HomePage() {
  const [activePanel, setActivePanel] = useState<Panel | null>(null);
  const [pathsTab, setPathsTab] = useState<"create" | "saved">("create");
  const [username, setUsername] = useState("");
  const [memberSince, setMemberSince] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [myRuns, setMyRuns] = useState<Run[]>([]);
  const [pathPoints, setPathPoints] = useState<[number, number][]>([]);
  const [routeGeometry, setRouteGeometry] = useState<[number, number][]>([]);
  const [distance, setDistance] = useState(0);
  const [selectedRoute, setSelectedRoute] = useState<[number, number][]>([]);
  const [routeName, setRouteName] = useState("");
  const [runsLoading, setRunsLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [routeMsg, setRouteMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [deleteMsg, setDeleteMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const { isDark, toggleTheme } = useTheme();
  useAuthGuard();

  const {
  savedRoutes,
  routesLoading,

  searchQuery,
  setSearchQuery,
  searchResults,
  searchLoading,
  search,

  selectedSavedRoute,
  setSelectedSavedRoute,

  loadRoutes,

  saveRoute: saveRouteApi,
  deleteRoute: deleteRouteApi,
} = useRoutes();

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
      setRouteMsg({
        type: "error",
        text: "Could not calculate walking route.",
      });
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

  // Load the logged-in user's completed runs (read-only, logged via the mobile app)
  const loadRuns = async () => {
    setRunsLoading(true);

    try {
      const data = await getMyRuns();

      setMyRuns(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed loading runs:", error);
      setMyRuns([]);
    } finally {
      setRunsLoading(false);
    }
  };

  useEffect(() => {
    loadRuns();
  }, []);

  // Read user info from the JWT already in localStorage
  useEffect(() => {
    const user = getUserInfoFromToken();

    if (!user) return;

    setUsername(user.username);
    setMemberSince(user.memberSince);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("idToken");
    localStorage.removeItem("accessToken");
    window.location.href = "/";
  };

  const deleteRoute = async () => {
    if (!selectedSavedRoute) return;

    const response = await deleteRouteApi(selectedSavedRoute._id);

    if (response.ok) {
      setDeleteMsg({ type: "success", text: "Route deleted successfully." });
      setSelectedSavedRoute(null);
      setSelectedRoute([]);
      setConfirmDelete(false);
      loadRoutes();
    } else {
      setDeleteMsg({ type: "error", text: "Failed to delete route." });
      setConfirmDelete(false);
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

  // Save route to backend
  const saveRoute = async (routeData: {
    geometry: [number, number][];
    distanceMiles: number;
  }) => {
    if (routeName.trim() === "" || pathPoints.length < 2) {
      setRouteMsg({
        type: "error",
        text: "Add at least 2 points and a route name.",
      });
      return;
    }

    const waypoints = routeData.geometry.map(([lat, lng]) => [lng, lat]);

    const response = await saveRouteApi({
      routeName,
      distanceMiles: routeData.distanceMiles,
      waypoints,
    });

    if (response.ok) {
      setRouteMsg({ type: "success", text: "Route saved successfully!" });
      setRouteName("");
      setPathPoints([]);
      await loadRoutes();
    } else {
      setRouteMsg({ type: "error", text: "Failed to save route." });
    }
  };

  // Bucket runs by the calendar day they happened on
  const runsByDay = useMemo(() => {
    const map: Record<string, Run[]> = {};

    for (const run of myRuns) {
      const key = dateKey(new Date(run.createdAt));
      (map[key] ??= []).push(run);
    }

    return map;
  }, [myRuns]);

  const selectedDayRuns = selectedDate
    ? (runsByDay[dateKey(selectedDate)] ?? [])
    : [];

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground">
      <div className="flex h-full">
        <main className="flex-1">
          <HomeMap
            userLocation={userLocation}
            isDark={isDark}
            activePanel={activePanel}
            pathsTab={pathsTab}
            pathPoints={pathPoints}
            setPathPoints={setPathPoints}
            routeGeometry={routeGeometry}
            selectedRoute={selectedRoute}
            setSelectedRoute={setSelectedRoute}
          />
        </main>

        <HomeSidebar activePanel={activePanel} setActivePanel={setActivePanel}>
          {activePanel === "paths" && (
            <PathsPanel
              pathsTab={pathsTab}
              setPathsTab={setPathsTab}

              routeName={routeName}
              setRouteName={setRouteName}

              pathPoints={pathPoints}
              setPathPoints={setPathPoints}

              routeGeometry={routeGeometry}
              distance={distance}

              saveRoute={saveRoute}

              savedRoutes={savedRoutes}
              routesLoading={routesLoading}

              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchRoutes={search}

              searchResults={searchResults}
              searchLoading={searchLoading}

              selectedSavedRoute={selectedSavedRoute}
              setSelectedSavedRoute={setSelectedSavedRoute}

              selectedRoute={selectedRoute}
              setSelectedRoute={setSelectedRoute}

              confirmDelete={confirmDelete}
              setConfirmDelete={setConfirmDelete}

              deleteRoute={deleteRoute}

              routeMsg={routeMsg}
              deleteMsg={deleteMsg}
            />
          )}

          {activePanel === "calendar" && (
            <CalendarPanel
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              myRuns={myRuns}
              selectedDayRuns={selectedDayRuns}
              runsLoading={runsLoading}
              runsByDay={runsByDay}
              setSelectedRoute={setSelectedRoute}
            />
          )}

          {activePanel === "profile" && (
            <ProfilePanel
              username={username}
              memberSince={memberSince}
              myRuns={myRuns}
              runsLoading={runsLoading}
              handleSignOut={handleSignOut}
            />
          )}
        </HomeSidebar>

        <IconRail
          activePanel={activePanel}
          setActivePanel={setActivePanel}
          setSelectedRoute={setSelectedRoute}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
      </div>
    </div>
  );
}