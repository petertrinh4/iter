import {
  describe,
  it,
  expect,
  vi,
  beforeEach
} from "vitest";

import {
  getMyRoutes,
  searchRoutes,
  saveRoute,
  deleteRoute
} from "../routeApi";


describe("routeApi", () => {

  beforeEach(() => {
    vi.resetAllMocks();

    localStorage.setItem(
      "idToken",
      "test-token"
    );
  });


  it("gets user's routes", async () => {

    global.fetch = vi.fn()
      .mockResolvedValue({
        json: () =>
          Promise.resolve([
            {
              _id:"1",
              routeName:"Park Run"
            }
          ])
      });


    const result = await getMyRoutes();


    expect(fetch)
      .toHaveBeenCalledWith(
        expect.stringContaining(
          "/api/routes/my-routes"
        ),
        expect.objectContaining({
          headers:{
            Authorization:"Bearer test-token"
          }
        })
      );


    expect(result[0].routeName)
      .toBe("Park Run");

  });



  it("searches routes", async () => {

    global.fetch = vi.fn()
      .mockResolvedValue({
        json: () =>
          Promise.resolve([])
      });


    await searchRoutes("trail");


    expect(fetch)
      .toHaveBeenCalledWith(
        expect.stringContaining(
          "q=trail"
        ),
        expect.anything()
      );

  });



  it("saves a route", async () => {

    global.fetch = vi.fn()
      .mockResolvedValue({
        ok:true
      });


    const response =
      await saveRoute({
        routeName:"Morning Run",
        distanceMiles:2,
        waypoints:[
          [1,2]
        ]
      });


    expect(response.ok)
      .toBe(true);


    expect(fetch)
      .toHaveBeenCalledWith(
        expect.stringContaining(
          "/api/routes/save"
        ),
        expect.objectContaining({
          method:"POST"
        })
      );

  });



  it("deletes a route", async () => {

    global.fetch = vi.fn()
      .mockResolvedValue({
        ok:true
      });


    const response =
      await deleteRoute("abc");


    expect(response.ok)
      .toBe(true);


    expect(fetch)
      .toHaveBeenCalledWith(
        expect.stringContaining(
          "/api/routes/abc"
        ),
        expect.objectContaining({
          method:"DELETE"
        })
      );

  });


});