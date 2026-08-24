import React from "react"

export default function ProductDetailsLoading() {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 md:px-6 lg:px-8 py-12">
      {/* Breadcrumb Skeleton */}
      <div className="h-4 w-64 bg-muted rounded animate-pulse mb-8"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        {/* Image Skeleton */}
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-3xl animate-pulse"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-square bg-muted rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Details Skeleton */}
        <div className="space-y-8 py-4">
          <div className="space-y-4">
            <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
            <div className="h-12 w-3/4 bg-muted rounded-md animate-pulse"></div>
            <div className="h-8 w-40 bg-muted rounded-md animate-pulse"></div>
          </div>
          
          <div className="space-y-3">
            <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-2/3 bg-muted rounded animate-pulse"></div>
          </div>
          
          <div className="pt-6 border-t border-border/50 flex gap-4">
            <div className="h-14 w-1/3 bg-muted rounded-2xl animate-pulse"></div>
            <div className="h-14 flex-1 bg-muted rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
