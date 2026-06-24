"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BadgeCheck, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { updateUserFeaturedAuthorStatusAction } from "@/lib/actions/admin";
import { useState } from "react";
import { withToast } from "@/lib/with-toast";

export default function ToggleFeaturedAuthor({
  userId,
  isFeaturedAuthor,
  username,
}: Readonly<{
  userId: string;
  isFeaturedAuthor: boolean;
  username: string;
}>) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    await withToast(
      () => updateUserFeaturedAuthorStatusAction(userId, !isFeaturedAuthor),
      {
        success: isFeaturedAuthor
          ? "Removed featured author role."
          : "Granted featured author role.",
      },
    );
    setIsUpdating(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={isUpdating}>
          {isUpdating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <BadgeCheck className="mr-2 h-4 w-4" />
          )}
          {isFeaturedAuthor ? "Remove Featured Author" : "Make Featured Author"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isFeaturedAuthor
              ? "Remove Featured Author Role"
              : "Grant Featured Author Role"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isFeaturedAuthor ? (
              <>
                {username} will no longer publish featured selections. Their
                existing featured selections stay in the bank.
              </>
            ) : (
              <>
                {username}&apos;s public selections will be featured in the
                community bank going forward.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleToggle}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
