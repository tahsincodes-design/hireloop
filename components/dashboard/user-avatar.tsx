import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/format"
import { cn } from "@/lib/utils"

export function UserAvatar({
  name,
  image,
  size = "default",
  className,
}: {
  name: string | null | undefined
  image?: string | null
  size?: "default" | "sm" | "lg"
  className?: string
}) {
  return (
    <Avatar size={size} className={cn("ring-1 ring-white/10", className)}>
      {image ? <AvatarImage src={image} alt={name ?? "User avatar"} /> : null}
      <AvatarFallback className="bg-indigo-500/15 text-xs font-semibold text-indigo-200">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
