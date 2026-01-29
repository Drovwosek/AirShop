"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { ApiError, parseApiError, getErrorMessage } from "../lib";

/**
 * Хук для управления ошибками в компонентах
 */
export function useErrorHandler() {
  const [error, setError] = useState<ApiError | null>(null);
  const [isError, setIsError] = useState(false);

  /**
   * Обрабатывает ошибку и показывает toast уведомление
   */
  const handleError = useCallback(async (err: unknown) => {
    const apiError = await parseApiError(err);
    setError(apiError);
    setIsError(true);

    // Показываем toast с ошибкой
    const message = getErrorMessage(apiError);
    toast.error(message, {
      description: apiError.statusCode
        ? `Код ошибки: ${apiError.statusCode}`
        : undefined,
      duration: 5000,
    });

    return apiError;
  }, []);

  /**
   * Очищает ошибку
   */
  const clearError = useCallback(() => {
    setError(null);
    setIsError(false);
  }, []);

  /**
   * Wrapper для async функций с автоматической обработкой ошибок
   */
  const withErrorHandling = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T | null> => {
      clearError();
      try {
        return await fn();
      } catch (err) {
        await handleError(err);
        return null;
      }
    },
    [handleError, clearError]
  );

  return {
    error,
    isError,
    handleError,
    clearError,
    withErrorHandling,
  };
}

/**
 * Хук для управления состоянием загрузки с обработкой ошибок
 */
export function useAsyncAction<T = any>() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const { error, isError, handleError, clearError } = useErrorHandler();

  /**
   * Выполняет async действие с автоматической обработкой состояния загрузки и ошибок
   */
  const execute = useCallback(
    async (fn: () => Promise<T>): Promise<T | null> => {
      setLoading(true);
      clearError();
      try {
        const result = await fn();
        setData(result);
        return result;
      } catch (err) {
        await handleError(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [handleError, clearError]
  );

  /**
   * Сбрасывает все состояния
   */
  const reset = useCallback(() => {
    setLoading(false);
    setData(null);
    clearError();
  }, [clearError]);

  return {
    loading,
    data,
    error,
    isError,
    execute,
    reset,
  };
}

/**
 * Хук для retry логики с экспоненциальной задержкой
 */
export function useRetry() {
  const [retrying, setRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(
    async <T,>(
      fn: () => Promise<T>,
      maxRetries: number = 3,
      baseDelay: number = 1000
    ): Promise<T | null> => {
      setRetrying(true);
      setRetryCount(0);

      for (let i = 0; i < maxRetries; i++) {
        try {
          setRetryCount(i + 1);
          const result = await fn();
          setRetrying(false);
          setRetryCount(0);
          return result;
        } catch (error) {
          const apiError = await parseApiError(error);

          // Если ошибка не retryable, прекращаем попытки
          if (!apiError.retryable) {
            setRetrying(false);
            throw apiError;
          }

          // Если это последняя попытка, выбрасываем ошибку
          if (i === maxRetries - 1) {
            setRetrying(false);
            throw apiError;
          }

          // Экспоненциальная задержка с jitter
          const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      setRetrying(false);
      return null;
    },
    []
  );

  return {
    retry,
    retrying,
    retryCount,
  };
}
