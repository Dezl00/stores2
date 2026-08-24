import React from "react"

export default function AccountLoading() {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 md:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Skeleton */}
        <div className="w-full lg:w-1/4 shrink-0">
          <div className="bg-card rounded-3xl border border-border/50 p-6 space-y-8 h-[calc(100vh-8rem)] sticky top-24">
            <div className="text-center space-y-4 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-muted animate-pulse"></div>
              <div className="space-y-2 w-full flex flex-col items-center">
                <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
            
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 w-full bg-muted rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 space-y-6">
          <div className="h-10 w-48 bg-muted rounded-md animate-pulse mb-6"></div>
          
          <div className="grid gap-6">
            <div className="bg-card border border-border/50 rounded-3xl p-8 space-y-6">
              <div className="h-8 w-40 bg-muted rounded animate-pulse border-b pb-4"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                    <div className="h-12 w-full bg-muted rounded-xl animate-pulse"></div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end pt-4 border-t">
                <div className="h-12 w-32 bg-muted rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
