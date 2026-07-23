import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";

import {
  renderHook,
  waitFor,
  act,
} from "@testing-library/react";

import { useRoutes } from "../useRoutes";


const mockGetMyRoutes = vi.fn();
const mockSearchRoutes = vi.fn();
const mockSaveRoute = vi.fn();
const mockDeleteRoute = vi.fn();


vi.mock("../../services/routeApi", () => ({
  getMyRoutes: (...args: any[]) =>
    mockGetMyRoutes(...args),

  searchRoutes: (...args: any[]) =>
    mockSearchRoutes(...args),

  saveRoute: (...args: any[]) =>
    mockSaveRoute(...args),

  deleteRoute: (...args: any[]) =>
    mockDeleteRoute(...args),
}));


describe("useRoutes", () => {

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetMyRoutes.mockResolvedValue([
      {
        _id: "1",
        routeName: "Morning Run",
        distanceMiles: 3.5,
        waypoints: [],
      },
    ]);

    mockSearchRoutes.mockResolvedValue([
      {
        _id: "2",
        routeName: "Park Route",
        distanceMiles: 2,
        waypoints: [],
      },
    ]);

    mockSaveRoute.mockResolvedValue({
      ok: true,
    });

    mockDeleteRoute.mockResolvedValue({
      ok: true,
    });


    vi.spyOn(console, "error")
      .mockImplementation(() => {});
  });


  afterEach(() => {
    vi.restoreAllMocks();
  });



  it("loads routes on mount", async () => {

    const { result } = renderHook(() => useRoutes());


    await waitFor(() => {
      expect(result.current.routesLoading)
        .toBe(false);
    });


    expect(result.current.savedRoutes)
      .toHaveLength(1);


    expect(result.current.savedRoutes[0].routeName)
      .toBe("Morning Run");


    expect(mockGetMyRoutes)
      .toHaveBeenCalledTimes(1);

  });



  it("handles failed route loading", async () => {

    mockGetMyRoutes.mockRejectedValue(
      new Error("API failed")
    );


    const { result } = renderHook(() => useRoutes());


    await waitFor(() => {
      expect(result.current.routesLoading)
        .toBe(false);
    });


    expect(result.current.savedRoutes)
      .toEqual([]);

  });



  it("handles invalid route response", async () => {

    mockGetMyRoutes.mockResolvedValue({
      message: "invalid data",
    });


    const { result } = renderHook(() => useRoutes());


    await waitFor(() => {
      expect(result.current.routesLoading)
        .toBe(false);
    });


    expect(result.current.savedRoutes)
      .toEqual([]);

  });



  it("searches routes", async () => {

    const { result } = renderHook(() => useRoutes());


    await waitFor(() => {
      expect(result.current.routesLoading)
        .toBe(false);
    });


    await act(async () => {
      await result.current.search("park");
    });


    expect(mockSearchRoutes)
      .toHaveBeenCalledWith("park");


    expect(result.current.searchResults)
      .toHaveLength(1);


    expect(result.current.searchResults[0].routeName)
      .toBe("Park Route");

  });



  it("handles failed route searching", async () => {

    mockSearchRoutes.mockRejectedValue(
      new Error("Search failed")
    );


    const { result } = renderHook(() => useRoutes());


    await act(async () => {
      await result.current.search("bad query");
    });


    expect(result.current.searchResults)
      .toEqual([]);


    expect(result.current.searchLoading)
      .toBe(false);

  });



  it("handles invalid search response", async () => {

    mockSearchRoutes.mockResolvedValue(null);


    const { result } = renderHook(() => useRoutes());


    await act(async () => {
      await result.current.search("test");
    });


    expect(result.current.searchResults)
      .toEqual([]);


    expect(result.current.searchLoading)
      .toBe(false);

  });



  it("sets selected saved route", () => {

    const { result } = renderHook(() => useRoutes());


    const route = {
      _id: "123",
      routeName: "Test Route",
      distanceMiles: 4,
      waypoints: [],
    };


    act(() => {
      result.current.setSelectedSavedRoute(route);
    });


    expect(result.current.selectedSavedRoute)
      .toEqual(route);

  });



  it("exposes saveRoute function", () => {

    const { result } = renderHook(() => useRoutes());


    expect(result.current.saveRoute)
      .toBeDefined();


    expect(typeof result.current.saveRoute)
      .toBe("function");

  });



  it("exposes deleteRoute function", () => {

    const { result } = renderHook(() => useRoutes());


    expect(result.current.deleteRoute)
      .toBeDefined();


    expect(typeof result.current.deleteRoute)
      .toBe("function");

  });

});