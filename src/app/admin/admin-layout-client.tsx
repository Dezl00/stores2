"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingBag, FolderTree, Image as ImageIcon, LayoutTemplate, Settings, ListTree, ExternalLink, LogOut, Menu as MenuIcon, X, Bell, Tag, Truck, BookOpen, Loader2, Award } from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut, useSession, SessionProvider } from "next-auth/react"
import { AdminGlobalSearch } from "@/components/admin/admin-global-search"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { PushNotificationPrompt } from "@/components/admin/push-notification-prompt"
import { GlobalOrderListener } from "@/components/admin/global-order-listener"

export function AdminLayoutClient({
  children,
  storeName,
  logoUrl,
  initialRole,
  initialPermissions,
}: {
  children: React.ReactNode
  storeName: string
  logoUrl: string | null
  initialRole: string
  initialPermissions: string[]
}) {
  useEffect(() => {
    document.body.classList.add('admin-theme', 'bg-background');
    
    // Register PWA Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/admin/' })
        .catch(err => console.error('Service Worker registration failed:', err));
    }

    return () => {
      document.body.classList.remove('admin-theme', 'bg-background');
    }
  }, []);

  return (
    <SessionProvider>
      <AdminLayoutInner storeName={storeName} logoUrl={logoUrl} initialRole={initialRole} initialPermissions={initialPermissions}>
        {children}
        <GlobalOrderListener />
      </AdminLayoutInner>
    </SessionProvider>
  )
}

