import { GQLContext } from "../../utils/context";

export const buildCookieHeader = (cookies: Record<string, string | undefined>): string => {
  if (!cookies) return "";
  return Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
};

export const setResponseCookies = (ctx: GQLContext, res: any) => {
  const setCookie = res.headers["set-cookie"];
  if (setCookie) {
    ctx.res.setHeader("Set-Cookie", setCookie);
  }
};
