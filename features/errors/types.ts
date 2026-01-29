/**
 * TypeScript типы для системы обработки ошибок
 */

import { ApiError, ErrorType } from "./lib";

/**
 * Типы для различных HTTP методов
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Конфигурация для API запросов
 */
export interface ApiRequestConfig extends RequestInit {
  method?: HttpMethod;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number, error: ApiError) => void;
}

/**
 * Результат API запроса
 */
export interface ApiResponse<T = any> {
  data: T;
  error: null;
  status: number;
}

/**
 * Ошибка API запроса
 */
export interface ApiErrorResponse {
  data: null;
  error: ApiError;
  status: number;
}

/**
 * Объединенный тип результата
 */
export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;

/**
 * Guard функция для проверки успешного ответа
 */
export function isApiSuccess<T>(
  result: ApiResult<T>
): result is ApiResponse<T> {
  return result.error === null;
}

/**
 * Guard функция для проверки ошибки
 */
export function isApiError<T>(
  result: ApiResult<T>
): result is ApiErrorResponse {
  return result.error !== null;
}

/**
 * Типы для валидационных ошибок
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
  code: string;
  value?: any;
}

/**
 * Расширенная ошибка валидации
 */
export interface ValidationError extends ApiError {
  type: ErrorType.VALIDATION_ERROR;
  details: ValidationErrorDetail[];
}

/**
 * Guard функция для проверки валидационной ошибки
 */
export function isValidationError(error: ApiError): error is ValidationError {
  return (
    error.type === ErrorType.VALIDATION_ERROR &&
    Array.isArray(error.details) &&
    error.details.length > 0
  );
}

/**
 * Типы для серверных ошибок
 */
export interface ServerError extends ApiError {
  type: ErrorType.SERVER_ERROR;
  requestId?: string;
  timestamp?: string;
}

/**
 * Guard функция для проверки серверной ошибки
 */
export function isServerError(error: ApiError): error is ServerError {
  return error.type === ErrorType.SERVER_ERROR;
}

/**
 * Типы для ошибок авторизации
 */
export interface AuthError extends ApiError {
  type: ErrorType.AUTHENTICATION_ERROR | ErrorType.AUTHORIZATION_ERROR;
  redirectUrl?: string;
}

/**
 * Guard функция для проверки ошибки авторизации
 */
export function isAuthError(error: ApiError): error is AuthError {
  return (
    error.type === ErrorType.AUTHENTICATION_ERROR ||
    error.type === ErrorType.AUTHORIZATION_ERROR
  );
}

/**
 * Callback типы для обработки ошибок
 */
export type ErrorHandler = (error: ApiError) => void | Promise<void>;
export type RetryCallback = (attempt: number, maxAttempts: number) => void;
export type ErrorCallback = (error: Error, errorInfo: React.ErrorInfo) => void;

/**
 * Конфигурация для компонента ErrorDisplay
 */
export interface ErrorDisplayConfig {
  showDetails?: boolean;
  showRetryButton?: boolean;
  showDismissButton?: boolean;
  showRequestId?: boolean;
  showTimestamp?: boolean;
  compact?: boolean;
}

/**
 * Состояние обработки ошибок
 */
export interface ErrorState {
  error: ApiError | null;
  isError: boolean;
  timestamp: Date | null;
  count: number;
}

/**
 * Конфигурация retry логики
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: ErrorType[];
  shouldRetry?: (error: ApiError, attempt: number) => boolean;
}

/**
 * Метрики ошибок для мониторинга
 */
export interface ErrorMetrics {
  type: ErrorType;
  count: number;
  lastOccurred: Date;
  averageResponseTime?: number;
  affectedEndpoints: string[];
}

/**
 * Контекст ошибки для логирования
 */
export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  additionalData?: Record<string, any>;
}

/**
 * Полный лог ошибки
 */
export interface ErrorLog {
  error: ApiError;
  context: ErrorContext;
  timestamp: Date;
  stackTrace?: string;
  userAgent?: string;
  url?: string;
}
