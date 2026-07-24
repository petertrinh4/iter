import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  saveRoute,
  loadRoutes,
  searchRoutes,
  deleteRoute,
} from "../routeController.js";

import User from "../../models/User.js";
import Route from "../../models/Route.js";


vi.mock("../../models/User.js", () => ({
  default: {
    findOne: vi.fn(),
  },
}));


vi.mock("../../models/Route.js", () => ({
  default: {
    create: vi.fn(),
    find: vi.fn(),
    findOneAndDelete: vi.fn(),
  },
}));


function mockResponse() {
  const res: any = {};

  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);

  return res;
}


describe("routeController", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });


  describe("saveRoute", () => {


    it("returns 400 for invalid route data", async () => {

      const req:any = {
        body:{},
      };

      const res = mockResponse();

      await saveRoute(req,res);

      expect(res.status)
        .toHaveBeenCalledWith(400);

    });



    it("returns 401 when user is missing", async () => {

      const req:any = {
        body:{
          routeName:"Morning Run",
          distanceMiles:3,
          waypoints:[
            [1,2],
            [3,4]
          ]
        },
        user:{}
      };


      const res = mockResponse();

      await saveRoute(req,res);


      expect(res.status)
        .toHaveBeenCalledWith(401);

    });



    it("returns 404 when database user does not exist", async () => {


      (User.findOne as any)
        .mockResolvedValue(null);


      const req:any = {

        user:{
          sub:"cognito123"
        },

        body:{
          routeName:"Morning Run",
          distanceMiles:3,
          waypoints:[
            [1,2],
            [3,4]
          ]
        }
      };


      const res = mockResponse();


      await saveRoute(req,res);


      expect(res.status)
        .toHaveBeenCalledWith(404);

    });



    it("creates a route successfully", async()=>{


      (User.findOne as any)
        .mockResolvedValue({
          _id:"user123"
        });


      (Route.create as any)
        .mockResolvedValue({
          routeName:"Morning Run"
        });


      const req:any={

        user:{
          sub:"cognito123"
        },

        body:{
          routeName:"Morning Run",
          distanceMiles:3,
          waypoints:[
            [1,2],
            [3,4]
          ]
        }
      };


      const res = mockResponse();


      await saveRoute(req,res);


      expect(Route.create)
        .toHaveBeenCalledWith({
          user:"user123",
          routeName:"Morning Run",
          distanceMiles:3,
          waypoints:[
            [1,2],
            [3,4]
          ]
        });


      expect(res.status)
        .toHaveBeenCalledWith(201);

    });



    it("returns 500 when route creation fails", async()=>{


      (User.findOne as any)
        .mockResolvedValue({
          _id:"user123"
        });


      (Route.create as any)
        .mockRejectedValue(
          new Error("database failure")
        );


      const req:any={
        user:{
          sub:"abc"
        },

        body:{
          routeName:"Test",
          distanceMiles:2,
          waypoints:[
            [1,2],
            [3,4]
          ]
        }
      };


      const res = mockResponse();


      await saveRoute(req,res);


      expect(res.status)
        .toHaveBeenCalledWith(500);

    });

  });



  describe("loadRoutes",()=>{


    it("returns 401 without user",async()=>{


      const req:any={
        user:{}
      };


      const res=mockResponse();


      await loadRoutes(req,res);


      expect(res.status)
        .toHaveBeenCalledWith(401);

    });



    it("returns 404 when user does not exist",async()=>{


      (User.findOne as any)
        .mockResolvedValue(null);


      const req:any={
        user:{
          sub:"abc"
        }
      };


      const res=mockResponse();


      await loadRoutes(req,res);


      expect(res.status)
        .toHaveBeenCalledWith(404);

    });



    it("returns routes successfully",async()=>{


      (User.findOne as any)
        .mockResolvedValue({
          _id:"user123"
        });


      const sortMock = vi.fn()
        .mockResolvedValue([
          {
            routeName:"Park Route"
          }
        ]);


      (Route.find as any)
        .mockReturnValue({
          sort:sortMock
        });


      const req:any={
        user:{
          sub:"abc"
        }
      };


      const res=mockResponse();


      await loadRoutes(req,res);


      expect(Route.find)
        .toHaveBeenCalled();


      expect(res.status)
        .toHaveBeenCalledWith(200);

    });



    it("returns 500 when loading routes fails",async()=>{


      (User.findOne as any)
        .mockRejectedValue(
          new Error("database error")
        );


      const req:any={
        user:{
          sub:"abc"
        }
      };


      const res=mockResponse();


      await loadRoutes(req,res);


      expect(res.status)
        .toHaveBeenCalledWith(500);

    });

  });



  describe("searchRoutes",()=>{


    it("returns search results",async()=>{


      (User.findOne as any)
        .mockResolvedValue({
          _id:"user123"
        });


      const sortMock = vi.fn()
        .mockResolvedValue([]);


      (Route.find as any)
        .mockReturnValue({
          sort:sortMock
        });


      const req:any={
        user:{
          sub:"abc"
        },
        query:{
          q:"park"
        }
      };


      const res=mockResponse();


      await searchRoutes(req,res);


      expect(Route.find)
        .toHaveBeenCalled();


      expect(res.status)
        .toHaveBeenCalledWith(200);

    });



    it("returns all routes with empty query",async()=>{


      (User.findOne as any)
        .mockResolvedValue({
          _id:"user123"
        });


      const sortMock=vi.fn()
        .mockResolvedValue([]);


      (Route.find as any)
        .mockReturnValue({
          sort:sortMock
        });


      const req:any={
        user:{
          sub:"abc"
        },
        query:{
          q:""
        }
      };


      const res=mockResponse();


      await searchRoutes(req,res);


      expect(Route.find)
        .toHaveBeenCalledWith({
          user:"user123"
        });

    });



    it("returns 404 when searching user does not exist",async()=>{


      (User.findOne as any)
        .mockResolvedValue(null);


      const req:any={
        user:{
          sub:"abc"
        },
        query:{
          q:"test"
        }
      };


      const res=mockResponse();


      await searchRoutes(req,res);


      expect(res.status)
        .toHaveBeenCalledWith(404);

    });



    it("returns 500 when search fails",async()=>{


      (User.findOne as any)
        .mockRejectedValue(
          new Error("failed")
        );


      const req:any={
        user:{
          sub:"abc"
        },
        query:{
          q:"test"
        }
      };


      const res=mockResponse();


      await searchRoutes(req,res);


      expect(res.status)
        .toHaveBeenCalledWith(500);

    });

  });



  describe("deleteRoute",()=>{


    it("returns 401 without user",async()=>{


      const req:any={
        user:{},
      };


      const res=mockResponse();


      await deleteRoute(req,res);


      expect(res.status)
        .toHaveBeenCalledWith(401);

    });



    it("rejects invalid id",async()=>{


      (User.findOne as any)
        .mockResolvedValue({
          _id:"user123"
        });


      const req:any={
        user:{
          sub:"abc"
        },
        params:{
          id:"invalid"
        }
      };


      const res=mockResponse();


      await deleteRoute(req,res);


      expect(res.status)
        .toHaveBeenCalledWith(400);

    });



    it("returns 404 when user does not exist",async()=>{


      (User.findOne as any)
        .mockResolvedValue(null);


      const req:any={
        user:{
          sub:"abc"
        },
        params:{
          id:"507f1f77bcf86cd799439011"
        }
      };


      const res=mockResponse();


      await deleteRoute(req,res);


      expect(res.status)
        .toHaveBeenCalledWith(404);

    });



    it("returns 404 when route does not exist",async()=>{


      (User.findOne as any)
        .mockResolvedValue({
          _id:"user123"
        });


      (Route.findOneAndDelete as any)
        .mockResolvedValue(null);


      const req:any={
        user:{
          sub:"abc"
        },
        params:{
          id:"507f1f77bcf86cd799439011"
        }
      };


      const res=mockResponse();


      await deleteRoute(req,res);


      expect(res.status)
        .toHaveBeenCalledWith(404);

    });



    it("deletes route successfully",async()=>{


      (User.findOne as any)
        .mockResolvedValue({
          _id:"user123"
        });


      (Route.findOneAndDelete as any)
        .mockResolvedValue({
          _id:"route123"
        });


      const req:any={
        user:{
          sub:"abc"
        },
        params:{
          id:"507f1f77bcf86cd799439011"
        }
      };


      const res=mockResponse();


      await deleteRoute(req,res);


      expect(Route.findOneAndDelete)
        .toHaveBeenCalled();


      expect(res.status)
        .toHaveBeenCalledWith(200);

    });



    it("returns 500 when delete fails",async()=>{


      (User.findOne as any)
        .mockRejectedValue(
          new Error("failed")
        );


      const req:any={
        user:{
          sub:"abc"
        },
        params:{
          id:"507f1f77bcf86cd799439011"
        }
      };


      const res=mockResponse();


      await deleteRoute(req,res);


      expect(res.status)
        .toHaveBeenCalledWith(500);

    });

  });


});