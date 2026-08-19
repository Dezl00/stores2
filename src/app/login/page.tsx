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
  
  if (!onPlatform) {
    try {
      const { getCurrentStore } = await import("@/lib/tenant")
      const store = await getCurrentStore()
      if (store) {
        themeConfig = await db.themeConfig.findUnique({
          where: { storeId: store.storeId }
        })
      }
    } catch (e) {}
  }

  return <LoginClient themeConfig={themeConfig} isPlatform={onPlatform} />
}