import { Request, Response } from "express";

export interface GQLContext {
  req : Request;
  res : Response;
  cookies: any;
  token : any;
  headers: any;
}

export const buildContext = async ({ req, res }: { req: Request, res : Response }): Promise<GQLContext> => {
  return {
    req,
    res,
    cookies: req.cookies,
    token: req.cookies?.token,
    headers: req.headers,
  };
};
