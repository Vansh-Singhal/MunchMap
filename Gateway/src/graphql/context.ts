import { Request } from "express";

export interface GQLContext {
  cookies: any;
  token : any;
  headers: any;
}

export const buildContext = async ({ req }: { req: Request }): Promise<GQLContext> => {
  return {
    cookies: req.cookies,
    token: req.cookies?.token,
    headers: req.headers,
  };
};
