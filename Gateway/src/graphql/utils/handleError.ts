import axios from "axios";
import { APIErrorResponse, ValidationIssue } from "../../types/apiError.types";

const isValidationIssue = (value: unknown): value is ValidationIssue => {
  return typeof value === "object" && value !== null &&
    "field" in value && typeof value.field === "string" &&
    "message" in value && typeof value.message === "string";
};

export const handleError = (error: unknown): APIErrorResponse => {
  if (axios.isAxiosError<unknown>(error)) {
    // Do not log Axios request objects: they contain forwarded credentials.
    console.error("Downstream request failed", error.response?.status ?? "unavailable");
    const data = error.response?.data;
    if (typeof data === "object" && data !== null) {
      const response: APIErrorResponse = {
        success: false,
        message: "message" in data && typeof data.message === "string"
          ? data.message : "Something went wrong",
      };
      if ("errors" in data && Array.isArray(data.errors)) {
        response.errors = data.errors.filter(isValidationIssue);
      }
      return response;
    }
  } else {
    console.error("Gateway request failed", error instanceof Error ? error.name : "Unknown error");
  }
  return { success: false, message: "Internal server error" };
};
