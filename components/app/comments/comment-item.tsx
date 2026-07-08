"use client";

import { CheckCircle2 } from "lucide-react";
import { CommentComposer, mentionLabel } from "./comment-composer";
import type { AccessPerson } from "@/lib/collaboration-utils";
import type { CommentEntity } from "@/types/schemas/comment";
import type { CommentView } from "@/types/models";
import {
  createComment,
  deleteComment,
  editComment,
  resolveComment,
} from "@/lib/actions/comments";
import { type ReactNode, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmPopover } from "@/components/common/confirm-popover";
import UserAvatar from "@/components/common/user-avatar";
import { cn, formatDate } from "@/lib/utils";
import { withToast } from "@/lib/with-toast";

const escapeRegExp = (s: string) =>
  s.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

/** Render body text with `@Name` mentions highlighted (longest labels first so
 *  a name that's a prefix of another doesn't win). */
function renderBody(body: string, mentionables: AccessPerson[]): ReactNode {
  const labels = mentionables
    .map(mentionLabel)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  if (labels.length === 0) return body;

  const pattern = new RegExp(`@(?:${labels.map(escapeRegExp).join("|")})`, "g");
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(body)) !== null) {
    if (match.index > last) nodes.push(body.slice(last, match.index));
    nodes.push(
      <span
        key={match.index}
        className="text-primary bg-primary/10 rounded px-1 font-medium"
      >
        {match[0]}
      </span>,
    );
    last = match.index + match[0].length;
  }
  if (last < body.length) nodes.push(body.slice(last));
  return nodes;
}

export function CommentItem({
  comment,
  entity,
  entityId,
  viewerId,
  canComment,
  canModerate,
  mentionables,
  isReply = false,
  onChanged,
}: Readonly<{
  comment: CommentView;
  entity: CommentEntity;
  entityId: string;
  viewerId: string;
  canComment: boolean;
  canModerate: boolean;
  mentionables: AccessPerson[];
  isReply?: boolean;
  onChanged: () => void;
}>) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [replying, setReplying] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const mine = comment.author?.id === viewerId;
  const canEdit = mine && !comment.deleted;
  const canDelete = !comment.deleted && (mine || canModerate);
  const canResolve = !isReply && !comment.deleted && (mine || canModerate);

  const doEdit = (body: string, mentionedIds: string[]) =>
    startTransition(async () => {
      const { error } = await withToast(
        () =>
          editComment({
            commentId: comment.id,
            body,
            mentionedUserIds: mentionedIds,
          }),
        { success: "Comment updated." },
      );
      if (!error) {
        setEditing(false);
        onChanged();
      }
    });

  const doReply = (body: string, mentionedIds: string[]) =>
    startTransition(async () => {
      const { error } = await withToast(
        () =>
          createComment({
            entity,
            entityId,
            body,
            parentId: comment.id,
            mentionedUserIds: mentionedIds,
          }),
        { success: "Reply posted." },
      );
      if (!error) {
        setReplying(false);
        onChanged();
      }
    });

  const doDelete = () =>
    startTransition(async () => {
      const { error } = await withToast(
        () => deleteComment({ commentId: comment.id }),
        { success: "Comment removed." },
      );
      setConfirmOpen(false);
      if (!error) onChanged();
    });

  const doResolve = () =>
    startTransition(async () => {
      const { error } = await withToast(
        () =>
          resolveComment({
            commentId: comment.id,
            resolved: !comment.resolved,
          }),
        { success: comment.resolved ? "Thread reopened." : "Thread resolved." },
      );
      if (!error) onChanged();
    });

  return (
    <div className={cn("py-2", isReply && "ml-8")}>
      {comment.deleted ? (
        <p className="text-muted-foreground py-1 text-sm italic">
          This comment was deleted.
        </p>
      ) : (
        <div className="flex gap-2">
          <UserAvatar
            user={comment.author ?? { name: null, email: "", image: null }}
            className="size-8 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="truncate text-sm font-medium">
                {comment.author?.name || comment.author?.email}
              </span>
              <span className="text-muted-foreground text-xs">
                {formatDate(comment.createdAt)}
                {comment.editedAt ? " · edited" : ""}
              </span>
              {comment.resolved && !isReply && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircle2 className="size-3" /> Resolved
                </span>
              )}
            </div>

            {editing ? (
              <div className="mt-1">
                <CommentComposer
                  mentionables={mentionables}
                  pending={pending}
                  submitLabel="Save"
                  initialBody={comment.body ?? ""}
                  autoFocus
                  onSubmit={doEdit}
                  onCancel={() => setEditing(false)}
                />
              </div>
            ) : (
              <p className="mt-0.5 text-sm wrap-break-word whitespace-pre-wrap">
                {renderBody(comment.body ?? "", mentionables)}
              </p>
            )}

            {!editing && (
              <div className="mt-1 flex items-center gap-1">
                {canComment && !isReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setReplying((v) => !v)}
                  >
                    Reply
                  </Button>
                )}
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setEditing(true)}
                  >
                    Edit
                  </Button>
                )}
                {canResolve && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={doResolve}
                    disabled={pending}
                  >
                    {comment.resolved ? "Reopen" : "Resolve"}
                  </Button>
                )}
                {canDelete && (
                  <ConfirmPopover
                    open={confirmOpen}
                    onOpenChange={setConfirmOpen}
                    title="Delete comment?"
                    description="This comment will be removed."
                    confirmLabel="Delete"
                    pending={pending}
                    onConfirm={doDelete}
                    trigger={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive h-7 px-2 text-xs"
                      >
                        Delete
                      </Button>
                    }
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* One level of replies. */}
      {!isReply &&
        comment.replies.map((reply) => (
          <CommentItem
            key={reply.id}
            comment={reply}
            entity={entity}
            entityId={entityId}
            viewerId={viewerId}
            canComment={canComment}
            canModerate={canModerate}
            mentionables={mentionables}
            isReply
            onChanged={onChanged}
          />
        ))}

      {replying && (
        <div className="mt-2 ml-8">
          <CommentComposer
            mentionables={mentionables}
            pending={pending}
            submitLabel="Reply"
            placeholder="Write a reply…"
            autoFocus
            onSubmit={doReply}
            onCancel={() => setReplying(false)}
          />
        </div>
      )}
    </div>
  );
}
