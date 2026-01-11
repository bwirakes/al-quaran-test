"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function SurahListSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="border border-stone-200 rounded-xl bg-white"
        >
          <div className="p-4 flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-md bg-stone-100" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24 bg-stone-100" />
              <Skeleton className="h-3 w-32 bg-stone-50" />
              <Skeleton className="h-2 w-16 bg-stone-50" />
            </div>
            <Skeleton className="h-6 w-12 bg-stone-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function VerseSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="border border-stone-200 rounded-xl bg-white"
        >
          <div className="p-6 space-y-4">
            <Skeleton className="h-5 w-16 bg-stone-100" />
            <div className="space-y-2 pb-4 border-b border-stone-100">
              <Skeleton className="h-8 w-full bg-stone-100" />
              <Skeleton className="h-8 w-3/4 ml-auto bg-stone-50" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-stone-50" />
              <Skeleton className="h-4 w-5/6 bg-stone-50" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
