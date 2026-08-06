import React, { Component, ReactNode } from "react";
import { ErrorExperience } from "./ErrorExperience";
import { reportLovableError } from "@/lib/lovable-error-reporting";

interface ReactErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ReactErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ReactErrorBoundary extends Component<
  ReactErrorBoundaryProps,
  ReactErrorBoundaryState
> {
  constructor(props: ReactErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ReactErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ReactErrorBoundary Caught Exception]:", error, errorInfo);
    reportLovableError(error, {
      boundary: "react_error_boundary",
      componentStack: errorInfo.componentStack,
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <ErrorExperience type="auto" error={this.state.error} reset={this.resetError} />;
    }

    return this.props.children;
  }
}
