import axios from "axios";
import { GQLContext } from "../../utils/context";
import { CreateMenuInput, UpdateMenuInput, VendorMenuInput, MenuPaginationInput,
  MenuResponse, MenuListResponse, MenuListingInput, MenuAvailabilityInput } from "../../types/menu.types";
import { buildCookieHeader } from "../utils/buildCookieHeader";
import { handleError } from "../utils/handleError";

const menuServiceUrl = (): string => {
  const url = process.env.MENU_SERVICE_URL;
  if (!url) throw new Error("MENU_SERVICE_URL is required");
  return url.replace(/\/$/, "");
};
const requestOptions = (ctx: GQLContext) => ({
  headers: { Cookie: buildCookieHeader(ctx.cookies) }, withCredentials: true, timeout: 5000,
});
const pagination = (input: MenuPaginationInput | undefined) => ({
  offset: input?.offset ?? 0, limit: input?.limit ?? 10,
});
const getItem = async (path: string, ctx: GQLContext): Promise<MenuResponse> => {
  try { return (await axios.get<MenuResponse>(`${menuServiceUrl()}${path}`, requestOptions(ctx))).data; }
  catch (error: unknown) { return handleError(error); }
};
const getList = async (path: string, input: MenuPaginationInput | undefined, ctx: GQLContext): Promise<MenuListResponse> => {
  try {
    return (await axios.get<MenuListResponse>(`${menuServiceUrl()}${path}`, {
      ...requestOptions(ctx), params: pagination(input),
    })).data;
  } catch (error: unknown) { return handleError(error); }
};
const patchItem = async (path: string, body: unknown, ctx: GQLContext): Promise<MenuResponse> => {
  try { return (await axios.patch<MenuResponse>(`${menuServiceUrl()}${path}`, body, requestOptions(ctx))).data; }
  catch (error: unknown) { return handleError(error); }
};
export default {
  createMenuItem: async (input: CreateMenuInput, ctx: GQLContext): Promise<MenuResponse> => {
    try { return (await axios.post<MenuResponse>(`${menuServiceUrl()}/createItem`, input, requestOptions(ctx))).data; }
    catch (error: unknown) { return handleError(error); }
  },
  getMenuItemsByVendor: (input: VendorMenuInput, ctx: GQLContext): Promise<MenuListResponse> =>
    getList(`/vendor/${encodeURIComponent(input.vendorId)}`, input, ctx),
  getMenuItemById: (menuId: string, ctx: GQLContext): Promise<MenuResponse> =>
    getItem(`/${encodeURIComponent(menuId)}`, ctx),
  myMenuItems: (input: MenuPaginationInput | undefined, ctx: GQLContext): Promise<MenuListResponse> =>
    getList("/me", input, ctx),
  getMyMenuItemById: (menuId: string, ctx: GQLContext): Promise<MenuResponse> =>
    getItem(`/me/${encodeURIComponent(menuId)}`, ctx),
  updateMenuItem: (input: UpdateMenuInput, ctx: GQLContext): Promise<MenuResponse> =>
    patchItem(`/${encodeURIComponent(input.menuId)}`, input.input, ctx),
  updateMenuListing: (input: MenuListingInput, ctx: GQLContext): Promise<MenuResponse> =>
    patchItem(`/${encodeURIComponent(input.menuId)}/listing`, { isListed: input.isListed }, ctx),
  updateMenuAvailability: (input: MenuAvailabilityInput, ctx: GQLContext): Promise<MenuResponse> =>
    patchItem(`/${encodeURIComponent(input.menuId)}/availability`, { isAvailable: input.isAvailable }, ctx),
};
