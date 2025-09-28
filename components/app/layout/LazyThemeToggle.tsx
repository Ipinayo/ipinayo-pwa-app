"use client";

import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

const LazyThemeToggle = dynamic(() => import("./ThemeToggle"), {
  ssr: false,
  loading: () => <Skeleton className="mb-2 h-10 w-full justify-start py-2" />,
});

export default LazyThemeToggle;
