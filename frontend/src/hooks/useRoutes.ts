import { useEffect, useState } from "react";
import type { SavedRoute } from "../types/route";
import {
  getMyRoutes,
  searchRoutes,
  saveRoute as saveRouteApi,
  deleteRoute as deleteRouteApi,
} from "../services/routeApi";

export function useRoutes() {
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [routesLoading, setRoutesLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SavedRoute[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [selectedSavedRoute, setSelectedSavedRoute] =
    useState<SavedRoute | null>(null);

  const loadRoutes = async () => {
    setRoutesLoading(true);

    try {
      const data = await getMyRoutes();
      setSavedRoutes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setSavedRoutes([]);
    } finally {
      setRoutesLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const search = async (q: string) => {
    setSearchLoading(true);

    try {
      const data = await searchRoutes(q);
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  return {
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
  };
}