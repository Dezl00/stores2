import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { RegisterClient } from "./register-client"
import { isPlatformContext } from "@/lib/tenant"

export const metadata = {
  title: "إنشاء متجر جديد",
  description: "أنشئ متجرك الإلكتروني في دقائق",
}

export const dynamic = "force-dynamic"

export default async function RegisterPage() {
  const session = await auth()
  const onPlatform = await isPlatformContext()
  
  if (session?.user) {
    if (session.user.context === 'platform') {
      redirect("/platform")
    }
    redirect("/admin")
  }

  // Only allow store creation from the platform domain!
  if (!onPlatform) {
    redirect("/")
  }

  return <RegisterClient />
}