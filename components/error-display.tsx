"use client";

import { useState } from "react";
import {
  AlertTriangle,
  WifiOff,
  AlertCircle,
  Lock,
  ShieldAlert,
  SearchX,
  ServerCrash,
  Timer,
  Clock,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ApiError, ErrorType, getErrorMessage, getErrorColor } from "@/lib/errors";

interface ErrorDisplayProps {
  error: ApiError;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  compact?: boolean;
}

/**
 * Компонент для отображения ошибок API
 */
export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  className,
  compact = false,
}: ErrorDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);
  const Icon = getIconComponent(error.type);
  const colorClass = getErrorColor(error.type);
  const message = getErrorMessage(error);

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm",
          className
        )}
      >
        <Icon className={cn("h-5 w-5 flex-shrink-0", colorClass)} />
        <p className="flex-1 text-foreground">{message}</p>
        {error.retryable && onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-8 gap-1 text-xs"
          >
            <RefreshCw className="h-3 w-3" />
            Повторить
          </Button>
        )}
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("border-destructive/50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={cn("rounded-full bg-background p-2", colorClass)}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                {getErrorTitle(error.type)}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{message}</p>
            </div>
          </div>
          {onDismiss && (
            <Button variant="ghost" size="icon" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      {(error.details || error.statusCode || error.requestId) && (
        <CardContent className="pb-3">
          <div className="space-y-2">
            {error.statusCode && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">Код: {error.statusCode}</Badge>
                {error.retryable && (
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
                    Можно повторить
                  </Badge>
                )}
              </div>
            )}

            {error.details && error.details.length > 0 && (
              <div className="space-y-1">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
                >
                  {showDetails ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  Подробности ({error.details.length})
                </button>
                {showDetails && (
                  <div className="mt-2 space-y-2 rounded-md border border-border bg-muted/50 p-3">
                    {error.details.map((detail, index) => (
                      <div key={index} className="text-sm">
                        {detail.field && (
                          <span className="font-medium">{detail.field}: </span>
                        )}
                        <span className="text-muted-foreground">
                          {detail.message}
                        </span>
                        {detail.code && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {detail.code}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {error.requestId && (
              <div className="text-xs text-muted-foreground">
                ID запроса: <code className="rounded bg-muted px-1 py-0.5">{error.requestId}</code>
              </div>
            )}
          </div>
        </CardContent>
      )}

      {(error.retryable && onRetry) && (
        <CardFooter className="flex gap-2">
          {error.retryable && onRetry && (
            <Button onClick={onRetry} variant="default" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Повторить попытку
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

/**
 * Компонент для встроенного отображения ошибки (inline)
 */
export function InlineError({ error, className }: { error: ApiError; className?: string }) {
  const Icon = getIconComponent(error.type);
  const colorClass = getErrorColor(error.type);
  const message = getErrorMessage(error);

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <Icon className={cn("h-4 w-4 flex-shrink-0", colorClass)} />
      <span className="text-foreground">{message}</span>
    </div>
  );
}

/**
 * Компонент для отображения ошибки на всю страницу
 */
export function FullPageError({
  error,
  onRetry,
  className,
}: {
  error: ApiError;
  onRetry?: () => void;
  className?: string;
}) {
  const Icon = getIconComponent(error.type);
  const colorClass = getErrorColor(error.type);
  const message = getErrorMessage(error);

  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center p-8 text-center",
        className
      )}
    >
      <div className={cn("mb-4 rounded-full bg-muted p-6", colorClass)}>
        <Icon className="h-12 w-12" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-foreground">
        {getErrorTitle(error.type)}
      </h2>
      <p className="mb-6 max-w-md text-muted-foreground">{message}</p>
      {error.retryable && onRetry && (
        <Button onClick={onRetry} size="lg" className="gap-2">
          <RefreshCw className="h-5 w-5" />
          Повторить попытку
        </Button>
      )}
      {error.statusCode && (
        <div className="mt-4">
          <Badge variant="outline">Код ошибки: {error.statusCode}</Badge>
        </div>
      )}
    </div>
  );
}

/**
 * Получает компонент иконки по типу ошибки
 */
function getIconComponent(type: ErrorType) {
  switch (type) {
    case ErrorType.NETWORK_ERROR:
      return WifiOff;
    case ErrorType.VALIDATION_ERROR:
      return AlertCircle;
    case ErrorType.AUTHENTICATION_ERROR:
      return Lock;
    case ErrorType.AUTHORIZATION_ERROR:
      return ShieldAlert;
    case ErrorType.NOT_FOUND:
      return SearchX;
    case ErrorType.SERVER_ERROR:
      return ServerCrash;
    case ErrorType.RATE_LIMIT:
      return Timer;
    case ErrorType.TIMEOUT:
      return Clock;
    default:
      return AlertTriangle;
  }
}

/**
 * Получает заголовок для типа ошибки
 */
function getErrorTitle(type: ErrorType): string {
  switch (type) {
    case ErrorType.NETWORK_ERROR:
      return "Проблема с подключением";
    case ErrorType.VALIDATION_ERROR:
      return "Ошибка валидации";
    case ErrorType.AUTHENTICATION_ERROR:
      return "Требуется авторизация";
    case ErrorType.AUTHORIZATION_ERROR:
      return "Доступ запрещен";
    case ErrorType.NOT_FOUND:
      return "Не найдено";
    case ErrorType.SERVER_ERROR:
      return "Ошибка сервера";
    case ErrorType.RATE_LIMIT:
      return "Превышен лимит";
    case ErrorType.TIMEOUT:
      return "Время ожидания истекло";
    default:
      return "Произошла ошибка";
  }
}
