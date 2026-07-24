import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";


const { verifyMock } = vi.hoisted(() => {
  return {
    verifyMock: vi.fn(),
  };
});


vi.mock("aws-jwt-verify", () => {
  return {
    CognitoJwtVerifier: {
      create: vi.fn(() => ({
        verify: verifyMock,
      })),
    },
  };
});


import { authMiddleware } from "../authMiddleware.js";

describe("authMiddleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      headers: {},
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    next = vi.fn();
  });


  it("returns 401 when authorization header is missing", async () => {
    await authMiddleware(
      req as Request,
      res as Response,
      next
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Missing authorization token",
    });

    expect(next).not.toHaveBeenCalled();
  });


  it("returns 401 when bearer token is missing", async () => {
    req.headers = {
      authorization: "Bearer ",
    };

    await authMiddleware(
      req as Request,
      res as Response,
      next
    );

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      message: "Missing token",
    });

    expect(next).not.toHaveBeenCalled();
  });


  it("returns 401 when token verification fails", async () => {
    req.headers = {
      authorization: "Bearer invalid-token",
    };

    verifyMock.mockRejectedValue(
      new Error("Invalid token")
    );

    await authMiddleware(
      req as Request,
      res as Response,
      next
    );


    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid token",
    });

    expect(next).not.toHaveBeenCalled();
  });


  it("allows request with valid token", async () => {
    req.headers = {
      authorization: "Bearer valid-token",
    };


    verifyMock.mockResolvedValue({
      sub: "cognito123",
      email: "test@example.com",
    });


    await authMiddleware(
      req as Request,
      res as Response,
      next
    );


    expect(req.user).toEqual({
      sub: "cognito123",
      email: "test@example.com",
    });


    expect(next).toHaveBeenCalled();
  });


  it("does not attach email when payload email is not a string", async () => {
    req.headers = {
      authorization: "Bearer valid-token",
    };


    verifyMock.mockResolvedValue({
      sub: "cognito123",
      email: 123,
    });


    await authMiddleware(
      req as Request,
      res as Response,
      next
    );


    expect(req.user).toEqual({
      sub: "cognito123",
    });


    expect(next).toHaveBeenCalled();
  });


  it("handles payload without email", async () => {
    req.headers = {
      authorization: "Bearer valid-token",
    };


    verifyMock.mockResolvedValue({
      sub: "cognito123",
    });


    await authMiddleware(
      req as Request,
      res as Response,
      next
    );


    expect(req.user).toEqual({
      sub: "cognito123",
    });


    expect(next).toHaveBeenCalled();
  });


  it("handles token with extra spaces", async () => {
    req.headers = {
      authorization: "Bearer token123 extra",
    };


    verifyMock.mockResolvedValue({
      sub: "abc",
    });


    await authMiddleware(
      req as Request,
      res as Response,
      next
    );


    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({
      sub: "abc",
    });
  });
});