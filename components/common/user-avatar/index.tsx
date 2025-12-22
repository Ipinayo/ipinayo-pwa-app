import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserAvatar({
  user,
  className,
}: {
  user: { email: string; name?: string | null; image?: string | null };
  className?: string;
}) {
  return (
    <Avatar className={className}>
      <AvatarImage
        src={user.image || undefined}
        alt={user?.name || user.email}
      />
      <AvatarFallback>
        {(user.name || user.email)
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .substring(0, 3)}
      </AvatarFallback>
    </Avatar>
  );
}
