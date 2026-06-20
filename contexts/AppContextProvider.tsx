"use client";

import { AppNavigationProvider } from "./AppNavigationContext";
import { PushPromptProvider } from "./PushPromptContext";

export default function AppContextProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppNavigationProvider>
      <PushPromptProvider>{children}</PushPromptProvider>
    </AppNavigationProvider>
  );
}
