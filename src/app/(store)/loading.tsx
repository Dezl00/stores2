import React from "react"

export default function StoreLoading() {
  return (
    <div className="flex flex-col flex-1 gap-12 w-full animate-pulse pb-24">
      {/* Hero Banner Skeleton */}
      <div className="w-full h-[50vh] md:h-[70vh] bg-muted/60 relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 space-y-4">
          <div className="h-12 w-3/4 md:w-1/2 bg-muted-foreground/20 rounded-xl"></div>
          <div className="h-6 w-1/2 md:w-1/3 bg-muted-foreground/10 rounded-md"></div>
          <div className="h-12 w-40 bg-muted-foreground/20 rounded-full mt-4"></div>
        </div>
      </div>

      {/* Featured Products Skeleton */}
      <div className="w-full max-w-[1400px] mx-auto px-3 md:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-end mb-6">
          <div className="h-10 w-48 bg-muted rounded-xl"></div>
          <div className="h-6 w-24 bg-muted rounded-md hidden md:block"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map(i => (
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
      
      {/* Categories Grid Skeleton */}
      <div className="w-full max-w-[1400px] mx-auto px-3 md:px-6 lg:px-8 space-y-8 mt-8">
        <div className="h-10 w-48 bg-muted rounded-xl mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="aspect-[4/3] rounded-3xl bg-muted"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
