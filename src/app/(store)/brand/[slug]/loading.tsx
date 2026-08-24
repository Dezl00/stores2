import React from "react"

export default function BrandLoading() {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 md:px-6 lg:px-8 py-12 animate-pulse min-h-[70vh]">
      {/* Header Skeleton */}
      <div className="mb-12 relative overflow-hidden rounded-3xl bg-muted p-10 sm:p-16 h-48 sm:h-64 shadow-sm"></div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter Sidebar Skeleton */}
        <div className="hidden lg:block w-64 shrink-0 space-y-6">
          <div className="h-8 w-1/2 bg-muted rounded mb-4"></div>
          <div className="h-40 w-full bg-muted rounded-xl"></div>
          <div className="h-40 w-full bg-muted rounded-xl"></div>
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Toolbar Skeleton */}
          <div className="h-14 w-full bg-muted rounded-xl mb-6"></div>
          
          {/* Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-card rounded-2xl border border-border/50 overflow-hidden flex flex-col">
                <div className="aspect-square bg-muted"></div>
                <div className="p-4 space-y-3 flex-1">
                  <div className="h-4 w-1/3 bg-muted rounded"></div>
                  <div className="h-5 w-3/4 bg-muted rounded"></div>
                  <div className="h-4 w-1/2 bg-muted rounded"></div>
                  <div className="pt-2">
                    <div className="h-10 w-full bg-muted rounded-xl"></div>
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
