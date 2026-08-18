"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Search, ShoppingBag, User, Menu as MenuIcon, X, Loader2, ChevronDown, LogOut, Settings, LayoutDashboard, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { useCartStore } from "@/store/cart-store"
import { useUIStore } from "@/store/ui-store"
import { useRouter } from "next/navigation"
import { searchProductsLive } from "@/features/search/actions"
import { NotificationsDropdown } from "@/components/notifications-dropdown"

export function StorefrontHeader({ menuItems, themeConfig, user, categories = [], departments = [] }: { menuItems?: any[], themeConfig?: any, user?: any, categories?: any[], departments?: any[] }) {
  const { getTotals, setIsOpen } = useCartStore()
  const { count, total } = getTotals()
  const [mounted, setMounted] = useState(false)
  const { setAuthModalOpen, setMobileMenuOpen } = useUIStore()
  const router = useRouter()

  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [desktopSearchQuery, setDesktopSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  // Mega Menu state
  const [isCategoriesHovered, setIsCategoriesHovered] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (themeConfig?.logoUrl) {
      useUIStore.getState().setStoreLogo(themeConfig.logoUrl)
    }
  }, [themeConfig?.logoUrl])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      const results = await searchProductsLive(searchQuery)
      setSearchResults(results)
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleDesktopSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (desktopSearchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(desktopSearchQuery)}`)
    }
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] w-full bg-background/95 backdrop-blur-md border-b border-border/40 transition-all duration-300 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* DESKTOP HEADER */}
          <div className="hidden md:flex h-20 items-center justify-between gap-6">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link prefetch={false} href="/" className="flex items-center gap-2">
                {themeConfig?.logoUrl ? (
                  <img src={themeConfig.logoUrl} alt="Store Logo" className="h-14 w-auto object-contain transition-transform hover:scale-105" />
                ) : (
                  <span className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center text-white text-2xl shadow-lg shadow-primary/20">ع</span>
                )}
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="flex items-center gap-6 lg:gap-8 flex-1 justify-center">
              <Link prefetch={false} href="/" className="text-sm font-bold text-foreground hover:text-primary transition-colors">الرئيسية</Link>
              <Link prefetch={false} href="/products" className="text-sm font-bold text-foreground hover:text-primary transition-colors">المتجر</Link>
              
              {departments.length > 0 ? (
                departments.map((dept: any) => {
                  const deptCategories = categories.filter(c => c.departmentId === dept.id && !c.parentId);
                  return (
                    <div 
                      key={dept.id}
                      className="relative py-8 group/deptNav"
                    >
                      <Link prefetch={false} href={`/department/${dept.slug}`} className="flex items-center gap-1 text-sm font-bold text-foreground hover:text-primary transition-colors">
                        {dept.name} {deptCategories.length > 0 && <ChevronDown className="w-4 h-4" />}
                      </Link>
                      
                      {deptCategories.length > 0 && (
                        <div className="absolute top-[80px] right-0 w-64 bg-card border border-border shadow-xl rounded-2xl py-2 flex flex-col opacity-0 invisible group-hover/deptNav:opacity-100 group-hover/deptNav:visible transition-all duration-200 z-50">
                          {deptCategories.map((cat: any) => (
                            <div key={cat.id} className="relative group/subcat">
                              <Link prefetch={false} 
                                href={`/category/${cat.slug}`} 
                                className="flex items-center justify-between px-4 py-3 hover:bg-primary/5 hover:text-primary transition-colors text-sm font-bold text-foreground group/sublink"
                              >
                                <span>{cat.name}</span>
                                {cat.children && cat.children.length > 0 && (
                                  <ChevronDown className="w-4 h-4 text-muted-foreground rotate-90" />
                                )}
                              </Link>
                              
                              {cat.children && cat.children.length > 0 && (
                                <div className="absolute top-0 right-full w-64 bg-card border border-border shadow-xl rounded-2xl py-2 flex flex-col opacity-0 invisible group-hover/subcat:opacity-100 group-hover/subcat:visible transition-all duration-200 z-50">
                                  {cat.children.map((sub: any) => (
                                    <Link prefetch={false} 
                                      key={sub.id} 
                                      href={`/category/${sub.slug}`} 
                                      className="flex items-center px-4 py-3 hover:bg-primary/5 hover:text-primary transition-colors text-sm font-bold text-foreground"
                                    >
                                      {sub.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="relative py-8 group/catNav">
                  <div className="flex items-center gap-1 text-sm font-bold text-foreground hover:text-primary transition-colors cursor-pointer">
                    الأقسام <ChevronDown className="w-4 h-4" />
                  </div>
                  <div className="absolute top-[80px] right-0 w-64 bg-card border border-border shadow-xl rounded-2xl py-2 flex flex-col opacity-0 invisible group-hover/catNav:opacity-100 group-hover/catNav:visible transition-all duration-200 z-50">
                    {categories.filter(c => !c.parentId).map((cat: any) => (
                      <div key={cat.id} className="relative group/subcat">
                        <Link prefetch={false} 
                          href={`/category/${cat.slug}`} 
                          className="flex items-center justify-between px-4 py-3 hover:bg-primary/5 hover:text-primary transition-colors text-sm font-bold text-foreground group/sublink"
                        >
                          <span>{cat.name}</span>
                          {cat.children && cat.children.length > 0 && (
                            <ChevronDown className="w-4 h-4 text-muted-foreground rotate-90" />
                          )}
                        </Link>
                        {cat.children && cat.children.length > 0 && (
                          <div className="absolute top-0 right-full w-64 bg-card border border-border shadow-xl rounded-2xl py-2 flex flex-col opacity-0 invisible group-hover/subcat:opacity-100 group-hover/subcat:visible transition-all duration-200 z-50">
                            {cat.children.map((sub: any) => (
                              <Link prefetch={false} 
                                key={sub.id} 
                                href={`/category/${sub.slug}`} 
                                className="flex items-center px-4 py-3 hover:bg-primary/5 hover:text-primary transition-colors text-sm font-bold text-foreground"
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Link prefetch={false} href="/blog" className="text-sm font-bold text-foreground hover:text-primary transition-colors">الأدلة والنصائح</Link>
              <Link prefetch={false} href="/brands" className="text-sm font-bold text-foreground hover:text-primary transition-colors">الماركات</Link>
              <Link prefetch={false} href="/products?discounted=true" className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors">عروض وخصومات</Link>
            </nav>

            {/* Desktop Actions */}
            <div className="flex items-center gap-4">
              
              {/* Search Button */}
              <button 
                className="flex items-center justify-center border border-border bg-background rounded-full w-11 h-11 shadow-sm hover:bg-accent transition-colors"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="w-5 h-5 text-muted-foreground" />
              </button>

              <div className="h-8 w-px bg-border mx-1"></div>
              
              {/* Notifications */}
              {user && (
                <div className="flex items-center justify-center border border-border bg-background rounded-full w-11 h-11 shadow-sm">
                  <NotificationsDropdown isAdmin={user.role === 'STORE_OWNER' || user.role === 'MANAGER'} />
                </div>
              )}
              
              {/* User Dropdown */}
              <div className="relative group/user">
                <button 
                  className="flex items-center gap-2"
                  onClick={() => {
                    if (!user) setAuthModalOpen(true)
                  }}
                >
                  <div className="w-11 h-11 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col items-start hidden xl:flex">
                    <span className="text-xs text-muted-foreground">مرحباً بك</span>
                    <div className="flex items-center gap-1 text-sm font-bold">
                      {user ? (user.name?.split(' ')[0] || 'حسابي') : 'تسجيل الدخول'}
                      {user && <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                    </div>
                  </div>
                </button>
                
                {user && (
                  <div className="absolute top-full left-0 w-48 bg-card border border-border shadow-xl rounded-2xl py-2 flex flex-col opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all duration-200 z-50 mt-2">
                    {(user.role === 'STORE_OWNER' || user.role === 'MANAGER') ? (
                      <a href="/admin" className="flex items-center gap-2 px-4 py-2 hover:bg-primary/5 hover:text-primary text-sm font-bold transition-colors">
                        <LayoutDashboard className="w-4 h-4" />
                        لوحة التحكم
                      </a>
                    ) : (
                      <>
                        <Link prefetch={false} href="/account" className="flex items-center gap-2 px-4 py-2 hover:bg-primary/5 hover:text-primary text-sm font-bold transition-colors">
                          <User className="w-4 h-4" />
                          حسابي
                        </Link>
                        <Link prefetch={false} href="/account?tab=orders" className="flex items-center gap-2 px-4 py-2 hover:bg-primary/5 hover:text-primary text-sm font-bold transition-colors">
                          <ShoppingCart className="w-4 h-4" />
                          طلباتي
                        </Link>
                        <Link prefetch={false} href="/account?tab=security" className="flex items-center gap-2 px-4 py-2 hover:bg-primary/5 hover:text-primary text-sm font-bold transition-colors">
                          <Settings className="w-4 h-4" />
                          الإعدادات
                        </Link>
                      </>
                    )}
                    <div className="h-px bg-border my-1"></div>
                    <button 
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="flex items-center gap-2 w-full text-start px-4 py-2 hover:bg-red-500/10 hover:text-red-500 text-sm font-bold text-destructive transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>

              {/* Cart Button */}
              <button 
                className="flex items-center gap-2 group"
                onClick={() => setIsOpen(true)}
              >
                <div className="w-11 h-11 rounded-full bg-background border border-border flex items-center justify-center shadow-sm relative">
                  <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                  {mounted && count > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground animate-in zoom-in duration-300">
                      {count}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-start hidden xl:flex">
                  <span className="text-xs text-muted-foreground">سلة المشتريات</span>
                  <span className="text-sm font-bold">{mounted ? total.toFixed(2) : '0.00'} ج.م</span>
                </div>
              </button>
            </div>
          </div>

          {/* MOBILE HEADER */}
          <div className="flex md:hidden h-16 items-center justify-between w-full relative">
            
            {/* Right: Search */}
            <div className="flex-1 flex justify-start">
              <button 
                className="p-1.5 text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="w-7 h-7" strokeWidth={1.5} />
              </button>
            </div>

            {/* Center: Logo */}
            <div className="flex-shrink-0 flex items-center justify-center absolute left-1/2 -translate-x-1/2">
              <Link prefetch={false} href="/" className="flex items-center gap-2">
                {themeConfig?.logoUrl ? (
                  <img src={themeConfig.logoUrl} alt="Store Logo" className="h-10 w-auto object-contain" />
                ) : (
                  <span className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl shadow-lg shadow-primary/20">ع</span>
                )}
              </Link>
            </div>

            {/* Left: Menu */}
            <div className="flex-1 flex justify-end">
              <button className="p-1.5 text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors" onClick={() => setMobileMenuOpen(true)}>
                <MenuIcon className="w-7 h-7" strokeWidth={1.5} />
              </button>
            </div>
            
          </div>
        </div>
      </header>
      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-16 md:h-20 w-full shrink-0"></div>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center pt-20 px-4 bg-black/40">
          <div className="fixed inset-0" onClick={() => setIsSearchOpen(false)}></div>
          <div className="w-full max-w-2xl bg-card rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in slide-in-from-top-4 duration-300 border border-border">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  setIsSearchOpen(false);
                  router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                }
              }}
              className="p-4 border-b border-border bg-background flex items-center gap-3"
            >
              <Search className="w-5 h-5 text-muted-foreground" />
              <input 
                type="text"
                autoFocus
                placeholder="ابحث عن المنتجات..."
                className="flex-1 bg-background border-none focus:outline-none text-foreground text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isSearching && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
              <button type="button" onClick={() => setIsSearchOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </form>
            
            {(searchQuery.trim().length > 0) && (
              <div className="max-h-[60vh] overflow-y-auto bg-background">
                {searchResults.length > 0 ? (
                  <div className="p-2">
                    {searchResults.map(product => (
                      <Link prefetch={false} 
                        key={product.id}
                        href={`/product/${product.slug}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center gap-4 p-3 hover:bg-secondary rounded-xl transition-colors"
                      >
                        <div className="w-12 h-12 rounded-lg bg-background border border-border overflow-hidden shrink-0">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="w-5 h-5 m-3.5 opacity-20" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold line-clamp-1">{product.name}</h4>
                          <p className="text-xs text-muted-foreground">{product.categoryName}</p>
                        </div>
                        <div className="font-bold text-sm text-primary">
                          {product.discountPrice ? product.discountPrice.toFixed(2) : product.price.toFixed(2)} ج.م
                        </div>
                      </Link>
                    ))}
                    <div className="p-4 border-t border-border mt-2">
                      <Link prefetch={false} 
                        href={`/search?q=${encodeURIComponent(searchQuery)}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="w-full py-3 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 flex items-center justify-center transition-colors"
                      >
                        عرض كل النتائج
                      </Link>
                    </div>
                  </div>
                ) : (
                  !isSearching && (
                    <div className="p-8 text-center text-muted-foreground">
                      لا توجد نتائج مطابقة لـ "{searchQuery}"
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
