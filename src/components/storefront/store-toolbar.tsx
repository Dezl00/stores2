"use client"

import React, { useState, useRef, useEffect } from "react"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { Filter, ArrowDownUp, Check } from "lucide-react"
import { useUIStore } from "@/store/ui-store"

export function StoreToolbar({ totalProducts, hideToolbar = false }: { totalProducts: number, hideToolbar?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { setFilterSidebarOpen, categoryViewMode, setCategoryViewMode } = useUIStore()
  const [isSortOpen, setIsSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)

  const currentSort = searchParams.get("sort") || "newest"
  
  // Check if any filters are active (excluding sort and page)
  const hasFilters = Array.from(searchParams.keys()).some(key => !['sort', 'page', 'q'].includes(key))

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", value)
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
    setIsSortOpen(false)
  }

  if (hideToolbar) return null

  return (
    <div className="flex items-center justify-between mb-6">
      
      <div className="text-muted-foreground text-sm">
        عرض <span className="font-bold text-foreground">{totalProducts}</span> منتج
      </div>

      <div className="flex items-center gap-2">
        {/* View Toggles */}
        <div className="md:hidden flex items-center bg-card border border-border/50 rounded-full h-10 px-1 shadow-sm overflow-hidden">
          <button
            onClick={() => setCategoryViewMode("list")}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${categoryViewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            title="عامود واحد"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect></svg>
          </button>
          <div className="w-[1px] h-4 bg-border/50 mx-1"></div>
          <button
            onClick={() => setCategoryViewMode("grid")}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${categoryViewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            title="عامودين"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="18" rx="1" ry="1"></rect><rect x="14" y="3" width="7" height="18" rx="1" ry="1"></rect></svg>
          </button>
        </div>
        {/* Sort Button */}
        <div className="relative" ref={sortRef}>
          <button 
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors shadow-sm"
            title="الترتيب"
          >
            <ArrowDownUp className="w-4 h-4" />
          </button>

          {isSortOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-card border border-border/50 rounded-xl shadow-xl z-50 overflow-hidden py-1">
              <button 
                onClick={() => handleSortChange("newest")}
                className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-secondary transition-colors text-right"
              >
                الأحدث
                {currentSort === "newest" && <Check className="w-4 h-4 text-primary" />}
              </button>
              <button 
                onClick={() => handleSortChange("price_asc")}
                className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-secondary transition-colors text-right"
              >
                السعر: من الأقل للأعلى
                {currentSort === "price_asc" && <Check className="w-4 h-4 text-primary" />}
              </button>
              <button 
                onClick={() => handleSortChange("price_desc")}
                className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-secondary transition-colors text-right"
              >
                السعر: من الأعلى للأقل
                {currentSort === "price_desc" && <Check className="w-4 h-4 text-primary" />}
              </button>
            </div>
          )}
        </div>

        {/* Filter Button */}
        <button 
          onClick={() => setFilterSidebarOpen(true)}
          className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-full bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors shadow-sm"
          title="تصفية المنتجات"
        >
          <Filter className="w-4 h-4" />
          {hasFilters && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full border-2 border-card"></span>
          )}
        </button>
      </div>
    </div>
  )
}
