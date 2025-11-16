export const buildCookieHeader = (ctx: any): string => {
  const cookies = ctx?.cookies;
  if (!cookies) return "";
  return Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
};

export const setResponseCookies = (ctx: any, res: any) => {
  const setCookie = res.headers["set-cookie"];
  if (setCookie) {
    ctx.res.setHeader("Set-Cookie", setCookie);
  }
};
