import { Skeleton } from "../ui/skeleton"
import { cn } from "@/lib/utils"

export function MessageSkeleton({ align = "start" }: { align?: "start" | "end" }) {
  return (
    <div className={`flex justify-${align} mb-4`}>
      <div
        className={cn(
          "max-w-[85%] md:max-w-[70%] space-y-2.5 w-full",
          align === "end" ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "p-4 rounded-2xl animate-pulse",
            align === "end" ? "bg-blue-950/50" : "bg-gray-900/50"
          )}
        >
          <Skeleton className="h-4 sm:h-5 w-[180px] sm:w-[250px] mb-2.5" />
          <Skeleton className="h-4 sm:h-5 w-[220px] sm:w-[300px]" />
          <Skeleton className="h-4 sm:h-5 w-[160px] sm:w-[200px] mt-2.5" />
        </div>
        <Skeleton className="h-3 sm:h-3.5 w-[60px] sm:w-[80px] opacity-70" />
      </div>
    </div>
  )
}

export function MessagesLoading() {
  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
      <MessageSkeleton align="start" />
      <MessageSkeleton align="end" />
      <MessageSkeleton align="start" />
      <MessageSkeleton align="end" />
    </div>
  )
}
