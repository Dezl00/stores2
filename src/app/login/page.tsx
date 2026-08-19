import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { LoginClient } from "./login-client"
import { Metadata } from "next"
import { isPlatformContext } from "@/lib/tenant"

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  description: "تسجيل الدخول إلى حسابك",
}

export const dynamic = "force-dynamic"

export default async function LoginPage() {
  const session = await auth()
  const onPlatform = await isPlatformContext()
  
  if (session?.user) {
    if (session.user.context === 'platform') {
      redirect("/platform")
    }
    redirect("/admin")
  }

  let themeConfig = null
  
  let storeId = null
  if (onPlatform) {
    try {
      const adminCount = await db.platformUser.count({ where: { role: 'SUPER_ADMIN' } })
      if (adminCount === 0) {
        await db.platformUser.create({
          data: {
            name: 'مدير المنصة',
            email: 'admin@matjark.com',
            passwordHash: '$2b$10$nlpQ5F525mYZp3H424lQfu.AgTzaQnK6yBSdrTH9/rP.Bhi9X9eS.', // Admin@2026
            role: 'SUPER_ADMIN',
            isActive: true
          }
        })
        console.log('Super Admin auto-created.')
      }
    } catch (e) {}
  } else {
    try {
      const { getCurrentStore } = await import("@/lib/tenant")
      const store = await getCurrentStore()
      if (store) {
        storeId = store.storeId
        themeConfig = await db.themeConfig.findUnique({
          where: { storeId: store.storeId }
        })
      }
    } catch (e) {}
  }

  return <LoginClient themeConfig={themeConfig} isPlatform={onPlatform} storeId={storeId} />
}