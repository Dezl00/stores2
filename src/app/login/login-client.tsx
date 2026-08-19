"use client"

import React, { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, Loader2 } from "lucide-react"
import { registerUser } from "@/app/actions/auth"

function LoginContent({ themeConfig, isPlatform }: { themeConfig: any; isPlatform: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<"login" | "register">("login")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [success, setSuccess] = useState("")

  React.useEffect(() => {
    if (searchParams?.get("locked") === "true") {
      setError("تم تعطيل حسابك من قبل الإدارة. يرجى التواصل مع الدعم.")
      import("next-auth/react").then(({ signOut }) => signOut({ redirect: false }))
    }
    if (searchParams?.get("registered") === "true") {
      setSuccess("تم إنشاء المتجر بنجاح! يمكنك الآن تسجيل الدخول إلى لوحة تحكم متجرك.")
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const phone = formData.get("phone") as string
    const password = formData.get("password") as string

    try {
      const result = await signIn("credentials", {
        redirect: false,
        phone,
        password,
        context: isPlatform ? "platform" : "store",
        storeId: isPlatform ? undefined : (window as any).__STORE_ID__,
      })

      if (result?.error) {
        setError(isPlatform ? "بيانات الدخول غير صحيحة" : "بيانات الدخول غير صحيحة")
        setLoading(false)
      } else {
        router.push(isPlatform ? "/platform" : "/admin")
        router.refresh()
      }
    } catch (err) {
      console.error(err)
      setError("حدث خطأ في الاتصال بالخادم")
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const phone = formData.get("phone") as string
    const password = formData.get("password") as string

    try {
      const result = await registerUser(formData)

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      if (result.success) {
        const signInResult = await signIn("credentials", {
          redirect: false,
          phone,
          password,
        })

        if (signInResult?.error) {
          setError("تم إنشاء الحساب بنجاح، ولكن حدث خطأ أثناء تسجيل الدخول التلقائي")
        } else {
          router.push("/admin")
          router.refresh()
        }
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black/5 p-4 sm:p-8 animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-[450px] rounded-3xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 flex flex-col p-6 sm:p-8">
        
        {/* Logo */}
        <div className="flex flex-col items-center justify-center mb-8">
          {!isPlatform && themeConfig?.logoUrl ? (
            <img src={themeConfig.logoUrl} alt="Store Logo" className="h-16 w-auto object-contain mb-4" />
          ) : (
            <span className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl shadow-lg mb-4">
              {isPlatform ? "🔧" : "ع"}
            </span>
          )}
          <h2 className="text-2xl font-bold text-foreground">
            {isPlatform ? (process.env.NEXT_PUBLIC_PLATFORM_NAME || "لوحة تحكم المنصة") : (themeConfig?.storeName || "العسال")}
          </h2>
          {isPlatform && (
            <p className="text-sm text-muted-foreground mt-1">تسجيل دخول مدراء المنصة</p>
          )}
        </div>

        {/* Tabs - only show register tab for store context */}
        {!isPlatform && (
          <div className="flex rounded-lg bg-muted p-1 mb-6">
            <button
              onClick={() => { setTab("login"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === "login" 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => { setTab("register"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === "register" 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              إنشاء حساب
            </button>
          </div>
        )}

        {/* Locked Alert */}
        {searchParams?.get("locked") === "true" && (
          <div className="bg-destructive/15 text-destructive border-l-4 border-destructive p-4 rounded-xl flex items-start gap-3 shadow-sm mb-6 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold mb-1">جلسة مغلقة</h4>
              <p className="text-sm">تم تعطيل حسابك من قبل الإدارة.</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-md bg-green-500/10 text-green-600 text-sm font-medium border border-green-500/20 text-center">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 text-center">
            {error}
          </div>
        )}

        {/* Forms */}
        {(tab === "login" || isPlatform) ? (
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{isPlatform ? "البريد الإلكتروني" : "رقم الهاتف"}</label>
              <Input type={isPlatform ? "email" : "tel"} name="phone" required placeholder={isPlatform ? "admin@example.com" : "010..."} className="h-12" dir="ltr" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">كلمة المرور</label>
              <Input type="password" name="password" required className="h-12" dir="ltr" />
            </div>
            <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "دخول"}
            </Button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleRegister}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">الاسم كامل</label>
              <Input type="text" name="name" required className="h-12" placeholder="الاسم ثلاثي" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">رقم الهاتف</label>
              <Input type="tel" name="phone" required placeholder="010..." className="h-12" dir="ltr" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">كلمة المرور</label>
              <Input type="password" name="password" required className="h-12" dir="ltr" />
            </div>
            <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "إنشاء حساب"}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}

export function LoginClient({ themeConfig, isPlatform = false }: { themeConfig: any; isPlatform?: boolean }) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-black/5 p-4"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <LoginContent themeConfig={themeConfig} isPlatform={isPlatform} />
    </Suspense>
  )
}