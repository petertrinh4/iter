import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";

const { findOneMock, saveMock } = vi.hoisted(() => ({
  findOneMock: vi.fn(),
  saveMock: vi.fn(),
}));

vi.mock("../../models/User.js", () => ({
  default: {
    findOne: findOneMock,
  },
}));

import { getMe } from "../userController.js";


function mockResponse() {
  const res: any = {};

  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);

  return res;
}


describe("userController", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });


  describe("getMe", () => {


    it("returns 401 when user is missing", async () => {

      const req = {
        user: undefined,
      } as Request;


      const res = mockResponse();


      await getMe(req, res);


      expect(res.status)
        .toHaveBeenCalledWith(401);

      expect(res.json)
        .toHaveBeenCalledWith({
          message: "Unauthorized",
        });

    });



    it("returns 401 when email is missing", async () => {

      const req = {
        user:{
          sub:"cognito123"
        }
      } as Request;


      const res = mockResponse();


      await getMe(req,res);


      expect(res.status)
        .toHaveBeenCalledWith(401);

    });



    it("returns existing user by cognitoSub", async () => {


      const user = {
        _id:"123",
        cognitoSub:"cognito123",
        email:"test@test.com",
        username:"peter"
      };


      findOneMock.mockResolvedValue(user);



      const req = {
        user:{
          sub:"cognito123",
          email:"test@test.com"
        }
      } as Request;



      const res = mockResponse();



      await getMe(req,res);



      expect(findOneMock)
        .toHaveBeenCalledWith({
          cognitoSub:"cognito123"
        });



      expect(res.json)
        .toHaveBeenCalledWith(user);

    });




    it("finds user by email and upgrades cognitoSub", async () => {


      const save = vi.fn();


      const user:any = {
        _id:"123",
        email:"test@test.com",
        cognitoSub:"old-sub",
        save,
      };


      findOneMock
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(user);



      const req = {
        user:{
          sub:"new-sub",
          email:"test@test.com"
        }
      } as Request;



      const res = mockResponse();



      await getMe(req,res);



      expect(findOneMock)
        .toHaveBeenNthCalledWith(
          1,
          {
            cognitoSub:"new-sub"
          }
        );


      expect(findOneMock)
        .toHaveBeenNthCalledWith(
          2,
          {
            email:"test@test.com"
          }
        );


      expect(user.cognitoSub)
        .toBe("new-sub");


      expect(save)
        .toHaveBeenCalled();


      expect(res.json)
        .toHaveBeenCalledWith(user);

    });




    it("returns 404 when user does not exist", async () => {


      findOneMock
        .mockResolvedValue(null);



      const req = {
        user:{
          sub:"cognito123",
          email:"test@test.com"
        }
      } as Request;



      const res = mockResponse();



      await getMe(req,res);



      expect(res.status)
        .toHaveBeenCalledWith(404);



      expect(res.json)
        .toHaveBeenCalledWith({
          message:"User profile not found"
        });

    });




    it("returns 500 when database fails", async () => {


      findOneMock
        .mockRejectedValue(
          new Error("Database error")
        );



      const req = {
        user:{
          sub:"cognito123",
          email:"test@test.com"
        }
      } as Request;



      const res = mockResponse();



      await getMe(req,res);



      expect(res.status)
        .toHaveBeenCalledWith(500);



      expect(res.json)
        .toHaveBeenCalledWith({
          message:"Server error"
        });

    });


  });


});