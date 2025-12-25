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
import { Loader2, ShieldUser, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { isAdmin as checkIsAdmin } from "@/lib/utils";
import { updateUserAdminStatusAction } from "@/lib/actions/admin";
import { useState } from "react";
import { withToast } from "@/lib/with-toast";

export default function ToggleAdmin({
  userId,
  isAdmin,
  username,
}: Readonly<{
  userId: string;
  isAdmin: boolean;
  username: string;
}>) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleAdmin = async () => {
    setIsUpdating(true);
    await withToast(() => updateUserAdminStatusAction(userId, !isAdmin), {
      success: (updated) => {
        return `User ${
          checkIsAdmin(updated.userRole) ? "granted" : "removed from"
        } admin privileges.`;
      },
    });
    setIsUpdating(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={isUpdating}>
          {isUpdating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : isAdmin ? (
            <>
              <ShieldUser className="mr-2 h-4 w-4" />
              Remove Admin
            </>
          ) : (
            <>
              <User className="mr-2 h-4 w-4" />
              Make Admin
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isAdmin ? "Remove Admin Privileges" : "Grant Admin Privileges"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to{" "}
            {isAdmin
              ? "remove admin privileges from"
              : "grant admin privileges to"}{" "}
            {username}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleToggleAdmin}>
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
