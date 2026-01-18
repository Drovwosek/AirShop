/**
 * Дополнительные утилиты для работы с ошибками
 */

import { ApiError, ErrorType, parseApiError } from "@/lib/errors";
import {
  ValidationError,
  ServerError,
  AuthError,
  ErrorLog,
  ErrorContext,
  isValidationError,
  isServerError,
  isAuthError,
} from "@/types/errors";

/**
 * Логирование ошибок (можно интегрировать с Sentry, LogRocket и т.д.)
 */
export class ErrorLogger {
  private static logs: ErrorLog[] = [];
  private static maxLogs = 100;

  /**
   * Логирует ошибку
   */
  static log(error: ApiError, context?: ErrorContext): void {
    const log: ErrorLog = {
      error,
      context: context || {},
      timestamp: new Date(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    };

    this.logs.push(log);

    // Ограничиваем количество логов в памяти
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // В production отправлять в систему мониторинга
    if (process.env.NODE_ENV === "production") {
      this.sendToMonitoring(log);
    } else {
      console.error("Error logged:", log);
    }
  }

  /**
   * Получает все логи
   */
  static getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  /**
   * Получает логи по типу ошибки
   */
  static getLogsByType(type: ErrorType): ErrorLog[] {
    return this.logs.filter((log) => log.error.type === type);
  }

  /**
   * Очищает логи
   */
  static clearLogs(): void {
    this.logs = [];
  }

  /**
   * Отправляет лог в систему мониторинга
   */
  private static sendToMonitoring(log: ErrorLog): void {
    // Здесь можно интегрировать с Sentry, LogRocket, DataDog и т.д.
    // Пример для Sentry:
    // Sentry.captureException(log.error, {
    //   contexts: { custom: log.context },
    //   tags: { errorType: log.error.type },
    // });
    
    console.info("Sending to monitoring system:", log);
  }

  /**
   * Экспортирует логи в JSON
   */
  static exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

/**
 * Помощник для работы с валидационными ошибками
 */
export class ValidationErrorHelper {
  /**
   * Извлекает ошибки для конкретного поля
   */
  static getFieldErrors(
    error: ApiError,
    fieldName: string
  ): string[] {
    if (!isValidationError(error)) {
      return [];
    }

    return error.details
      .filter((detail) => detail.field === fieldName)
      .map((detail) => detail.message);
  }

  /**
   * Проверяет, есть ли ошибка для поля
   */
  static hasFieldError(error: ApiError, fieldName: string): boolean {
    return this.getFieldErrors(error, fieldName).length > 0;
  }

  /**
   * Получает все поля с ошибками
   */
  static getErrorFields(error: ApiError): string[] {
    if (!isValidationError(error)) {
      return [];
    }

    return [...new Set(error.details.map((detail) => detail.field))];
  }

  /**
   * Преобразует в объект для использования с react-hook-form
   */
  static toFormErrors(error: ApiError): Record<string, string> {
    if (!isValidationError(error)) {
      return {};
    }

    const formErrors: Record<string, string> = {};
    
    error.details.forEach((detail) => {
      if (!formErrors[detail.field]) {
        formErrors[detail.field] = detail.message;
      }
    });

    return formErrors;
  }
}

/**
 * Помощник для работы с retry логикой
 */
export class RetryHelper {
  /**
   * Вычисляет задержку с экспоненциальным backoff
   */
  static calculateDelay(
    attempt: number,
    baseDelay: number = 1000,
    maxDelay: number = 30000
  ): number {
    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 1000; // Добавляем случайность
    return Math.min(exponentialDelay + jitter, maxDelay);
  }

  /**
   * Проверяет, стоит ли повторять запрос
   */
  static shouldRetry(
    error: ApiError,
    attempt: number,
    maxAttempts: number
  ): boolean {
    // Превышен лимит попыток
    if (attempt >= maxAttempts) {
      return false;
    }

    // Ошибка не retryable
    if (!error.retryable) {
      return false;
    }

    // Не повторяем клиентские ошибки (4xx кроме 429)
    if (
      error.statusCode &&
      error.statusCode >= 400 &&
      error.statusCode < 500 &&
      error.statusCode !== 429
    ) {
      return false;
    }

    return true;
  }

  /**
   * Создает retry функцию с настраиваемыми параметрами
   */
  static createRetryFunction<T>(
    fn: () => Promise<T>,
    options: {
      maxRetries?: number;
      baseDelay?: number;
      maxDelay?: number;
      onRetry?: (attempt: number, error: ApiError) => void;
    } = {}
  ): () => Promise<T> {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 30000,
      onRetry,
    } = options;

    return async () => {
      let lastError: ApiError | null = null;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          return await fn();
        } catch (error) {
          lastError = await parseApiError(error);

          if (!this.shouldRetry(lastError, attempt, maxRetries)) {
            throw lastError;
          }

          if (onRetry) {
            onRetry(attempt + 1, lastError);
          }

          const delay = this.calculateDelay(attempt, baseDelay, maxDelay);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      throw lastError;
    };
  }
}

/**
 * Помощник для группировки и анализа ошибок
 */
export class ErrorAnalyzer {
  /**
   * Группирует ошибки по типу
   */
  static groupByType(errors: ApiError[]): Map<ErrorType, ApiError[]> {
    const grouped = new Map<ErrorType, ApiError[]>();

    errors.forEach((error) => {
      const existing = grouped.get(error.type) || [];
      grouped.set(error.type, [...existing, error]);
    });

    return grouped;
  }

