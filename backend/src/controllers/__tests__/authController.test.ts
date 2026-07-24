import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";

const { sendMock, findOneMock, createMock, decodeMock } = vi.hoisted(() => ({
  sendMock: vi.fn(),
  findOneMock: vi.fn(),
  createMock: vi.fn(),
  decodeMock: vi.fn(),
}));

vi.mock("../../utils/cognito.js", () => ({
  cognito: {
    send: sendMock,
  },
}));

vi.mock("../../models/User.js", () => ({
  default: {
    findOne: findOneMock,
    create: createMock,
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    decode: decodeMock,
  },
}));

import {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
} from "../authController.js";


function mockResponse() {
  const res: any = {};

  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);

  return res;
}


describe("authController", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });


  describe("register", () => {

    it("returns 201 when signup succeeds", async () => {

      sendMock.mockResolvedValue({});

      const req = {
        body: {
          email: "test@test.com",
          password: "password",
          name: "Peter",
          username: "peter",
        },
      } as Request;

      const res = mockResponse();

      await register(req, res);

      expect(sendMock).toHaveBeenCalled();

      expect(res.status)
        .toHaveBeenCalledWith(201);

      expect(res.json)
        .toHaveBeenCalledWith({
          message: "Verification code sent.",
        });

    });


    it("returns 400 when cognito fails", async () => {

      sendMock.mockRejectedValue(
        new Error("failed")
      );

      const req = {
        body: {
          email: "test@test.com",
          password: "password",
          name: "Peter",
          username: "peter",
        },
      } as Request;


      const res = mockResponse();


      await register(req, res);


      expect(res.status)
        .toHaveBeenCalledWith(400);

    });

  });



  describe("verifyEmail", () => {

    it("rejects missing fields", async () => {

      const req = {
        body: {},
      } as Request;


      const res = mockResponse();


      await verifyEmail(req, res);


      expect(res.status)
        .toHaveBeenCalledWith(400);

    });


    it("verifies email successfully", async () => {

      sendMock.mockResolvedValue({});


      const req = {
        body: {
          email:"test@test.com",
          code:"123456",
        },
      } as Request;


      const res = mockResponse();


      await verifyEmail(req,res);


      expect(res.status)
        .toHaveBeenCalledWith(200);

    });


    it("returns 400 for invalid code", async () => {

      sendMock.mockRejectedValue(
        new Error("bad code")
      );


      const req = {
        body:{
          email:"test@test.com",
          code:"wrong"
        }
      } as Request;


      const res = mockResponse();


      await verifyEmail(req,res);


      expect(res.status)
        .toHaveBeenCalledWith(400);

    });

  });



  describe("login", () => {


    it("rejects missing credentials", async()=>{

      const req={
        body:{}
      } as Request;


      const res=mockResponse();


      await login(req,res);


      expect(res.status)
        .toHaveBeenCalledWith(400);

    });



    it("logs user in successfully", async()=>{


      sendMock.mockResolvedValue({

        AuthenticationResult:{
          IdToken:"id-token",
          AccessToken:"access-token",
          RefreshToken:"refresh-token"
        }

      });


      decodeMock.mockReturnValue({

        sub:"cognito123",
        email:"test@test.com",
        name:"Peter",
        preferred_username:"peter"

      });


      findOneMock.mockResolvedValue(null);

      createMock.mockResolvedValue({});


      const req={
        body:{
          email:"test@test.com",
          password:"password"
        }
      } as Request;



      const res=mockResponse();


      await login(req,res);



      expect(createMock)
        .toHaveBeenCalled();


      expect(res.status)
        .toHaveBeenCalledWith(200);

    });



    it("rejects invalid login", async()=>{


      sendMock.mockRejectedValue(
        new Error("invalid")
      );


      const req={
        body:{
          email:"test@test.com",
          password:"bad"
        }
      } as Request;


      const res=mockResponse();


      await login(req,res);


      expect(res.status)
        .toHaveBeenCalledWith(401);

    });

  });



  describe("forgotPassword",()=>{


    it("requires email",async()=>{

      const req={
        body:{}
      } as Request;


      const res=mockResponse();


      await forgotPassword(req,res);


      expect(res.status)
        .toHaveBeenCalledWith(400);

    });



    it("sends reset code",async()=>{

      sendMock.mockResolvedValue({});


      const req={
        body:{
          email:"test@test.com"
        }
      } as Request;


      const res=mockResponse();


      await forgotPassword(req,res);


      expect(res.status)
        .toHaveBeenCalledWith(200);

    });


  });



  describe("resetPassword",()=>{


    it("requires fields",async()=>{

      const req={
        body:{}
      } as Request;


      const res=mockResponse();


      await resetPassword(req,res);


      expect(res.status)
        .toHaveBeenCalledWith(400);

    });



    it("resets password successfully",async()=>{

      sendMock.mockResolvedValue({});


      const req={
        body:{
          email:"test@test.com",
          code:"123456",
          newPassword:"newpassword"
        }
      } as Request;


      const res=mockResponse();


      await resetPassword(req,res);


      expect(res.status)
        .toHaveBeenCalledWith(200);

    });


    it("rejects invalid reset code",async()=>{


      sendMock.mockRejectedValue(
        new Error("invalid")
      );


      const req={
        body:{
          email:"test@test.com",
          code:"wrong",
          newPassword:"password"
        }
      } as Request;


      const res=mockResponse();


      await resetPassword(req,res);


      expect(res.status)
        .toHaveBeenCalledWith(400);

    });


  });


});