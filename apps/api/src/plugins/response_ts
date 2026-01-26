import { Elysia } from "elysia";

interface SingleResponse {
  data: any;
  success: boolean;
  code: number;
  message: string;
}

interface PaginatedResponse extends SingleResponse {
  data: any[];
  limit?: number;
  page?: number;
  total?: number;
  totalPages?: number;
}

export const responsePlugin = new Elysia({ name: "response-transformer" })
  .mapResponse({ as: "global" }, ({ responseValue, set, status }: any) => {
    // Skip transformation for static files and streams
    if (
      responseValue instanceof Blob ||
      responseValue instanceof ArrayBuffer ||
      responseValue instanceof ReadableStream ||
      (typeof File !== "undefined" && responseValue instanceof File)
    ) {
      return responseValue;
    }

    // Handle null/undefined responses
    if (responseValue === null || responseValue === undefined) {
      status(set.status || 200);
      return {
        data: null,
        success: true,
        code: set.status || 200,
        message: "Success",
      } as SingleResponse;
    }

    // Handle non-object responses (primitives, strings, etc.)
    if (typeof responseValue !== "object") {
      return {
        data: responseValue,
        success: true,
        code: set.status || 200,
        message: "Success",
      } as SingleResponse;
    }

    // Check if response already has the expected structure
    const hasData = "data" in responseValue;
    const hasSuccess = "success" in responseValue;
    const hasCode = "code" in responseValue;
    const hasMessage = "message" in responseValue;

    // If it's already a proper API response, maintain it
    if (hasData && hasSuccess && hasCode && hasMessage) {
      return responseValue;
    }

    // Handle Error objects
    if (responseValue instanceof Error) {
      return {
        data: null,
        success: false,
        code: set.status || 500,
        message: responseValue.message,
      } as SingleResponse;
    }

    // Extract existing properties
    const existingCode: number = hasCode
      ? Number(responseValue.code)
      : Number(set.status || 200);
    const existingSuccess = hasSuccess
      ? responseValue.success
      : existingCode >= 200 && existingCode < 300;
    const existingMessage = hasMessage
      ? responseValue.message
      : existingSuccess
        ? "Success"
        : "Error";

    // Check if response is an array
    if (Array.isArray(responseValue)) {
      return {
        data: responseValue,
        success: existingSuccess,
        code: existingCode,
        message: existingMessage,
        limit: undefined,
        page: undefined,
        total: responseValue.length,
        totalPages: undefined,
      } as PaginatedResponse;
    }

    function isPaginated(v: any): v is PaginatedResponse {
      return v && Array.isArray(v.data) && ("limit" in v || "page" in v);
    }

    // Check if the data property is an array (paginated response)
    if (hasData && isPaginated(responseValue)) {
      return {
        data: responseValue.data,
        success: existingSuccess,
        code: existingCode,
        message: existingMessage,
        limit: responseValue.limit,
        page: responseValue.page,
        total: responseValue.total ?? responseValue.data.length,
        totalPages: responseValue.totalPages,
      } as PaginatedResponse;
    }

    // Single object response
    const data: any = hasData ? responseValue.data : responseValue;

    // Remove the extracted properties from data if they exist
    const cleanData = { ...data };
    if (!hasData) {
      delete cleanData.success;
      delete cleanData.code;
      delete cleanData.message;
    }

    return {
      data: cleanData,
      success: existingSuccess,
      code: existingCode,
      message: existingMessage,
    } as SingleResponse;
  })
  .onError(({ code, status, set }) => {
    return {
      success: false,
      data: null,
      message: "An Error occurred",
      code: set.status || 500,
    };
  });
