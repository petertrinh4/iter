import { describe, it, expect, vi, beforeEach } from "vitest";

import { saveRun, loadRuns } from "../runController.js";

import Run from "../../models/Run.js";
import Route from "../../models/Route.js";
import User from "../../models/User.js";

vi.mock("../../models/Run.js", () => ({
  default: {
    create: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock("../../models/Route.js", () => ({
  default: {
    findOne: vi.fn(),
  },
}));

vi.mock("../../models/User.js", () => ({
  default: {
    findOne: vi.fn(),
  },
}));

function mockResponse() {
  const res: any = {};

  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);

  return res;
}

function mockRequest(body = {}, user: any = { sub: "cognito123" }) {
  return {
    body,
    user,
  } as any;
}

describe("runController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });


  describe("saveRun", () => {

    it("returns 400 for invalid run data", async () => {
      const req = mockRequest({});
      const res = mockResponse();

      await saveRun(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid run data",
      });
    });


    it("returns 400 for invalid path id", async () => {
      const req = mockRequest({
        pathId: "bad-id",
        pathName: "Morning Run",
        distanceMiles: 3,
        durationSeconds: 1800,
        targetPaceSeconds: 600,
        waypoints: [
          [1, 2],
          [3, 4],
        ],
      });

      const res = mockResponse();

      await saveRun(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid path id",
      });
    });


    it("returns 401 when user is missing", async () => {
      const req = mockRequest(
        {
          pathId: "507f1f77bcf86cd799439011",
          pathName: "Morning Run",
          distanceMiles: 3,
          durationSeconds: 1800,
          targetPaceSeconds: 600,
          waypoints: [
            [1, 2],
            [3, 4],
          ],
        },
        {}
      );

      const res = mockResponse();

      await saveRun(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Unauthorized",
      });
    });


    it("returns 404 when user does not exist", async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);

      const req = mockRequest({
        pathId: "507f1f77bcf86cd799439011",
        pathName: "Morning Run",
        distanceMiles: 3,
        durationSeconds: 1800,
        targetPaceSeconds: 600,
        waypoints: [
          [1, 2],
          [3, 4],
        ],
      });

      const res = mockResponse();

      await saveRun(req, res);

      expect(User.findOne).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found",
      });
    });


    it("returns 404 when path does not exist", async () => {
      vi.mocked(User.findOne).mockResolvedValue({
        _id: "user123",
      } as any);

      vi.mocked(Route.findOne).mockResolvedValue(null);

      const req = mockRequest({
        pathId: "507f1f77bcf86cd799439011",
        pathName: "Morning Run",
        distanceMiles: 3,
        durationSeconds: 1800,
        targetPaceSeconds: 600,
        waypoints: [
          [1, 2],
          [3, 4],
        ],
      });

      const res = mockResponse();

      await saveRun(req, res);

      expect(Route.findOne).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Path not found",
      });
    });


    it("creates a run successfully", async () => {
      vi.mocked(User.findOne).mockResolvedValue({
        _id: "user123",
      } as any);

      vi.mocked(Route.findOne).mockResolvedValue({
        _id: "route123",
      } as any);


      vi.mocked(Run.create).mockResolvedValue({
        _id: "run123",
        pathName: "Morning Run",
      } as any);


      const req = mockRequest({
        pathId: "507f1f77bcf86cd799439011",
        pathName: "Morning Run",
        distanceMiles: 3,
        durationSeconds: 1800,
        targetPaceSeconds: 600,
        waypoints: [
          [1, 2],
          [3, 4],
        ],
      });

      const res = mockResponse();


      await saveRun(req, res);


      expect(Run.create).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(201);

      expect(res.json).toHaveBeenCalledWith({
        message: "Run saved successfully",
        run: {
          _id: "run123",
          pathName: "Morning Run",
        },
      });
    });


    it("returns 500 when database throws error", async () => {
      vi.mocked(User.findOne).mockRejectedValue(
        new Error("Database error")
      );


      const req = mockRequest({
        pathId: "507f1f77bcf86cd799439011",
        pathName: "Morning Run",
        distanceMiles: 3,
        durationSeconds: 1800,
        targetPaceSeconds: 600,
        waypoints: [
          [1, 2],
          [3, 4],
        ],
      });


      const res = mockResponse();


      await saveRun(req, res);


      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
      });
    });

  });



  describe("loadRuns", () => {


    it("returns unauthorized without user", async () => {

      const req = mockRequest({}, {});

      const res = mockResponse();


      await loadRuns(req, res);


      expect(res.status).toHaveBeenCalledWith(401);

      expect(res.json).toHaveBeenCalledWith({
        message: "Unauthorized",
      });

    });



    it("returns 404 when user does not exist", async () => {

      vi.mocked(User.findOne).mockResolvedValue(null);


      const req = mockRequest();

      const res = mockResponse();


      await loadRuns(req, res);


      expect(res.status).toHaveBeenCalledWith(404);

      expect(res.json).toHaveBeenCalledWith({
        message: "User not found",
      });

    });



    it("returns runs successfully", async () => {

      vi.mocked(User.findOne).mockResolvedValue({
        _id: "user123",
      } as any);


      const sortMock = vi.fn().mockResolvedValue([
        {
          _id: "run1",
          pathName: "Morning Run",
        },
      ]);


      vi.mocked(Run.find).mockReturnValue({
        sort: sortMock,
      } as any);



      const req = mockRequest();

      const res = mockResponse();


      await loadRuns(req, res);


      expect(Run.find).toHaveBeenCalled();


      expect(res.status).toHaveBeenCalledWith(200);


      expect(res.json).toHaveBeenCalledWith([
        {
          _id: "run1",
          pathName: "Morning Run",
        },
      ]);

    });



    it("returns 500 on database failure", async () => {

      vi.mocked(User.findOne).mockRejectedValue(
        new Error("Database error")
      );


      const req = mockRequest();

      const res = mockResponse();


      await loadRuns(req, res);


      expect(res.status).toHaveBeenCalledWith(500);


      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
      });

    });

  });

});