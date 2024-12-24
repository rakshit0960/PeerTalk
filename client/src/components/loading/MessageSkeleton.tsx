import { cn } from "@/lib/utils"
import { Skeleton } from "../ui/skeleton"

export function MessageSkeleton() {
  return (
    <div className="flex-1 p-4 space-y-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className={cn("flex", i % 2 === 0 ? "justify-end" : "justify-start")}
        >
          <div className={cn("space-y-2 max-w-[85%]")}>
            <Skeleton
              className={cn(
                "h-12 w-48",
                i % 2 === 0 ? "bg-primary/20" : "bg-muted"
              )}
            />
            <Skeleton
              className={cn(
                "h-3 w-16",
                i % 2 === 0 ? "ml-auto bg-primary/10" : "bg-muted/50"
              )}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export function MessagesLoading() {
  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
      <div className="flex justify-start"><MessageSkeleton /></div>
      <div className="flex justify-end"><MessageSkeleton /></div>
      <div className="flex justify-start"><MessageSkeleton /></div>
      <div className="flex justify-end"><MessageSkeleton /></div>
    </div>
  )
}
