export default function HeaderSkeleton() {
  return (
    <div className="bg-background sticky top-0 z-40 w-full border-b">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Mobile menu button skeleton (visible on small screens) */}
        <div className="mr-2 md:hidden">
          <div className="h-10 w-10 rounded-full bg-muted/60 animate-pulse" />
        </div>

        {/* Logo skeleton */}
        <div className="flex items-center">
          <div className="h-11 w-28 rounded bg-muted/60 animate-pulse" />
        </div>

        {/* Right side: username + avatar skeleton */}
        <div className="ml-auto flex items-center space-x-4">
          <div className="flex items-center gap-2">
            <div className="hidden md:inline-block">
              <div className="h-4 w-20 rounded bg-muted/60 animate-pulse" />
            </div>
            <div className="relative h-10 w-10 rounded-full bg-muted/60 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
