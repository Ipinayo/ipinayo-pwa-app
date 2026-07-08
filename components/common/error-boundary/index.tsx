"use client";

import { Component, type ReactNode } from "react";

/** Minimal client error boundary — renders `fallback` if its subtree throws
 *  (including errors surfaced from streamed async server components). */
export class ErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("ErrorBoundary caught:", error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
