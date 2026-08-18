"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Store, User, ShoppingBag } from "lucide-react"
import { useCartStore } from "@/store/cart-store"
import { useUIStore } from "@/store/ui-store"

export function MobileBottomNav({ user }: { user?: any }) {
  const pathname = usePathname()
  const router = useRouter()
  const { getTotals, setIsOpen } = useCartStore()
  const { count } = getTotals()
  const { setAuthModalOpen } = useUIStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAccountClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (user) {
      if (user.role === 'STORE_OWNER' || user.role === 'MANAGER') {
        window.location.href = '/admin'
      } else {
        router.push('/account')
      }
    } else {
      setAuthModalOpen(true)
    }
  }

  const navItems = [
    { name: "الرئيسية", href: "/", icon: Home },
    { name: "المتجر", href: "/products", icon: Store },
    { 
      name: "السلة", 
      href: "#", 
      icon: ShoppingBag, 
      badge: mounted ? count : 0,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault()
        setIsOpen(true)
      }
    },
    { name: "حسابي", href: "/account", icon: User, onClick: handleAccountClick },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border/50 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.name === "حسابي" && pathname.startsWith("/account"))
          return (
            <Link prefetch={false}
              key={item.name}
              href={item.href}
              onClick={item.onClick}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 relative group"
            >
              <div className={`transition-colors duration-200 relative ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                <item.icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium transition-colors duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
