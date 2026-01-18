"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ErrorDisplay,
  InlineError,
  FullPageError,
} from "@/components/error-display";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  ApiError,
  ErrorType,
  fetchWithErrorHandling,
  retryWithBackoff,
} from "@/lib/errors";
import { useErrorHandler, useAsyncAction, useRetry } from "@/hooks/use-error-handler";
import { RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * Демо-страница для демонстрации различных типов ошибок
 */
export default function ErrorsDemoPage() {
  const [selectedError, setSelectedError] = useState<ApiError | null>(null);
  const [showFullPageError, setShowFullPageError] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();
  const { loading, execute } = useAsyncAction();
  const { retry, retrying, retryCount } = useRetry();

  // Примеры различных типов ошибок
  const errorExamples: ApiError[] = [
    {
      type: ErrorType.NETWORK_ERROR,
      message: "Не удалось подключиться к серверу",
      retryable: true,
      timestamp: new Date().toISOString(),
    },
    {
      type: ErrorType.VALIDATION_ERROR,
      message: "Данные формы содержат ошибки",
      statusCode: 400,
      details: [
        { field: "email", message: "Неверный формат email", code: "INVALID_EMAIL" },
        { field: "password", message: "Пароль должен содержать минимум 8 символов", code: "PASSWORD_TOO_SHORT" },
      ],
      retryable: false,
    },
    {
      type: ErrorType.AUTHENTICATION_ERROR,
      message: "Сессия истекла. Пожалуйста, войдите снова",
      statusCode: 401,
      retryable: false,
    },
    {
      type: ErrorType.AUTHORIZATION_ERROR,
      message: "У вас нет доступа к этому ресурсу",
      statusCode: 403,
      requestId: "req_abc123xyz",
      retryable: false,
    },
    {
      type: ErrorType.NOT_FOUND,
      message: "Товар с ID 12345 не найден",
      statusCode: 404,
      retryable: false,
    },
    {
      type: ErrorType.SERVER_ERROR,
      message: "Внутренняя ошибка сервера",
      statusCode: 500,
      requestId: "req_def456uvw",
      retryable: true,
    },
    {
      type: ErrorType.RATE_LIMIT,
      message: "Превышен лимит запросов. Попробуйте через 60 секунд",
      statusCode: 429,
      retryable: true,
    },
    {
      type: ErrorType.TIMEOUT,
      message: "Время ожидания ответа истекло",
      retryable: true,
    },
  ];

  // Симуляция API запроса с ошибкой
  const simulateApiError = async (errorType: ErrorType) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const error = errorExamples.find((e) => e.type === errorType);
    if (error) {
      throw error;
    }
  };

  // Симуляция успешного запроса после retry
  const simulateSuccessAfterRetry = async () => {
    const random = Math.random();
    if (random < 0.7) {
      // 70% вероятность ошибки
      throw {
        type: ErrorType.NETWORK_ERROR,
        message: "Временная проблема с сетью",
        retryable: true,
      };
    }
    return { success: true, data: "Запрос успешно выполнен!" };
  };

  // Тестирование useAsyncAction
  const testAsyncAction = async (errorType: ErrorType) => {
    await execute(() => simulateApiError(errorType));
  };

  // Тестирование retry логики
  const testRetry = async () => {
    try {
      const result = await retry(() => simulateSuccessAfterRetry(), 5, 500);
      if (result) {
        toast.success("Успешно!", {
          description: result.data,
        });
      }
    } catch (err) {
      handleError(err);
    }
  };

  // Тестирование fetchWithErrorHandling
  const testFetchWithErrorHandling = async () => {
    try {
      await fetchWithErrorHandling("https://httpstat.us/500?sleep=1000");
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Шапка */}
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Назад
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-foreground">
                Демонстрация обработки ошибок
              </h1>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {showFullPageError ? (
            <FullPageError
              error={
                errorExamples.find((e) => e.type === ErrorType.SERVER_ERROR)!
              }
              onRetry={() => setShowFullPageError(false)}
            />
          ) : (
            <div className="space-y-8">
              {/* Введение */}
              <Card>
                <CardHeader>
                  <CardTitle>О демонстрации</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Эта страница демонстрирует комплексную систему обработки
                    ошибок, которая может прийти с бэкенда.
                  </p>
                  <p>
                    Система включает:
                  </p>
                  <ul className="list-inside list-disc space-y-1 pl-4">
                    <li>8 типов ошибок с соответствующими иконками и цветами</li>
                    <li>Автоматический парсинг ошибок с бэкенда</li>
                    <li>Retry логику для временных ошибок</li>
                    <li>Различные варианты отображения (полноэкранный, карточка, inline)</li>
                    <li>React хуки для удобной работы с ошибками</li>
                    <li>Error Boundary для перехвата React ошибок</li>
                    <li>Интеграция с toast уведомлениями</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Типы ошибок */}
              <Card>
                <CardHeader>
                  <CardTitle>Типы ошибок</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {errorExamples.map((err, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-auto flex-col gap-2 p-4"
                        onClick={() => setSelectedError(err)}
                      >
                        <Badge variant={err.retryable ? "default" : "secondary"}>
                          {err.type}
                        </Badge>
                        <span className="text-xs text-center line-clamp-2">
                          {err.message}
                        </span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Отображение выбранной ошибки */}
              {selectedError && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Детали ошибки</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedError(null)}
                    >
                      Закрыть
                    </Button>
                  </div>

                  {/* Полный вариант */}
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                      Полный вариант (ErrorDisplay)
                    </h3>
                    <ErrorDisplay
                      error={selectedError}
                      onRetry={
                        selectedError.retryable
                          ? () => toast.success("Повторяем запрос...")
                          : undefined
                      }
                      onDismiss={() => setSelectedError(null)}
                    />
                  </div>

                  {/* Компактный вариант */}
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                      Компактный вариант
                    </h3>
                    <ErrorDisplay
                      error={selectedError}
                      compact
                      onRetry={
                        selectedError.retryable
                          ? () => toast.success("Повторяем запрос...")
                          : undefined
                      }
                      onDismiss={() => setSelectedError(null)}
                    />
                  </div>

                  {/* Inline вариант */}
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                      Inline вариант (InlineError)
                    </h3>
                    <InlineError error={selectedError} />
                  </div>
                </div>
              )}

              {/* Тестирование хуков */}
              <Card>
                <CardHeader>
                  <CardTitle>Тестирование React хуков</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* useAsyncAction */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">useAsyncAction</h3>
                    <p className="text-xs text-muted-foreground">
                      Автоматическая обработка загрузки, данных и ошибок
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => testAsyncAction(ErrorType.VALIDATION_ERROR)}
                        disabled={loading}
                        size="sm"
                      >
                        {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                        Валидационная ошибка
                      </Button>
                      <Button
                        onClick={() => testAsyncAction(ErrorType.SERVER_ERROR)}
                        disabled={loading}
                        variant="secondary"
                        size="sm"
                      >
                        {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                        Серверная ошибка
                      </Button>
                    </div>
                    {error && (
                      <ErrorDisplay
                        error={error}
                        compact
                        onRetry={error.retryable ? () => clearError() : undefined}
                        onDismiss={clearError}
                      />
                    )}
                  </div>

                  {/* useRetry */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">useRetry</h3>
                    <p className="text-xs text-muted-foreground">
                      Автоматический retry с экспоненциальной задержкой (70%
                      вероятность ошибки, макс 5 попыток)
                    </p>
                    <Button onClick={testRetry} disabled={retrying} size="sm">
                      {retrying ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Попытка {retryCount} из 5...
                        </>
                      ) : (
                        "Тестировать retry"
                      )}
                    </Button>
                  </div>

                  {/* fetchWithErrorHandling */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">fetchWithErrorHandling</h3>
                    <p className="text-xs text-muted-foreground">
                      Обертка над fetch с автоматическим парсингом ошибок
                    </p>
                    <Button
                      onClick={testFetchWithErrorHandling}
                      variant="outline"
                      size="sm"
                    >
                      Запрос к httpstat.us/500
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Полноэкранная ошибка */}
              <Card>
                <CardHeader>
                  <CardTitle>Полноэкранное отображение</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Используется для критических ошибок, когда контент страницы
                    недоступен
                  </p>
                  <Button onClick={() => setShowFullPageError(true)}>
                    Показать полноэкранную ошибку
                  </Button>
                </CardContent>
              </Card>

              {/* JSON примеры */}
              <Card>
                <CardHeader>
                  <CardTitle>Примеры ответов с бэкенда</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="mb-2 text-sm font-medium">
                      Валидационная ошибка
                    </h3>
                    <pre className="overflow-auto rounded-lg bg-muted p-3 text-xs">
{`{
  "statusCode": 400,
  "message": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format",
      "code": "INVALID_EMAIL"
    },
    {
      "field": "password",
      "message": "Password too short",
      "code": "PASSWORD_TOO_SHORT"
    }
  ]
}`}
                    </pre>
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-medium">
                      Серверная ошибка с requestId
                    </h3>
                    <pre className="overflow-auto rounded-lg bg-muted p-3 text-xs">
{`{
  "statusCode": 500,
  "message": "Internal server error",
  "requestId": "req_abc123xyz",
  "timestamp": "2026-01-18T10:30:00Z"
}`}
                    </pre>
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-medium">
                      Rate limit ошибка
                    </h3>
                    <pre className="overflow-auto rounded-lg bg-muted p-3 text-xs">
{`{
  "statusCode": 429,
  "message": "Rate limit exceeded",
  "retryAfter": 60
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