function AdminLayoutInner({
  children,
  storeName,
  logoUrl,
  initialRole,
  initialPermissions,
}: {
  children: React.ReactNode
  storeName: string
  logoUrl: string | null
  initialRole: string
  initialPermissions: string[]
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  // Use server-provided values immediately (no flash), then update from session once loaded
  const permissions = session?.user?.permissions ?? initialPermissions
  const isAdmin = (session?.user?.role ?? initialRole) === "STORE_OWNER"
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await signOut({ callbackUrl: '/' })
  }

  const hasPerm = (permOrPrefix: string) => {
    if (isAdmin) return true;
    return permissions.some((p: string) => p === permOrPrefix || p.startsWith(`${permOrPrefix}.`));
  }

  const navGroups = [
    {
      title: "المبيعات",
      items: [
        { name: "الرئيسية", href: "/admin", icon: LayoutDashboard, show: true },
        { name: "الطلبات", href: "/admin/sales/orders", icon: ShoppingBag, show: hasPerm('orders') },
        { name: "السلات المتروكة", href: "/admin/sales/abandoned-carts", icon: ShoppingBag, show: hasPerm('orders') },
        { name: "العملاء", href: "/admin/sales/customers", icon: FolderTree, show: hasPerm('customers') },
      ]
    },
    {
      title: "الكتالوج",
      items: [
        { name: "المنتجات", href: "/admin/catalog/products", icon: ShoppingBag, show: hasPerm('products') },
        { name: "التصنيفات", href: "/admin/catalog/categories", icon: ListTree, show: hasPerm('categories') },
        { name: "التقييمات", href: "/admin/catalog/reviews", icon: Tag, show: hasPerm('products') },
        { name: "المخزون", href: "/admin/catalog/inventory", icon: FolderTree, show: hasPerm('products') },
      ]
    },
    {
      title: "التسويق",
      items: [
        { name: "العروض والخصومات", href: "/admin/marketing/offers", icon: Tag, show: hasPerm('offers') },
        { name: "الحملات التسويقية", href: "/admin/marketing/campaigns", icon: Tag, show: hasPerm('marketing') || true },
      ]
    },
    {
      title: "واجهة المتجر",
      items: [
        { name: "تصميم المتجر", href: "/admin/storefront/theme", icon: LayoutTemplate, show: hasPerm('widgets') },
        { name: "الصفحات والمدونة", href: "/admin/storefront/pages", icon: BookOpen, show: hasPerm('articles') },
        { name: "القوائم والروابط", href: "/admin/storefront/menus", icon: ListTree, show: hasPerm('widgets') },
      ]
    },
    {
      title: "النظام",
      items: [
        { name: "الإحصائيات", href: "/admin/analytics", icon: LayoutDashboard, show: hasPerm('analytics') },
        { name: "الإعدادات", href: "/admin/system/settings", icon: Settings, show: hasPerm('settings') },
        { name: "طرق الشحن والدفع", href: "/admin/system/shipping", icon: Truck, show: hasPerm('settings') },
        { name: "فريق العمل", href: "/admin/system/team", icon: FolderTree, show: hasPerm('accounts') },
        { name: "التطبيقات والربط", href: "/admin/system/apps", icon: LayoutTemplate, show: hasPerm('settings') || true },
        { name: "الباقات والفواتير", href: "/admin/system/billing", icon: Tag, show: hasPerm('settings') || true },
      ]
    }
  ]

  // For bottom nav, we only show top 4 most important for mobile
  const bottomNavItems = [
    { name: "الرئيسية", href: "/admin", icon: LayoutDashboard },
    { name: "الطلبات", href: "/admin/sales/orders", icon: ShoppingBag },
    { name: "العملاء", href: "/admin/sales/customers", icon: FolderTree },
    { name: "المنتجات", href: "/admin/catalog/products", icon: ShoppingBag },
  ]

  return (
    <div className="flex min-h-screen bg-background admin-theme">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 border-l border-border bg-white text-[#2453E3] transition-all flex-col fixed top-16 bottom-0 right-0 z-40">
        <nav className="p-4 space-y-6 flex-1 overflow-y-auto">
          {navGroups.map((group) => {
            const groupItems = group.items.filter(i => i.show)
            if (groupItems.length === 0) return null
            return (
              <div key={group.title} className="space-y-2">
                <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {groupItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link prefetch={false}
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all active:scale-95",
                          isActive ? "bg-[#2453E3] text-white shadow-sm" : "hover:bg-slate-50 text-slate-600 hover:text-[#2453E3]"
                        )}
                      >
                        <item.icon className={cn("h-4 w-4 transition-colors rtl-flip", isActive ? "text-white" : "text-slate-400 group-hover:text-[#2453E3]")} />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>
        <div className="p-4 border-t border-border shrink-0">
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-all hover:bg-red-50 hover:text-red-700 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
          >
            {isLoggingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5 rtl-flip" />}
            {isLoggingOut ? 'جاري الخروج...' : 'تسجيل الخروج'}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/10 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 right-0 z-50 w-72 bg-white text-[#2453E3] border-l border-border flex flex-col transition-transform duration-300 ease-in-out md:hidden shadow-xl",
        isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex h-14 items-center justify-between px-6 border-b border-border shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt={storeName} className="h-7 w-auto object-contain" />
          ) : (
            <span className="text-xl font-bold text-[#2453E3]">{storeName}</span>
          )}
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 rounded-md hover:bg-slate-100 text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-4 space-y-6 flex-1 overflow-y-auto">
          {navGroups.map((group) => {
            const groupItems = group.items.filter(i => i.show)
            if (groupItems.length === 0) return null
            return (
              <div key={group.title} className="space-y-2">
                <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {groupItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link prefetch={false}
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all active:scale-95",
                          isActive ? "bg-[#2453E3] text-white shadow-sm" : "hover:bg-slate-50 text-slate-600 hover:text-[#2453E3]"
                        )}
                      >
                        <item.icon className={cn("h-4 w-4 transition-colors rtl-flip", isActive ? "text-white" : "text-slate-400 group-hover:text-[#2453E3]")} />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>
        <div className="p-4 border-t border-border shrink-0">
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-all hover:bg-destructive/10 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
          >
            {isLoggingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5 rtl-flip" />}
            {isLoggingOut ? 'جاري الخروج...' : 'تسجيل الخروج'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:mr-72 min-h-screen min-w-0">
        <header className="flex h-14 md:h-16 items-center justify-between border-b border-[#2453E3]/10 bg-[#2453E3] text-white px-4 md:px-6 shrink-0 fixed top-0 left-0 right-0 z-50 shadow-sm">
          
          {/* Right Side (Logo + Nav Items) - Note: In RTL, this is the rightmost part of the screen */}
          <div className="flex items-center gap-6">
            
            {/* Logo Area (Matches sidebar width) */}
            <div className="flex items-center md:w-64 shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt={storeName} className="h-8 w-auto object-contain brightness-0 invert" />
              ) : (
                <span className="text-xl font-bold text-white">{storeName}</span>
              )}
            </div>

            {/* Mobile Nav Toggle */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 -mr-2 rounded-md hover:bg-white/10 text-white">
              <MenuIcon className="h-5 w-5" />
            </button>

            {/* Desktop Nav items */}
            <div className="hidden md:flex items-center gap-4">
               <Link prefetch={false} href="/admin" className={cn("text-sm font-medium transition-colors", pathname === "/admin" ? "text-white font-bold" : "text-white/80 hover:text-white")}>الرئيسية</Link>
               <Link prefetch={false} href="/admin/orders" className={cn("text-sm font-medium transition-colors", pathname.startsWith("/admin/orders") ? "text-white font-bold" : "text-white/80 hover:text-white")}>الطلبات</Link>
               <Link prefetch={false} href="/admin/customers" className={cn("text-sm font-medium transition-colors", pathname.startsWith("/admin/customers") ? "text-white font-bold" : "text-white/80 hover:text-white")}>العملاء</Link>
            </div>
          </div>

          {/* Central Search Bar */}
          <div className="hidden md:flex flex-1 justify-center max-w-xl mx-4">
            <AdminGlobalSearch />
          </div>

          {/* Header Left (Profile/Actions) - Note: In RTL, this is the leftmost part of the screen */}
          <div className="flex items-center gap-2 md:gap-3 justify-end">
            <div className="md:hidden flex-1">
              <AdminGlobalSearch />
            </div>
            
            <Link prefetch={false} 
              href="/" 
              target="_blank" 
              className="hidden sm:flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-white hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full border border-white/10"
            >
              <span className="hidden sm:inline">عرض المتجر</span>
              <ExternalLink className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Link>
            <NotificationsDropdown 
              isAdmin={true} 
              buttonClassName="relative text-white/90 hover:text-white hover:bg-white/10 rounded-full w-9 h-9 md:w-10 md:h-10 transition-colors flex items-center justify-center" 
            />
          </div>
        </header>
        {/* Spacer for fixed header */}
        <div className="h-14 md:h-16 w-full shrink-0"></div>
        <div className="flex-1 p-4 md:p-8 pb-20 md:pb-8 min-w-0 w-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-background border-t border-border z-40 pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center w-full h-full gap-1 text-xs font-medium transition-colors text-muted-foreground hover:text-foreground"
          >
            <MenuIcon className="h-5 w-5" />
            <span>القائمة</span>
          </button>
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link prefetch={false}
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full gap-1 text-xs font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <PushNotificationPrompt />
    </div>
  )
}
