import { Request, Response } from "express";
import { IncomingHttpHeaders } from "http";

export interface GQLContext {
  req: Request;
  res: Response;
  cookies: Record<string, string | undefined>;
  token?: string; // token may or may not exist
  headers: IncomingHttpHeaders;
}

export const buildContext = async ({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): Promise<GQLContext> => {
  const cookies = req.cookies ?? {};

  return {
    req,
    res,
    cookies,
    token: cookies.token, // string | undefined
    headers: req.headers,
  };
};
