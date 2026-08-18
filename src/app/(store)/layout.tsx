import React from "react"
import { getCachedLayoutData } from "@/lib/cached-layout-data"
import { StorefrontHeader } from "@/components/storefront/header"
import { StorefrontFooter } from "@/components/storefront/footer"
import { CartDrawer } from "@/components/storefront/cart-drawer"
import { AuthModal } from "@/components/auth/auth-modal"
import { MobileSidebar } from "@/components/storefront/mobile-sidebar"
import { MobileBottomNav } from "@/components/storefront/mobile-bottom-nav"
import { auth } from "@/lib/auth"
import { resolveStoreId } from "@/lib/store-context"
import { FloatingWhatsApp } from "@/components/storefront/floating-whatsapp"
import { PromoPopup } from "@/components/storefront/promo-popup"
import { PushNotificationPrompt } from "@/components/admin/push-notification-prompt"
import { ScrollToTop } from "@/components/scroll-to-top"

export const revalidate = 3600

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const user = session?.user || null

  const {
    headerMenu,
    footerMenu,
    fallbackMenu,
    themeConfig,
    categories,
    branches,
    departments
  } = await getCachedLayoutData(await resolveStoreId())

  const topNavItems = headerMenu?.items || fallbackMenu?.items || []
  const footerItems = footerMenu?.items || fallbackMenu?.items || []

  return (
    <div className="min-h-screen flex flex-col font-sans pb-16 md:pb-0 selection:bg-primary/20">
      <ScrollToTop />
      <StorefrontHeader menuItems={topNavItems} themeConfig={themeConfig} user={user} categories={categories} departments={departments} />
      <MobileSidebar menuItems={topNavItems} themeConfig={themeConfig} categories={categories} departments={departments} />
      <CartDrawer />
      <AuthModal themeConfig={themeConfig} />
      <main className="flex-1 min-h-[80vh] flex flex-col">
        {children}
      </main>
      <StorefrontFooter menuItems={footerItems} themeConfig={themeConfig} branches={branches} />
      <MobileBottomNav user={user} />
      {themeConfig?.whatsappEnabled && themeConfig?.whatsappNumber && (
        <FloatingWhatsApp number={themeConfig.whatsappNumber} />
      )}
      <PromoPopup settings={themeConfig} />
      {user && (
        <PushNotificationPrompt 
          title="تفعيل إشعارات الطلبات"
          description="احصل على إشعارات فورية بحالة طلبك ومسار الشحن مباشرة على جهازك."
          isAdmin={false}
        />
      )}
    </div>
  )
}
