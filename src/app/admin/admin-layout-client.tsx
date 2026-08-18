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
  logoUrl
}: {
  children: React.ReactNode
  storeName: string
  logoUrl: string | null
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
      <AdminLayoutInner storeName={storeName} logoUrl={logoUrl}>
        {children}
        <GlobalOrderListener />
      </AdminLayoutInner>
    </SessionProvider>
  )
}

function AdminLayoutInner({
  children,
  storeName,
  logoUrl
}: {
  children: React.ReactNode
  storeName: string
  logoUrl: string | null
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const permissions = session?.user?.permissions || []
  const isAdmin = session?.user?.role === "STORE_OWNER"
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

  const navItems = [
    { name: "الرئيسية", href: "/admin", icon: LayoutDashboard, show: true },
    { name: "الطلبات", href: "/admin/orders", icon: ShoppingBag, show: hasPerm('orders') },
    { name: "العملاء", href: "/admin/customers", icon: FolderTree, show: hasPerm('customers') },
    { name: "المجالات", href: "/admin/departments", icon: LayoutDashboard, show: hasPerm('departments') },
    { name: "الأقسام", href: "/admin/categories", icon: ListTree, show: hasPerm('categories') },
    { name: "المنتجات", href: "/admin/products", icon: ShoppingBag, show: hasPerm('products') },
    { name: "العروض وأكواد الخصم", href: "/admin/offers", icon: Tag, show: hasPerm('offers') },
    { name: "طرق الدفع والشحن", href: "/admin/shipping-payment", icon: Truck, show: hasPerm('settings') },
    { name: "الإحصائيات", href: "/admin/analytics", icon: LayoutDashboard, show: hasPerm('analytics') },
    { name: "منشئ الواجهات", href: "/admin/widgets", icon: LayoutTemplate, show: hasPerm('widgets') },
    { name: "المقالات", href: "/admin/articles", icon: BookOpen, show: hasPerm('articles') },
    { name: "موظفو الشهر", href: "/admin/employees-of-the-month", icon: Award, show: hasPerm('employees_of_the_month') },
    { name: "الحسابات والصلاحيات", href: "/admin/accounts", icon: FolderTree, show: hasPerm('accounts') },
    { name: "السجلات", href: "/admin/logs", icon: LayoutDashboard, show: hasPerm('security') },
    { name: "الإعدادات", href: "/admin/settings", icon: Settings, show: hasPerm('settings') },
  ].filter(item => item.show)

  // For bottom nav, we only show top 4 most important for mobile
  const bottomNavItems = [
    { name: "الرئيسية", href: "/admin", icon: LayoutDashboard },
    { name: "الطلبات", href: "/admin/orders", icon: ShoppingBag },
    { name: "العملاء", href: "/admin/customers", icon: FolderTree },
    { name: "المنتجات", href: "/admin/products", icon: ShoppingBag },
  ]

  return (
    <div className="flex min-h-screen bg-background admin-theme">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 border-l border-border bg-white text-[#2453E3] transition-all flex-col fixed inset-y-0 right-0 z-50">
        <div className="flex h-16 items-center px-6 border-b border-border shrink-0">
          {/* Logo or Title */}
          {logoUrl ? (
            <img src={logoUrl} alt={storeName} className="h-8 w-auto object-contain" />
          ) : (
            <span className="text-xl font-bold text-[#2453E3]">{storeName}</span>
          )}
        </div>
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link prefetch={false}
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all active:scale-95",
                  isActive ? "bg-[#2453E3] text-white" : "hover:bg-slate-100 text-slate-600 hover:text-[#2453E3]"
                )}
              >
                <item.icon className={cn("h-5 w-5 transition-colors rtl-flip", isActive ? "text-white" : "text-slate-500 group-hover:text-[#2453E3]")} />
                {item.name}
              </Link>
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
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link prefetch={false}
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all active:scale-95",
                  isActive ? "bg-[#2453E3] text-white" : "hover:bg-slate-100 text-slate-600 hover:text-[#2453E3]"
                )}
              >
                <item.icon className={cn("h-5 w-5 transition-colors rtl-flip", isActive ? "text-white" : "text-slate-500 group-hover:text-[#2453E3]")} />
                {item.name}
              </Link>
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
        <header className="flex h-14 md:h-16 items-center justify-between border-b border-border bg-background px-4 md:px-8 shrink-0 fixed top-0 left-0 right-0 md:right-72 z-40">
          
          {/* Mobile Header Left */}
          <div className="flex items-center gap-3 md:hidden">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="h-8 w-auto object-contain" />
            ) : (
              <span className="text-base font-bold bg-clip-text text-transparent bg-primary">{storeName}</span>
            )}
          </div>

          {/* Desktop Header Left (Nav items) */}
          <div className="hidden md:flex items-center gap-6">
             <div className="flex items-center gap-4">
               <Link prefetch={false} href="/admin" className={cn("text-sm font-medium transition-colors", pathname === "/admin" ? "text-primary" : "text-muted-foreground hover:text-foreground")}>الرئيسية</Link>
               <Link prefetch={false} href="/admin/orders" className={cn("text-sm font-medium transition-colors", pathname.startsWith("/admin/orders") ? "text-primary" : "text-muted-foreground hover:text-foreground")}>الطلبات</Link>
               <Link prefetch={false} href="/admin/customers" className={cn("text-sm font-medium transition-colors", pathname.startsWith("/admin/customers") ? "text-primary" : "text-muted-foreground hover:text-foreground")}>العملاء</Link>
             </div>
          </div>

          {/* Central Search Bar */}
          <div className="hidden md:flex flex-1 justify-center max-w-xl mx-4">
            <AdminGlobalSearch />
          </div>

          {/* Header Right (Profile) */}
          <div className="flex items-center gap-3 md:gap-4 justify-end">
            <div className="md:hidden flex-1">
              <AdminGlobalSearch />
            </div>
            
            <Link prefetch={false} 
              href="/" 
              target="_blank" 
              className="hidden sm:flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-muted-foreground hover:text-primary transition-colors bg-muted/30 px-3 py-1.5 rounded-full"
            >
              <span className="hidden sm:inline">عرض المتجر</span>
              <ExternalLink className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Link>
            <NotificationsDropdown isAdmin={true} />
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
