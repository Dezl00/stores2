import React from "react"
import { Loader2 } from "lucide-react"

export default function CheckoutLoading() {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 md:px-6 lg:px-8 py-12">
      <div className="h-4 w-64 bg-muted rounded animate-pulse mb-8"></div>
      <div className="h-10 w-48 bg-muted rounded-md animate-pulse mb-12"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
            <div className="h-8 w-40 bg-muted rounded animate-pulse mb-6"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                  <div className="h-12 w-full bg-muted rounded-xl animate-pulse"></div>
                </div>
              ))}
            </div>
            
            <div className="space-y-2 mt-6">
              <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
              <div className="h-24 w-full bg-muted rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-5">
          <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm sticky top-24">
            <div className="h-8 w-32 bg-muted rounded animate-pulse mb-6"></div>
            
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-muted rounded-xl animate-pulse shrink-0"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-1/4 bg-muted rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-border/50 mt-6 pt-6 space-y-4">
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-6 w-24 bg-muted rounded animate-pulse"></div>
                <div className="h-6 w-24 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
            
            <div className="mt-8">
              <div className="h-14 w-full bg-muted rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
