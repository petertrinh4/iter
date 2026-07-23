import type React from "react";
import type { SavedRoute } from "../../types/route";

interface PathsPanelProps {
  pathsTab: "create" | "saved";
  setPathsTab: React.Dispatch<React.SetStateAction<"create" | "saved">>;

  routeName: string;
  setRouteName: React.Dispatch<React.SetStateAction<string>>;

  pathPoints: [number, number][];
  setPathPoints: React.Dispatch<React.SetStateAction<[number, number][]>>;

  routeGeometry: [number, number][];
  distance: number;

  saveRoute: (routeData: {
    geometry: [number, number][];
    distanceMiles: number;
  }) => void;

  savedRoutes: SavedRoute[];
  routesLoading: boolean;

  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  searchRoutes: (query: string) => Promise<void>;

  searchResults: SavedRoute[];
  searchLoading: boolean;

  selectedSavedRoute: SavedRoute | null;
  setSelectedSavedRoute: React.Dispatch<
    React.SetStateAction<SavedRoute | null>
  >;

  selectedRoute: [number, number][];
  setSelectedRoute: React.Dispatch<React.SetStateAction<[number, number][]>>;

  confirmDelete: boolean;
  setConfirmDelete: React.Dispatch<React.SetStateAction<boolean>>;

  deleteRoute: () => void;

  routeMsg: {
    type: "success" | "error";
    text: string;
  } | null;

  deleteMsg: {
    type: "success" | "error";
    text: string;
  } | null;
}

export default function PathsPanel({
  pathsTab,
  setPathsTab,
  routeName,
  setRouteName,
  pathPoints,
  setPathPoints,
  routeGeometry,
  distance,
  saveRoute,
  savedRoutes,
  searchQuery,
  setSearchQuery,
  searchRoutes,
  searchResults,
  searchLoading,
  selectedSavedRoute,
  setSelectedSavedRoute,
  setSelectedRoute,
  confirmDelete,
  setConfirmDelete,
  deleteRoute,
  routeMsg,
  deleteMsg,
}: PathsPanelProps) {
  console.log("PathsPanel routes:", savedRoutes);

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex rounded-lg bg-muted p-1">
        <button
          onClick={() => setPathsTab("create")}
          className={`flex-1 rounded-md py-2 text-sm ${
            pathsTab === "create"
              ? "bg-background shadow"
              : "text-muted-foreground"
          }`}
        >
          Create
        </button>

        <button
          onClick={() => setPathsTab("saved")}
          className={`flex-1 rounded-md py-2 text-sm ${
            pathsTab === "saved"
              ? "bg-background shadow"
              : "text-muted-foreground"
          }`}
        >
          Saved
        </button>
      </div>

      {/* CREATE TAB */}
      {pathsTab === "create" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click on the map to create a walking route.
          </p>

          <div className="rounded-lg border p-3 text-sm">
            Points:
            <span className="ml-2 font-semibold">{pathPoints.length}</span>
          </div>

          <div className="rounded-lg border p-3 text-sm">
            Distance:
            <span className="ml-2 font-semibold">
              {distance.toFixed(2)} miles
            </span>
          </div>

          <input
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            placeholder="Route name"
            className="w-full rounded-lg border bg-background px-3 py-2"
          />

          <button
            onClick={() =>
              saveRoute({
                geometry: routeGeometry,
                distanceMiles: distance,
              })
            }
            className="w-full rounded-lg bg-primary px-4 py-2 text-primary-foreground"
          >
            Save Route
          </button>

          <button
            onClick={() => setPathPoints([])}
            className="w-full rounded-lg border px-4 py-2"
          >
            Clear
          </button>

          {routeMsg && (
            <p
              className={
                routeMsg.type === "success" ? "text-green-600" : "text-red-600"
              }
            >
              {routeMsg.text}
            </p>
          )}
        </div>
      )}

      {/* SAVED TAB */}
      {pathsTab === "saved" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search routes"
              className="flex-1 rounded-lg border bg-background px-3 py-2"
            />

            <button
              onClick={() => searchRoutes(searchQuery)}
              className="rounded-lg border px-3"
            >
              Search
            </button>
          </div>

          {searchLoading && <p className="text-sm">Searching...</p>}

          {savedRoutes.length === 0 &&
            searchResults.length === 0 &&
            !searchLoading && (
              <p className="text-sm text-muted-foreground">No saved routes.</p>
            )}

          {(searchResults.length > 0 ? searchResults : savedRoutes).map(
            (route) => (
              <button
                key={route._id}
                onClick={() => {
                  setSelectedSavedRoute(route);

                  setSelectedRoute(
                    route.waypoints.map(
                      ([lng, lat]) => [lat, lng] as [number, number]
                    )
                  );
                }}
                className={`w-full rounded-lg border p-3 text-left ${
                  selectedSavedRoute?._id === route._id ? "bg-muted" : ""
                }`}
              >
                <div className="font-medium">{route.routeName}</div>

                <div className="text-sm text-muted-foreground">
                  {route.distanceMiles.toFixed(2)} miles
                </div>
              </button>
            )
          )}

          {selectedSavedRoute && (
            <>
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full rounded-lg bg-red-500 px-4 py-2 text-white"
              >
                Delete Route
              </button>

              {confirmDelete && (
                <div className="rounded-lg border p-3 space-y-2">
                  <p>Delete this route?</p>

                  <button
                    onClick={deleteRoute}
                    className="w-full rounded-lg bg-red-500 py-2 text-white"
                  >
                    Confirm
                  </button>

                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="w-full rounded-lg border py-2"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}

          {deleteMsg && <p className="text-sm">{deleteMsg.text}</p>}
        </div>
      )}
    </div>
  );
}
