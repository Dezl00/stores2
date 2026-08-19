"use client"
import React, { useState, useEffect, useRef } from "react"
import { Search, Loader2, ShoppingBag, FolderTree, LayoutDashboard, Settings, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"

export function AdminGlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()
  const debouncedQuery = useDebounce(query, 500)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!debouncedQuery) {
      setResults(null)
      return
    }

    async function search() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(debouncedQuery)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data)
        }
      } catch (error) {
        console.error("Search failed", error)
      } finally {
        setIsLoading(false)
      }
    }

    search()
  }, [debouncedQuery])

  const handleSelect = (url: string) => {
    setIsOpen(false)
    setQuery("")
    router.push(url)
  }

  return (
    <div ref={containerRef} className="relative w-full flex-1 md:flex-none max-w-2xl">
      {/* Mobile Search Icon & Input */}
      <div className="relative group">
        <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60 peer-focus:text-slate-400" />
        <input 
          type="text" 
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="ابحث في المتجر والطلبات والعملاء..." 
          className="peer w-full h-10 md:h-11 bg-white/10 border border-white/20 hover:bg-white/20 focus:bg-white focus:text-slate-900 text-white placeholder:text-white/60 rounded-full pr-11 pl-4 text-sm outline-none transition-all shadow-sm"
        />
        {isLoading && (
          <Loader2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 md:left-auto md:right-0 mt-2 w-[calc(100vw-2rem)] md:w-[450px] bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50 max-h-[70vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
          
          <div className="p-3 border-b border-border bg-muted/20 flex items-center justify-between">
            <span className="text-sm font-semibold">نتائج البحث</span>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>

          <div className="overflow-y-auto flex-1 p-2 scrollbar-thin">
            {!isLoading && results && (
              <div className="space-y-4">
                {/* Orders */}
                {results.orders?.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-muted-foreground px-2 flex items-center gap-2 mb-2">
                      <ShoppingBag className="w-3 h-3" /> الطلبات
                    </h4>
                    {results.orders.map((order: any) => (
                      <button 
                        key={order.id} 
                        onClick={() => handleSelect(`/admin/orders`)} 
                        className="w-full text-start px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors flex items-center justify-between group"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium group-hover:text-primary transition-colors">طلب #{order.id.slice(-6)}</span>
                          <span className="text-xs text-muted-foreground">{order.customerName || "عميل غير معروف"}</span>
                        </div>
                        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded">{order.totalAmount} ر.س</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Customers */}
                {results.users?.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-muted-foreground px-2 flex items-center gap-2 mb-2">
                      <User className="w-3 h-3" /> العملاء
                    </h4>
                    {results.users.map((user: any) => (
                      <button 
                        key={user.id} 
                        onClick={() => handleSelect(`/admin/customers`)} 
                        className="w-full text-start px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors flex items-center gap-3 group"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium group-hover:text-primary transition-colors">{user.name || "بدون اسم"}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Products */}
                {results.products?.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-muted-foreground px-2 flex items-center gap-2 mb-2">
                      <ShoppingBag className="w-3 h-3" /> المنتجات
                    </h4>
                    {results.products.map((product: any) => (
                      <button 
                        key={product.id} 
                        onClick={() => handleSelect(`/admin/products`)} 
                        className="w-full text-start px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors flex flex-col group"
                      >
                        <span className="font-medium group-hover:text-primary transition-colors truncate max-w-full">{product.name}</span>
                        <span className="text-xs text-muted-foreground">SKU: {product.sku} • {product.price} ر.س</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Categories */}
                {results.categories?.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-muted-foreground px-2 flex items-center gap-2 mb-2">
                      <FolderTree className="w-3 h-3" /> الأقسام
                    </h4>
                    {results.categories.map((category: any) => (
                      <button 
                        key={category.id} 
                        onClick={() => handleSelect(`/admin/categories`)} 
                        className="w-full text-start px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors font-medium group"
                      >
                        <span className="group-hover:text-primary transition-colors">{category.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && 
                 results.orders?.length === 0 && 
                 results.users?.length === 0 && 
                 results.products?.length === 0 && 
                 results.categories?.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 opacity-20" />
                    لا توجد نتائج مطابقة لبحثك "{query}"
                  </div>
                )}
              </div>
            )}
            
            {isLoading && !results && (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground opacity-50" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
