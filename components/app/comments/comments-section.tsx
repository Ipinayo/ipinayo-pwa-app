import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { AccessPerson } from "@/lib/collaboration-utils";
import type { CommentEntity } from "@/types/schemas/comment";
import { CommentsPanel } from "./comments-panel";
import { MessageSquare } from "lucide-react";
import { getComments } from "@/lib/actions/comments";

/** Async server wrapper so the comments query can stream inside a Suspense
 *  boundary instead of blocking the whole page's initial render. */
export async function CommentsSection({
  entity,
  entityId,
  viewerId,
  canComment,
  canModerate,
  mentionables,
}: Readonly<{
  entity: CommentEntity;
  entityId: string;
  viewerId: string;
  canComment: boolean;
  canModerate: boolean;
  mentionables: AccessPerson[];
}>) {
  const initialComments = await getComments(entity, entityId);

  return (
    <CommentsPanel
      entity={entity}
      entityId={entityId}
      viewerId={viewerId}
      canComment={canComment}
      canModerate={canModerate}
      mentionables={mentionables}
      initialComments={initialComments}
    />
  );
}

/** Fallback shown while comments stream in. */
export function CommentsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="size-4" /> Comments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-muted h-20 animate-pulse rounded-md" />
        <div className="bg-muted h-12 animate-pulse rounded-md" />
      </CardContent>
    </Card>
  );
}

/** Fallback shown if the comments query errors — the rest of the page is fine. */
export function CommentsError() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="size-4" /> Comments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Couldn’t load comments. Refresh to try again.
        </p>
      </CardContent>
    </Card>
  );
}
