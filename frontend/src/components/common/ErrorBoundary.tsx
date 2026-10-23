'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

/**
 * ErrorBoundary Component
 * Purpose: Catches rendering runtime errors in isolated blocks to prevent the entire invitation from crashing.
 * Props:
 *   - children: ReactNode to wrap
 *   - fallback: Optional custom fallback node
 * Key States:
 *   - hasError: boolean indicating if a child component threw an unhandled error
 */
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-4 my-2 text-center border border-dashed border-rose-300 rounded-lg bg-rose-50 text-rose-700 text-sm">
          {/* Error Message Section */}
          <p className="font-medium">Không thể hiển thị phần nội dung này</p>
        </div>
      );
    }

    return (
      <React.Fragment>
        {/* Child Content Section */}
        {this.props.children}
      </React.Fragment>
    );
  }
}
