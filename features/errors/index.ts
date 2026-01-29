// Lib (core error handling)
export {
  ErrorType,
  parseApiError,
  getErrorMessage,
  getErrorIcon,
  getErrorColor,
  fetchWithErrorHandling,
  retryWithBackoff,
} from "./lib";
export type { ApiError, ErrorDetail } from "./lib";

// Types
export type {
  HttpMethod,
  ApiRequestConfig,
  ApiResponse,
  ApiErrorResponse,
  ApiResult,
  ValidationErrorDetail,
  ValidationError,
  ServerError,
  AuthError,
  ErrorHandler,
  RetryCallback,
  ErrorCallback,
  ErrorDisplayConfig,
  ErrorState,
  RetryConfig,
  ErrorMetrics,
  ErrorContext,
  ErrorLog,
} from "./types";
export {
  isApiSuccess,
  isApiError,
  isValidationError,
  isServerError,
  isAuthError,
} from "./types";

// Helpers
export {
  ErrorLogger,
  ValidationErrorHelper,
  RetryHelper,
  ErrorAnalyzer,
  ErrorFormatter,
  ErrorFactory,
} from "./helpers";

// Hooks
export { useErrorHandler, useAsyncAction, useRetry } from "./hooks";
