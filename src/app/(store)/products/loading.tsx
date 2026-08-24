import React from "react"

export default function ProductsLoading() {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 md:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Skeleton */}
        <div className="w-full md:w-1/4 lg:w-1/5 shrink-0 hidden md:block">
          <div className="space-y-6">
            <div className="h-8 w-32 bg-muted rounded-md animate-pulse"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                </div>
              ))}
            </div>
            <div className="h-8 w-32 bg-muted rounded-md animate-pulse mt-8"></div>
            <div className="h-2 bg-muted rounded animate-pulse w-full"></div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-8">
            <div className="h-8 w-40 bg-muted rounded-md animate-pulse"></div>
            <div className="h-10 w-32 bg-muted rounded-md animate-pulse"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-card rounded-2xl border border-border/50 overflow-hidden flex flex-col">
                <div className="aspect-square bg-muted animate-pulse"></div>
                <div className="p-4 space-y-3 flex-1">
                  <div className="h-4 w-1/3 bg-muted rounded animate-pulse"></div>
                  <div className="h-5 w-3/4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-1/2 bg-muted rounded animate-pulse"></div>
                  <div className="pt-2">
                    <div className="h-10 w-full bg-muted rounded-xl animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
