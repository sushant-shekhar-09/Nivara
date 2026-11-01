import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home, PhoneCall } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled Application Error:', error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h1 className="font-serif font-bold text-2xl text-slate-900 dark:text-white">
                Something went wrong
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                An unexpected interface error occurred. Your responses have not been compromised.
                If you are in distress, crisis support is always available directly.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="primary"
                leftIcon={<RotateCcw className="w-4 h-4" />}
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
              <a href="/crisis" className="w-full">
                <Button variant="crisis" className="w-full" leftIcon={<PhoneCall className="w-4 h-4" />}>
                  Immediate Crisis Helpline (24/7)
                </Button>
              </a>
              <Button
                variant="ghost"
                leftIcon={<Home className="w-4 h-4" />}
                onClick={() => (window.location.href = '/')}
              >
                Back to Homepage
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
