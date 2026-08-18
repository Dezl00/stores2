import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { LoginClient } from "./login-client"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  description: "تسجيل الدخول إلى حسابك في المتجر",
}

export default async function LoginPage() {
  const session = await auth()
  
  if (session?.user) {
    // Redirect to admin dashboard directly as requested by user
    redirect("/admin")
  }

  const { getCurrentStore } = await import("@/lib/tenant")
  const store = await getCurrentStore()
  let themeConfig = null
  
  if (store) {
    themeConfig = await db.themeConfig.findUnique({
      where: { storeId: store.storeId }
    })
  }

  return <LoginClient themeConfig={themeConfig} />
}
