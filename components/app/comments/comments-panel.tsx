"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createComment, getComments } from "@/lib/actions/comments";
import { useState, useTransition } from "react";

import { AccessPerson } from "@/lib/collaboration-utils";
import { CommentComposer } from "./comment-composer";
import type { CommentEntity } from "@/types/schemas/comment";
import { CommentItem } from "./comment-item";
import type { CommentView } from "@/types/models";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { withToast } from "@/lib/with-toast";

/** Count non-deleted comments across threads for the header badge. */
function liveCount(comments: CommentView[]) {
  return comments.reduce(
    (n, c) =>
      n + (c.deleted ? 0 : 1) + c.replies.filter((r) => !r.deleted).length,
    0,
  );
}

/** Internal comments for a selection/draft: composer + threaded list. Shown only
 *  to collaborators (the page gates on access before rendering this). */
export function CommentsPanel({
  entity,
  entityId,
  viewerId,
  canComment,
  canModerate,
  mentionables,
  initialComments,
}: Readonly<{
  entity: CommentEntity;
  entityId: string;
  viewerId: string;
  canComment: boolean;
  canModerate: boolean;
  mentionables: AccessPerson[];
  initialComments: CommentView[];
}>) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [pending, startTransition] = useTransition();

  const refresh = async () => {
    await getComments(entity, entityId)
      .then(setComments)
      .catch(() => {});
    router.refresh();
  };

  const post = (body: string, mentionedIds: string[]) =>
    startTransition(async () => {
      const { error } = await withToast(
        () =>
          createComment({
            entity,
            entityId,
            body,
            mentionedUserIds: mentionedIds,
          }),
        { success: "Comment posted." },
      );
      if (!error) refresh();
    });

  const count = liveCount(comments);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="size-4" />
          Comments{count > 0 ? ` (${count})` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {canComment && (
          <CommentComposer
            mentionables={mentionables}
            pending={pending}
            onSubmit={post}
          />
        )}

        {comments.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No comments yet.
            {canComment ? " Start the discussion with your team." : ""}
          </p>
        ) : (
          <div className="divide-border divide-y">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                entity={entity}
                entityId={entityId}
                viewerId={viewerId}
                canComment={canComment}
                canModerate={canModerate}
                mentionables={mentionables}
                onChanged={refresh}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
