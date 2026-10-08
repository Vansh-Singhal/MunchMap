import { BasicResponse } from "./user.types";

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface APIErrorResponse extends BasicResponse {
  success: false;
  errors?: ValidationIssue[];
}
