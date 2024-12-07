import { Skeleton } from "../ui/skeleton"

export function ConversationSkeleton() {
  return (
    <div className="flex items-center space-x-4 p-4 hover:bg-gray-900/30 transition-colors">
      <Skeleton className="h-12 w-12 sm:h-14 sm:w-14 rounded-full" />
      <div className="space-y-2.5 flex-1">
        <Skeleton className="h-4 sm:h-5 w-[60%] max-w-[240px]" />
        <Skeleton className="h-3.5 sm:h-4 w-[40%] max-w-[160px] opacity-70" />
      </div>
    </div>
  )
}

export function ConversationsLoading() {
  return (
    <div className="space-y-2">
      {Array(4).fill(0).map((_, i) => (
        <ConversationSkeleton key={i} />
      ))}
    </div>
  )
}