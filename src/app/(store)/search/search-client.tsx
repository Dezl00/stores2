"use client"

import React, { useState, useEffect } from "react"
import { Search, Loader2, Frown } from "lucide-react"
import { useRouter } from "next/navigation"
import { CategoryProductGrid } from "@/components/storefront/category-product-grid"
import { searchProductsLive } from "@/features/search/actions"

export function SearchClient({ initialQuery, initialResults }: { initialQuery: string, initialResults: any[] }) {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState(initialResults)
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // If the user types in the input without pressing enter, we can do live search
    if (query === initialQuery) return

    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults([])
        return
      }
      setIsSearching(true)
      const newResults = await searchProductsLive(query)
      setResults(newResults)
      setIsSearching(false)
      // Update URL silently
      window.history.replaceState(null, '', `/search?q=${encodeURIComponent(query)}`)
    }, 500)

    return () => clearTimeout(timer)
  }, [query, initialQuery])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 min-h-[70vh]">
      {/* Internal Header */}
      <div className="mb-8 sm:mb-12 relative overflow-hidden rounded-3xl bg-primary p-8 sm:p-16 text-center shadow-lg shadow-primary/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-primary-foreground mb-8">ابحث عن منتج</h1>
          <div className="max-w-2xl mx-auto flex flex-col items-center w-full">
          <form onSubmit={handleSubmit} className="w-full relative group">
            <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
              {isSearching ? (
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              ) : (
                <Search className="w-6 h-6 text-primary" />
              )}
            </div>
            <input 
              type="text" 
              placeholder="عن ماذا تبحث؟" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-16 bg-background border-2 border-transparent focus:border-white/20 rounded-2xl pr-14 pl-6 text-lg outline-none transition-all shadow-xl text-foreground placeholder:text-muted-foreground"
            />
          </form>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="mt-16">
        {query.trim() === "" ? (
          <div className="text-center text-muted-foreground py-20 flex flex-col items-center opacity-50">
            <Search className="w-16 h-16 mb-4" />
            <p className="text-xl">اكتب شيئاً للبحث في المتجر...</p>
          </div>
        ) : isSearching && results.length === 0 ? (
          <div className="text-center text-muted-foreground py-20 flex flex-col items-center">
            <Loader2 className="w-12 h-12 mb-4 animate-spin text-primary" />
            <p>جاري البحث...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">نتائج البحث عن "{query}" ({results.length})</h2>
            <CategoryProductGrid products={results} />
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-20 flex flex-col items-center">
            <Frown className="w-16 h-16 mb-4 opacity-50" />
            <h3 className="text-2xl font-bold mb-2 text-foreground">لا توجد نتائج</h3>
            <p className="text-lg">عذراً، لم نتمكن من العثور على أي منتج يطابق "{query}"</p>
          </div>
        )}
      </div>
    </div>
  )
}
