"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary компонент для перехвата React ошибок
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
          <div className="max-w-md text-center">
            <div className="mb-6 inline-flex rounded-full bg-destructive/10 p-6">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">
              Что-то пошло не так
            </h1>
            <p className="mb-6 text-muted-foreground">
              Произошла непредвиденная ошибка. Мы уже работаем над её
              исправлением.
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mb-6 rounded-lg bg-muted p-4 text-left">
                <p className="mb-2 text-sm font-medium text-foreground">
                  Детали ошибки:
                </p>
                <pre className="overflow-auto text-xs text-muted-foreground">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={this.handleReset} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Попробовать снова
              </Button>
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                На главную
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
