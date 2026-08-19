"use client"

import React, { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Store } from "lucide-react"
import { registerStorePublic } from "./actions"
import Link from "next/link"

export function RegisterClient() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const phone = formData.get("ownerPhone") as string
    const password = formData.get("ownerPassword") as string
    const slug = formData.get("slug") as string

    try {
      const result = await registerStorePublic(formData)

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      if (result.success) {
        // Automatically log them into their new store context
        const signInResult = await signIn("credentials", {
          redirect: false,
          phone,
          password,
          context: "store",
          storeId: result.store?.id,
        })

        if (signInResult?.error) {
          setError("تم إنشاء المتجر بنجاح، يرجى تسجيل الدخول من رابط متجرك الجديد.")
        } else {
          // Redirect them to their new store's admin dashboard
          const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "localhost:3000"
          const cleanPlatform = platformDomain.split(':')[0]
          const protocol = window.location.protocol
          const port = window.location.port ? `:${window.location.port}` : ""
          
          window.location.href = `${protocol}//${slug}.${cleanPlatform}${port}/admin`
        }
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black/5 p-4 sm:p-8 animate-in fade-in duration-300" dir="rtl">
      <div className="bg-card w-full max-w-[450px] rounded-3xl shadow-2xl relative z-10 flex flex-col p-6 sm:p-8">
        
        <div className="flex flex-col items-center justify-center mb-6">
          <span className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg mb-4">
            <Store className="w-8 h-8" />
          </span>
          <h2 className="text-2xl font-bold text-foreground">
            أنشئ متجرك مجاناً
          </h2>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            أدخل بياناتك لإنشاء المتجر والبدء في البيع فوراً.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 text-center">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleRegister}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">اسم المتجر</label>
            <Input type="text" name="name" required className="h-12" placeholder="مثال: متجر الأناقة" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">رابط المتجر (إنجليزي فقط)</label>
            <div className="flex items-center gap-2" dir="ltr">
              <Input type="text" name="slug" required className="h-12" placeholder="my-store" pattern="[a-zA-Z0-9-]+" title="حروف إنجليزية وأرقام وعلامة الناقص فقط" />
              <span className="text-muted-foreground text-sm">.yourdomain.com</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">الاسم كامل (للمدير)</label>
            <Input type="text" name="ownerName" required className="h-12" placeholder="الاسم ثلاثي" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">رقم الهاتف (للدخول)</label>
            <Input type="tel" name="ownerPhone" required placeholder="010..." className="h-12" dir="ltr" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">كلمة المرور</label>
            <Input type="password" name="ownerPassword" required className="h-12" dir="ltr" />
          </div>

          <Button type="submit" className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700 mt-2" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "إنشاء متجري الآن"}
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-4">
            لديك متجر بالفعل؟ <Link href="/login" className="text-indigo-600 hover:underline font-bold">تسجيل الدخول</Link>
          </p>
        </form>
      </div>
    </div>
  )
}