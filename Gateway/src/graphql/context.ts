import { Request } from "express";

export interface GQLContext {
  cookies: any;
  headers: any;
}

export const buildContext = async ({ req }: { req: Request }): Promise<GQLContext> => {
  return {
    cookies: req.cookies,
    headers: req.headers,
  };
};
