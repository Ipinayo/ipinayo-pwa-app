"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface PushPromptContextType {
  // Incremented each time something asks the push prompt to (re)evaluate and
  // show itself, e.g. when the user clicks the notification bell.
  requestCount: number;
  requestPrompt: () => void;
}

const PushPromptContext = createContext<PushPromptContextType | undefined>(
  undefined,
);

export function PushPromptProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [requestCount, setRequestCount] = useState(0);
  const requestPrompt = useCallback(() => setRequestCount((c) => c + 1), []);

  const value: PushPromptContextType = useMemo(
    () => ({ requestCount, requestPrompt }),
    [requestCount, requestPrompt],
  );

  return (
    <PushPromptContext.Provider value={value}>
      {children}
    </PushPromptContext.Provider>
  );
}

// Custom hook to use the push-prompt context
export function usePushPrompt() {
  const context = useContext(PushPromptContext);
  if (context === undefined) {
    throw new Error("usePushPrompt must be used within a PushPromptProvider");
  }
  return context;
}

// Export the context for advanced usage
export { PushPromptContext };
