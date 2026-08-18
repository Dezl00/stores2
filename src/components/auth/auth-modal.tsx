"use client"

import React, { useState, useEffect } from "react"
import { useUIStore } from "@/store/ui-store"
import { X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signIn, getSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { registerUser, loginUser } from "@/app/actions/auth"

export function AuthModal({ themeConfig }: { themeConfig?: any }) {
  const { isAuthModalOpen, setAuthModalOpen } = useUIStore()
  const [tab, setTab] = useState<"login" | "register">("login")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Touch drag state
  const [translateY, setTranslateY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)

  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isAuthModalOpen])

  if (!isAuthModalOpen) return null

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const currentY = e.touches[0].clientY
    const deltaY = currentY - startY
    
    // Only allow dragging down
    if (deltaY > 0) {
      setTranslateY(deltaY)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    if (translateY > 100) {
      // Close modal if dragged down more than 100px
      setAuthModalOpen(false)
      // Reset translation after animation
      setTimeout(() => setTranslateY(0), 300)
    } else {
      // Snap back
      setTranslateY(0)
    }
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const phone = formData.get("phone") as string
    const password = formData.get("password") as string

    try {
      const check = await loginUser(formData)
      if (check.error) {
        setError(check.error)
        setLoading(false)
        return
      }

      const result = await signIn("credentials", {
        redirect: false,
        phone,
        password,
      })

      if (result?.error) {
        setError("رقم الهاتف أو كلمة المرور غير صحيحة")
      } else {
        setAuthModalOpen(false)
        
        // If we are currently on checkout, stay on checkout but refresh
        if (pathname === "/checkout") {
          router.refresh()
        } else {
          if (check.role === "STORE_OWNER" || check.role === "MANAGER" || (check.permissions && check.permissions.length > 0)) {
            window.location.href = "/admin"
          } else {
            router.push("/account")
            router.refresh()
          }
        }
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى")
    } finally {
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
        // Auto login after successful registration
        const signInResult = await signIn("credentials", {
          redirect: false,
          phone,
          password,
        })

        if (signInResult?.error) {
          setError("تم إنشاء الحساب بنجاح، ولكن حدث خطأ أثناء تسجيل الدخول التلقائي")
        } else {
          setAuthModalOpen(false)
          
          if (pathname === "/checkout") {
            router.refresh()
          } else {
            router.push("/account")
            router.refresh()
          }
        }
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={() => setAuthModalOpen(false)}
      />

      {/* Modal */}
      <div 
        className="bg-card w-full sm:w-[450px] rounded-t-3xl sm:rounded-3xl shadow-2xl relative z-10 sm:animate-in sm:zoom-in-95 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 duration-300 max-h-[90vh] overflow-y-auto flex flex-col"
        style={{ 
          transform: translateY > 0 ? `translateY(${translateY}px)` : undefined, 
          transition: isDragging ? 'none' : 'transform 0.3s ease-out' 
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle (Mobile Only) */}
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden shrink-0">
          <div className="w-12 h-1.5 bg-border rounded-full" />
        </div>
        
        {/* Close Button */}
        <button 
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 pt-2 sm:pt-8 flex-1">
          {/* Logo */}
          <div className="flex flex-col items-center justify-center mb-8">
            {themeConfig?.logoUrl ? (
              <img src={themeConfig.logoUrl} alt="Store Logo" className="h-16 w-auto object-contain mb-4" />
            ) : (
              <span className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center text-white text-3xl shadow-lg shadow-primary/20 mb-4">ع</span>
            )}
            <h2 className="text-2xl font-bold text-foreground">
              {themeConfig?.storeName || "العسال"}
            </h2>
          </div>

          {/* Tabs */}
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

          {error && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 text-center">
              {error}
            </div>
          )}

          {/* Forms */}
          {tab === "login" ? (
            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">رقم الهاتف</label>
                <Input type="tel" name="phone" required placeholder="010..." className="h-12" dir="ltr" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">كلمة المرور</label>
                <Input type="password" name="password" required className="h-12" dir="ltr" />
              </div>
              <div className="flex justify-end">
                <button type="button" className="text-sm text-primary hover:underline">نسيت كلمة المرور؟</button>
              </div>
              <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "دخول"}
              </Button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleRegister}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">الاسم الكامل</label>
                <Input type="text" name="name" required placeholder="أحمد محمد" className="h-12" />
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
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "إنشاء حساب جديد"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