  /**
   * Подсчитывает частоту ошибок
   */
  static getErrorFrequency(errors: ApiError[]): Map<ErrorType, number> {
    const frequency = new Map<ErrorType, number>();

    errors.forEach((error) => {
      const count = frequency.get(error.type) || 0;
      frequency.set(error.type, count + 1);
    });

    return frequency;
  }

  /**
   * Находит наиболее частую ошибку
   */
  static getMostFrequentError(errors: ApiError[]): ErrorType | null {
    if (errors.length === 0) return null;

    const frequency = this.getErrorFrequency(errors);
    let maxCount = 0;
    let mostFrequent: ErrorType | null = null;

    frequency.forEach((count, type) => {
      if (count > maxCount) {
        maxCount = count;
        mostFrequent = type;
      }
    });

    return mostFrequent;
  }

  /**
   * Проверяет, есть ли критичные ошибки
   */
  static hasCriticalErrors(errors: ApiError[]): boolean {
    const criticalTypes = [
      ErrorType.SERVER_ERROR,
      ErrorType.AUTHENTICATION_ERROR,
      ErrorType.AUTHORIZATION_ERROR,
    ];

    return errors.some((error) => criticalTypes.includes(error.type));
  }

  /**
   * Фильтрует только retryable ошибки
   */
  static getRetryableErrors(errors: ApiError[]): ApiError[] {
    return errors.filter((error) => error.retryable);
  }
}

/**
 * Помощник для форматирования ошибок
 */
export class ErrorFormatter {
  /**
   * Форматирует ошибку для отображения пользователю
   */
  static formatForUser(error: ApiError): string {
    if (isValidationError(error)) {
      const fields = error.details.map((d) => d.field).join(", ");
      return `Проверьте правильность заполнения: ${fields}`;
    }

    if (isServerError(error) && error.requestId) {
      return `${error.message} (ID: ${error.requestId})`;
    }

    return error.message;
  }

  /**
   * Форматирует ошибку для логов
   */
  static formatForLog(error: ApiError): string {
    const parts = [
      `[${error.type}]`,
      error.statusCode ? `${error.statusCode}` : "",
      error.message,
      error.requestId ? `(${error.requestId})` : "",
    ];

    return parts.filter(Boolean).join(" ");
  }

  /**
   * Форматирует ошибку в JSON для API
   */
  static toJSON(error: ApiError): string {
    return JSON.stringify(
      {
        type: error.type,
        message: error.message,
        statusCode: error.statusCode,
        details: error.details,
        requestId: error.requestId,
        timestamp: error.timestamp,
      },
      null,
      2
    );
  }
}

/**
 * Помощник для создания кастомных ошибок
 */
export class ErrorFactory {
  /**
   * Создает ошибку валидации
   */
  static createValidationError(
    message: string,
    details: Array<{ field: string; message: string; code?: string }>
  ): ValidationError {
    return {
      type: ErrorType.VALIDATION_ERROR,
      message,
      statusCode: 400,
      details: details.map((d) => ({
        field: d.field,
        message: d.message,
        code: d.code || "VALIDATION_ERROR",
      })),
      retryable: false,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Создает серверную ошибку
   */
  static createServerError(
    message: string,
    requestId?: string
  ): ServerError {
    return {
      type: ErrorType.SERVER_ERROR,
      message,
      statusCode: 500,
      requestId,
      timestamp: new Date().toISOString(),
      retryable: true,
    };
  }

  /**
   * Создает ошибку авторизации
   */
  static createAuthError(
    message: string,
    type: ErrorType.AUTHENTICATION_ERROR | ErrorType.AUTHORIZATION_ERROR,
    redirectUrl?: string
  ): AuthError {
    return {
      type,
      message,
      statusCode: type === ErrorType.AUTHENTICATION_ERROR ? 401 : 403,
      redirectUrl,
      retryable: false,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Создает сетевую ошибку
   */
  static createNetworkError(message?: string): ApiError {
    return {
      type: ErrorType.NETWORK_ERROR,
      message: message || "Не удалось подключиться к серверу",
      retryable: true,
      timestamp: new Date().toISOString(),
    };
  }
}

export {};
