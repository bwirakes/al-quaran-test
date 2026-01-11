"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SurahListSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <Card
          key={i}
          className="border-border/50 bg-card/80 backdrop-blur-sm"
        >
          <div className="p-4 flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-xl bg-[#BADDFF]/20" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-24 bg-[#BADDFF]/20" />
              <Skeleton className="h-4 w-32 bg-[#BAFFF5]/20" />
              <Skeleton className="h-3 w-16 bg-[#FFDBBB]/20" />
            </div>
            <Skeleton className="h-8 w-16 bg-[#496580]/10" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function VerseSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card
          key={i}
          className="border-border/30 bg-card/80 backdrop-blur-sm"
        >
          <div className="p-6 space-y-4">
            <Skeleton className="h-5 w-16 bg-[#BADDFF]/20" />
            <div className="space-y-2 pb-4 border-b border-border/30">
              <Skeleton className="h-8 w-full bg-[#496580]/10" />
              <Skeleton className="h-8 w-3/4 ml-auto bg-[#496580]/10" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-[#BAFFF5]/20" />
              <Skeleton className="h-4 w-5/6 bg-[#BAFFF5]/20" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
