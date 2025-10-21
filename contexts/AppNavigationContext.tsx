"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

interface NavigationEntry {
  path: string;
  timestamp: number;
}

interface AppNavigationContextType {
  canGoBack: boolean;
  canGoForward: boolean;
  handleBack: () => void;
  handleForward: () => void;
  handleRefresh: () => void;
  navigateTo: (path: string) => void;
  currentPath: string;
  history: NavigationEntry[];
}

const AppNavigationContext = createContext<
  AppNavigationContextType | undefined
>(undefined);

export function AppNavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [history, setHistory] = useState<NavigationEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const isNavigatingRef = useRef(false);

  // Initialize history on mount
  useEffect(() => {
    if (history.length === 0) {
      setHistory([{ path: pathname, timestamp: Date.now() }]);
      setCurrentIndex(0);
    }
  }, []); // Only run once on mount

  // Track navigation
  useEffect(() => {
    if (history.length === 0) return;

    // Skip if we're navigating via back/forward buttons
    if (isNavigatingRef.current) {
      isNavigatingRef.current = false;
      return;
    }

    const currentEntry = history[currentIndex];

    // Skip if pathname hasn't actually changed
    if (currentEntry?.path === pathname) {
      return;
    }

    setHistory((prev) => {
      // If we're in the middle of history and navigating to a new page,
      // remove forward history
      if (currentIndex < prev.length - 1) {
        const newHistory = prev.slice(0, currentIndex + 1);
        // Avoid duplicate consecutive entries
        if (newHistory[newHistory.length - 1]?.path !== pathname) {
          return [...newHistory, { path: pathname, timestamp: Date.now() }];
        }
        return newHistory;
      }

      // If we're at the end of history, add new entry
      if (currentIndex === prev.length - 1) {
        // Avoid duplicate consecutive entries
        if (prev[prev.length - 1]?.path !== pathname) {
          return [...prev, { path: pathname, timestamp: Date.now() }];
        }
      }
      return prev;
    });

    // Update current index when pathname changes
    setCurrentIndex((prev) => {
      const lastEntry = history[history.length - 1];
      if (lastEntry?.path !== pathname) {
        return prev + 1;
      }
      return prev;
    });
  }, [pathname]); // Only depend on pathname

  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < history.length - 1;

  const handleBack = () => {
    if (canGoBack) {
      isNavigatingRef.current = true;
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      router.push(history[newIndex].path);
    }
  };

  const handleForward = () => {
    if (canGoForward) {
      isNavigatingRef.current = true;
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      router.push(history[newIndex].path);
    }
  };

  const handleRefresh = () => {
    router.refresh();
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const value: AppNavigationContextType = {
    canGoBack,
    canGoForward,
    handleBack,
    handleForward,
    handleRefresh,
    navigateTo,
    currentPath: pathname,
    history,
  };

  return (
    <AppNavigationContext.Provider value={value}>
      {children}
    </AppNavigationContext.Provider>
  );
}

// Custom hook to use the navigation context
export function useAppNavigation() {
  const context = useContext(AppNavigationContext);
  if (context === undefined) {
    throw new Error(
      "useAppNavigation must be used within an AppNavigationProvider"
    );
  }
  return context;
}

// Export the context for advanced usage
export { AppNavigationContext };
