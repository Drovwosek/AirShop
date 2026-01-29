/**
 * Типы ошибок, которые могут прийти с бэкенда
 */
export enum ErrorType {
  NETWORK_ERROR = "NETWORK_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  SERVER_ERROR = "SERVER_ERROR",
  RATE_LIMIT = "RATE_LIMIT",
  TIMEOUT = "TIMEOUT",
  UNKNOWN = "UNKNOWN",
}

/**
 * Интерфейс для детальной информации об ошибке
 */
export interface ErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

/**
 * Основной интерфейс ошибки API
 */
export interface ApiError {
  type: ErrorType;
  message: string;
  statusCode?: number;
  details?: ErrorDetail[];
  timestamp?: string;
  requestId?: string;
  retryable?: boolean;
}

/**
 * Конфигурация для обработки ошибок
 */
interface ErrorConfig {
  showToast?: boolean;
  logToConsole?: boolean;
  throwError?: boolean;
}

/**
 * Парсит ответ ошибки с бэкенда и преобразует в стандартный формат
 */
export async function parseApiError(error: unknown): Promise<ApiError> {
  // Если это уже наш формат ошибки
  if (isApiError(error)) {
    return error;
  }

  // Если это Response объект
  if (error instanceof Response) {
    return await parseResponseError(error);
  }

  // Если это Error объект
  if (error instanceof Error) {
    return parseErrorObject(error);
  }

  // Если это объект с информацией об ошибке
  if (typeof error === "object" && error !== null) {
    return parseErrorObject(error);
  }

  // Неизвестный тип ошибки
  return {
    type: ErrorType.UNKNOWN,
    message: String(error) || "Произошла неизвестная ошибка",
    retryable: false,
  };
}

/**
 * Проверяет, является ли объект ApiError
 */
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    "message" in error
  );
}

/**
 * Парсит Response объект
 */
async function parseResponseError(response: Response): Promise<ApiError> {
  const statusCode = response.status;
  let message = response.statusText || "Ошибка сервера";
  let details: ErrorDetail[] | undefined;
  let requestId: string | undefined;

  try {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      message = data.message || data.error || message;
      details = data.details || data.errors;
      requestId = data.requestId || response.headers.get("x-request-id") || undefined;
    } else {
      const text = await response.text();
      if (text) {
        message = text;
      }
    }
  } catch (e) {
    console.error("Failed to parse error response:", e);
  }

  const type = getErrorTypeFromStatus(statusCode);

  return {
    type,
    message,
    statusCode,
    details,
    requestId,
    timestamp: new Date().toISOString(),
    retryable: isRetryableError(type, statusCode),
  };
}

/**
 * Парсит Error объект или plain object
 */
function parseErrorObject(error: Error | object): ApiError {
  const err = error as any;

  // Проверяем наличие специфичных свойств
  const message = err.message || err.error || "Произошла ошибка";
  const statusCode = err.statusCode || err.status;
  const details = err.details || err.errors;
  const requestId = err.requestId;

  // Определяем тип ошибки
  let type = ErrorType.UNKNOWN;

  if (err.name === "TypeError" || err.message?.includes("fetch")) {
    type = ErrorType.NETWORK_ERROR;
  } else if (err.name === "AbortError" || err.message?.includes("timeout")) {
    type = ErrorType.TIMEOUT;
  } else if (statusCode) {
    type = getErrorTypeFromStatus(statusCode);
  }

  return {
    type,
    message,
    statusCode,
    details,
    requestId,
    timestamp: new Date().toISOString(),
    retryable: isRetryableError(type, statusCode),
  };
}

/**
 * Определяет тип ошибки по HTTP статус коду
 */
