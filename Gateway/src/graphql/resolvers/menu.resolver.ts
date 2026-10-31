import { GQLContext } from "../../utils/context";
import { InputWrapper } from "../../types/user.types";
import { CreateMenuInput, MenuIdInput, VendorMenuInput, MenuPaginationInput,
  UpdateMenuInput, MenuListingInput, MenuAvailabilityInput } from "../../types/menu.types";
import menuAPI from "../loaders/menu.api";

export const menuResolvers = {
  Query: {
    getMenuItemsByVendor: (_: unknown, { input }: InputWrapper<VendorMenuInput>, ctx: GQLContext) =>
      menuAPI.getMenuItemsByVendor(input, ctx),
    getMenuItemById: (_: unknown, { input }: InputWrapper<MenuIdInput>, ctx: GQLContext) =>
      menuAPI.getMenuItemById(input.menuId, ctx),
    myMenuItems: (_: unknown, { input }: { input?: MenuPaginationInput }, ctx: GQLContext) =>
      menuAPI.myMenuItems(input, ctx),
    getMyMenuItemById: (_: unknown, { input }: InputWrapper<MenuIdInput>, ctx: GQLContext) =>
      menuAPI.getMyMenuItemById(input.menuId, ctx),
  },
  Mutation: {
    createMenuItem: (_: unknown, { input }: InputWrapper<CreateMenuInput>, ctx: GQLContext) =>
      menuAPI.createMenuItem(input, ctx),
    updateMenuItem: (_: unknown, { input }: InputWrapper<UpdateMenuInput>, ctx: GQLContext) =>
      menuAPI.updateMenuItem(input, ctx),
    updateMenuListing: (_: unknown, { input }: InputWrapper<MenuListingInput>, ctx: GQLContext) =>
      menuAPI.updateMenuListing(input, ctx),
    updateMenuAvailability: (_: unknown, { input }: InputWrapper<MenuAvailabilityInput>, ctx: GQLContext) =>
      menuAPI.updateMenuAvailability(input, ctx),
  },
};
