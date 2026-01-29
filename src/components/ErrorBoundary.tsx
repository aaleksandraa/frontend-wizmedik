import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import * as Sentry from '@sentry/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console (ALWAYS, even in production for debugging)
    console.error('❌ ERROR CAUGHT BY BOUNDARY:', error);
    console.error('📍 Component Stack:', errorInfo.componentStack);
    console.error('📝 Error Message:', error.message);
    console.error('🔍 Error Stack:', error.stack);
    
    // Send to Sentry
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
      },
    });
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <CardTitle className="text-2xl">Nešto je pošlo po zlu</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Izvinjavamo se, došlo je do neočekivane greške. Naš tim je obaviješten i radi na rješenju problema.
              </p>

              {/* Show error details in production for debugging */}
              {this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <p className="font-mono text-sm text-red-800 mb-2">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-red-700 font-semibold">
                        Stack Trace
                      </summary>
                      <pre className="mt-2 text-xs overflow-auto max-h-64 text-red-700">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button onClick={this.handleReset} className="flex-1">
                  Vrati se na početnu
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Osvježi stranicu
                </Button>
              </div>

              <p className="text-sm text-gray-500 text-center mt-4">
                Ako problem i dalje postoji, kontaktirajte našu podršku na{' '}
                <a href="mailto:podrska@wizmedik.com" className="text-primary hover:underline">
                  podrska@wizmedik.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