function getErrorTypeFromStatus(statusCode: number): ErrorType {
  if (statusCode >= 400 && statusCode < 500) {
    switch (statusCode) {
      case 400:
        return ErrorType.VALIDATION_ERROR;
      case 401:
        return ErrorType.AUTHENTICATION_ERROR;
      case 403:
        return ErrorType.AUTHORIZATION_ERROR;
      case 404:
        return ErrorType.NOT_FOUND;
      case 429:
        return ErrorType.RATE_LIMIT;
      default:
        return ErrorType.VALIDATION_ERROR;
    }
  }

  if (statusCode >= 500) {
    return ErrorType.SERVER_ERROR;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Проверяет, можно ли повторить запрос при данной ошибке
 */
function isRetryableError(type: ErrorType, statusCode?: number): boolean {
  // Сетевые ошибки и таймауты можно повторить
  if (type === ErrorType.NETWORK_ERROR || type === ErrorType.TIMEOUT) {
    return true;
  }

  // Серверные ошибки 5xx можно повторить
  if (type === ErrorType.SERVER_ERROR || (statusCode && statusCode >= 500)) {
    return true;
  }

  // Rate limit можно повторить после задержки
  if (type === ErrorType.RATE_LIMIT) {
    return true;
  }

  return false;
}

/**
 * Получает человекочитаемое сообщение для типа ошибки
 */
export function getErrorMessage(error: ApiError): string {
  // Если есть кастомное сообщение, используем его
  if (error.message && error.message !== "Ошибка сервера") {
    return error.message;
  }

  // Иначе используем стандартное сообщение по типу ошибки
  switch (error.type) {
    case ErrorType.NETWORK_ERROR:
      return "Не удалось подключиться к серверу. Проверьте интернет-соединение.";
    case ErrorType.VALIDATION_ERROR:
      return "Данные не прошли проверку. Проверьте введенную информацию.";
    case ErrorType.AUTHENTICATION_ERROR:
      return "Требуется авторизация. Пожалуйста, войдите в систему.";
    case ErrorType.AUTHORIZATION_ERROR:
      return "У вас нет прав для выполнения этого действия.";
    case ErrorType.NOT_FOUND:
      return "Запрашиваемый ресурс не найден.";
    case ErrorType.SERVER_ERROR:
      return "Ошибка на сервере. Попробуйте позже.";
    case ErrorType.RATE_LIMIT:
      return "Превышен лимит запросов. Пожалуйста, подождите немного.";
    case ErrorType.TIMEOUT:
      return "Превышено время ожидания ответа. Попробуйте еще раз.";
    default:
      return "Произошла неизвестная ошибка. Попробуйте позже.";
  }
}

/**
 * Получает иконку для типа ошибки (для использования с lucide-react)
 */
export function getErrorIcon(type: ErrorType): string {
  switch (type) {
    case ErrorType.NETWORK_ERROR:
      return "WifiOff";
    case ErrorType.VALIDATION_ERROR:
      return "AlertCircle";
    case ErrorType.AUTHENTICATION_ERROR:
      return "Lock";
    case ErrorType.AUTHORIZATION_ERROR:
      return "ShieldAlert";
    case ErrorType.NOT_FOUND:
      return "SearchX";
    case ErrorType.SERVER_ERROR:
      return "ServerCrash";
    case ErrorType.RATE_LIMIT:
      return "Timer";
    case ErrorType.TIMEOUT:
      return "Clock";
    default:
      return "AlertTriangle";
  }
}

/**
 * Получает цвет для типа ошибки
 */
export function getErrorColor(type: ErrorType): string {
  switch (type) {
    case ErrorType.NETWORK_ERROR:
      return "text-orange-500";
    case ErrorType.VALIDATION_ERROR:
      return "text-yellow-500";
    case ErrorType.AUTHENTICATION_ERROR:
    case ErrorType.AUTHORIZATION_ERROR:
      return "text-purple-500";
    case ErrorType.NOT_FOUND:
      return "text-blue-500";
    case ErrorType.SERVER_ERROR:
      return "text-red-500";
    case ErrorType.RATE_LIMIT:
    case ErrorType.TIMEOUT:
      return "text-amber-500";
    default:
      return "text-red-500";
  }
}

/**
 * Wrapper для fetch с автоматической обработкой ошибок
 */
export async function fetchWithErrorHandling<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit,
  config: ErrorConfig = {}
): Promise<T> {
  const {
    showToast = false,
    logToConsole = true,
    throwError = true,
  } = config;

  try {
    const response = await fetch(input, init);

    if (!response.ok) {
      const error = await parseResponseError(response);

      if (logToConsole) {
        console.error("API Error:", error);
      }

      if (throwError) {
        throw error;
      }

      return Promise.reject(error);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    return (await response.text()) as unknown as T;
  } catch (error) {
    const apiError = await parseApiError(error);

    if (logToConsole) {
      console.error("Fetch Error:", apiError);
    }

    if (throwError) {
      throw apiError;
    }

    return Promise.reject(apiError);
  }
}

/**
 * Функция для повторной попытки запроса с экспоненциальной задержкой
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const apiError = await parseApiError(error);

      // Не повторяем, если ошибка не retryable
      if (!apiError.retryable) {
        throw apiError;
      }

      // Если это последняя попытка, выбрасываем ошибку
      if (i === maxRetries - 1) {
        throw apiError;
      }

      // Экспоненциальная задержка с jitter
      const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
