"use client"
import React, { useState, useEffect } from "react"
import { useCartStore } from "@/store/cart-store"
import { submitOrder, validateCoupon } from "@/features/checkout/actions"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useUIStore } from "@/store/ui-store"
import { ChevronDown, ShoppingBag, ChevronRight, User, Loader2, Tag, Truck } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function CheckoutClient({ user, governorates = [], paymentMethods = [], settings = {} }: any) {
  const { items, getTotals, clearCart } = useCartStore()
  const { setAuthModalOpen } = useUIStore()
  const { total } = getTotals()
  const router = useRouter()
  
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)
  const [guestName, setGuestName] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  
  // -- Shipping State --
  const hasSavedAddresses = user?.addresses && user.addresses.length > 0
  const legacyHasAddress = !!(user?.address && user?.city)
  const defaultAddress = user?.addresses?.find((a: any) => a.isDefault) || user?.addresses?.[0]
  
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    hasSavedAddresses ? defaultAddress.id : (legacyHasAddress ? "legacy" : "new")
  )
  


  const [selectedGovId, setSelectedGovId] = useState("")
  const [selectedCityId, setSelectedCityId] = useState("")
  
  // -- Payment State --
  const [selectedPaymentId, setSelectedPaymentId] = useState(paymentMethods[0]?.id || "")
  
  // -- Coupon State --
  const [couponCodeInput, setCouponCodeInput] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // -- Default to the only governorate if there is exactly 1 --
  useEffect(() => {
    if (governorates.length === 1 && !selectedGovId) {
      setSelectedGovId(governorates[0].id)
    }
  }, [governorates, selectedGovId])

  // -- Calculations --
  const selectedGov = governorates.find((g: any) => g.id === selectedGovId)
  const selectedCity = selectedGov?.cities.find((c: any) => c.id === selectedCityId)
  
  let baseShippingCost = 0
  let isShippingCalculated = false

  if (selectedAddressId === "new") {
    if (selectedGov?.hideCities) {
      baseShippingCost = selectedGov.shippingCost || 0
      isShippingCalculated = true
    } else if (selectedCity) {
      baseShippingCost = selectedCity.shippingCost || 0
      isShippingCalculated = true
    }
  } else {
    // Find gov and city for selected or legacy address
    let searchGov = ""
    let searchCity = ""
    
    if (selectedAddressId === "legacy") {
      searchGov = user?.governorate || ""
      searchCity = user?.city || ""
    } else {
      const addr = user?.addresses?.find((a: any) => a.id === selectedAddressId)
      if (addr) {
        searchGov = addr.governorate || ""
        searchCity = addr.city || ""
      }
    }

    if (searchGov) {
      for (const gov of governorates) {
        if (gov.name === searchGov) {
          if (gov.hideCities) {
            baseShippingCost = gov.shippingCost || 0
            isShippingCalculated = true
            break
          }
          const c = gov.cities.find((city: any) => city.name === searchCity)
          if (c) {
            baseShippingCost = c.shippingCost || 0
            isShippingCalculated = true
            break
          }
        }
      }
    }
  }
  
  const hasThreshold = settings?.freeShippingThreshold !== null && settings?.freeShippingThreshold !== undefined;
  const isFreeShippingThresholdMet = hasThreshold && total >= settings.freeShippingThreshold!;
  const isFreeShippingCoupon = appliedCoupon?.type === "FREE_SHIPPING"
  
  const finalShippingCost = (isFreeShippingThresholdMet || isFreeShippingCoupon) ? 0 : baseShippingCost
  
  let discountAmount = 0
  if (appliedCoupon && appliedCoupon.type !== "FREE_SHIPPING") {
    if (appliedCoupon.type === "PERCENTAGE") {
      discountAmount = total * (appliedCoupon.value / 100)
    } else if (appliedCoupon.type === "FIXED") {
      discountAmount = appliedCoupon.value
    }
  }
  
  const finalTotal = Math.max(0, total + finalShippingCost - discountAmount)

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) return
    setIsValidatingCoupon(true)
    try {
      const res = await validateCoupon(couponCodeInput)
      if (res.error) {
        toast.error(res.error)
        setAppliedCoupon(null)
      } else {
        setAppliedCoupon(res.coupon)
        toast.success("تم تفعيل الكوبون بنجاح")
      }
    } catch (e) {
      toast.error("حدث خطأ أثناء تفعيل الكوبون")
    }
    setIsValidatingCoupon(false)
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (items.length === 0) {
      toast.error("سلة المشتريات فارغة")
      return
    }

    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    let finalPhone = ""
    let finalAddress = ""
    let finalCity = ""
    let finalGovName = ""



    if (selectedAddressId === "new") {
      finalAddress = formData.get("address") as string
      finalPhone = formData.get("customerPhone") as string
      if (!selectedGov || (!selectedCity && !selectedGov.hideCities)) {
        toast.error("يرجى اختيار المحافظة والمدينة")
        setIsSubmitting(false)
        return
      }
      finalGovName = selectedGov.name
      finalCity = selectedCity?.name || ""
    } else if (selectedAddressId === "legacy") {
      finalAddress = user?.address || ""
      finalCity = user?.city || ""
      finalGovName = user?.governorate || ""
      finalPhone = user?.phone || ""
    } else {
      const addr = user?.addresses?.find((a: any) => a.id === selectedAddressId)
      if (addr) {
        finalAddress = addr.address || ""
        finalCity = addr.city || ""
        finalGovName = addr.governorate || ""
        finalPhone = addr.phone || ""
      } else {
        toast.error("حدث خطأ في تحديد العنوان")
        setIsSubmitting(false)
        return
      }
    }

    const selectedPayment = paymentMethods.find((p: any) => p.id === selectedPaymentId)
    if (!selectedPayment) {
      toast.error("يرجى اختيار طريقة الدفع")
      setIsSubmitting(false)
      return
    }

    const data: any = {
      customerName: user?.name || guestName || "عميل",
      customerPhone: finalPhone,
      address: finalAddress,
      city: finalCity,
      governorate: finalGovName,
      paymentMethod: selectedPayment.name,
      shippingCost: finalShippingCost,
      discount: discountAmount,
      couponCode: appliedCoupon?.code,
      totalAmount: finalTotal,
      items: items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }))
    }
    
    if (user?.id) {
      data.userId = user.id
    }

    const result = await submitOrder(data)
    
    if (result.success && result.orderId) {
      clearCart()
      
      if (settings?.whatsappOrderEnabled && settings?.whatsappNumber) {
        const orderItems = items.map((item: any, i: number) => 
          `${i + 1}. ${item.name} × ${item.quantity} — ${item.price * item.quantity} ج.م`
        ).join('\n')
        
        const message = [
          `🛒 *طلب جديد #${result.orderId}*`,
          '',
          `👤 *بيانات العميل:*`,
          `الاسم: ${data.customerName}`,
          `الهاتف: ${data.customerPhone}`,
          `العنوان: ${data.address}`,
          `المنطقة: ${[data.governorate, data.city].filter(Boolean).join(' - ')}`,
          '',
          `📦 *المنتجات:*`,
          orderItems,
          '',
          `💰 *ملخص الطلب:*`,
          `المنتجات: ${total} ج.م`,
          data.shippingCost ? `الشحن: ${data.shippingCost} ج.م` : null,
          data.discount ? `الخصم: -${data.discount} ج.م` : null,
          `━━━━━━━━━━━━━━`,
          `الإجمالي: ${data.totalAmount} ج.م`,
          '',
          `💳 طريقة الدفع: ${data.paymentMethod}`,
        ].filter(Boolean).join('\n')
        
        const whatsappUrl = `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
        window.open(whatsappUrl, '_blank')
      }
      
      toast.success("تم إرسال طلبك بنجاح!")
      router.push(`/checkout/success/${result.orderId}`)
    } else {
      toast.error(result.error || "حدث خطأ أثناء معالجة الطلب")
      setIsSubmitting(false)
    }
  }

  if (!mounted) return null

  if (items.length === 0) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-muted-foreground opacity-50" />
        </div>
        <h1 className="text-3xl font-bold mb-4">سلة المشتريات فارغة</h1>
        <p className="text-muted-foreground mb-8 text-lg">لم تقم بإضافة أي منتجات للسلة بعد.</p>
        <Link prefetch={false} href="/products">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-8 h-14 text-lg">
            تصفح المنتجات
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 md:px-6 lg:px-8 py-12">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link prefetch={false} href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
        <ChevronRight className="w-4 h-4 rtl-flip" />
        <span className="text-foreground font-medium">إتمام الطلب</span>
      </nav>

      <h1 className="text-4xl font-bold tracking-tight text-foreground mb-12">إتمام الطلب</h1>

      <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Customer Details Form */}
        <div className="lg:col-span-7 space-y-8">
          {!user ? (
            <>
            <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-6">بيانات التوصيل</h2>
              
              {/* Login suggestion */}
              <div className="flex items-center justify-between p-4 mb-6 border border-primary/20 bg-primary/5 rounded-xl">
                <div>
                  <p className="font-medium">لديك حساب بالفعل؟</p>
                  <p className="text-sm text-muted-foreground">سجّل دخولك لتعبئة بياناتك تلقائياً</p>
                </div>
                <Button type="button" variant="outline" className="shrink-0" onClick={() => setAuthModalOpen(true)}>
                  تسجيل الدخول
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4 font-medium">أو أكمل طلبك كضيف:</p>
              
              <h3 className="font-bold mb-3 text-lg">عنوان التوصيل</h3>
              
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الاسم الكامل <span className="text-destructive">*</span></label>
                    <input 
                      name="guestName"
                      required
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="أدخل اسمك الكامل"
                      className="w-full h-12 bg-background border border-input rounded-xl px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">رقم الهاتف <span className="text-destructive">*</span></label>
                    <input 
                      name="customerPhone"
                      required
                      type="tel"
                      dir="ltr"
                      pattern="^01[0-9]{9}$"
                      maxLength={11}
                      placeholder="01XXXXXXXXX"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity("رقم الهاتف يجب أن يتكون من 11 رقم ويبدأ بـ 01")}
                      onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}
                      className="w-full h-12 bg-background border border-input rounded-xl px-4 text-right focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {governorates.length > 1 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">المحافظة <span className="text-destructive">*</span></label>
                      <select 
                        required
                        value={selectedGovId}
                        onChange={(e) => {
                          setSelectedGovId(e.target.value)
                          setSelectedCityId("")
                        }}
                        onInvalid={(e) => (e.target as HTMLSelectElement).setCustomValidity("يرجى اختيار المحافظة")}
                        onInput={(e) => (e.target as HTMLSelectElement).setCustomValidity("")}
                        className="w-full h-12 bg-background border border-input rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none"
                      >
                        <option value="" disabled>اختر المحافظة...</option>
                        {governorates.map((g: any) => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {(!selectedGov || !selectedGov.hideCities) && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">المدينة / المنطقة <span className="text-destructive">*</span></label>
                      <select 
                        required
                        disabled={!selectedGovId}
                        value={selectedCityId}
                        onChange={(e) => setSelectedCityId(e.target.value)}
                        onInvalid={(e) => (e.target as HTMLSelectElement).setCustomValidity("يرجى اختيار المدينة")}
                        onInput={(e) => (e.target as HTMLSelectElement).setCustomValidity("")}
                        className="w-full h-12 bg-background border border-input rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
                      >
                        <option value="" disabled>اختر المدينة...</option>
                        {selectedGov?.cities?.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">عنوان التوصيل بالتفصيل <span className="text-destructive">*</span></label>
                  <textarea 
                    name="address"
                    required
                    rows={3}
                    placeholder="اسم الحي، الشارع، رقم المبنى أو أي علامة مميزة"
                    onInvalid={(e) => (e.target as HTMLTextAreaElement).setCustomValidity("يرجى إدخال عنوان التوصيل بالتفصيل")}
                    onInput={(e) => (e.target as HTMLTextAreaElement).setCustomValidity("")}
                    className="w-full bg-background border border-input rounded-xl p-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none resize-none"
                  />
                </div>
              </div>
            </div>
            </>  
          ) : (
          <>
          <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">بيانات التوصيل</h2>
            
            {/* ADDRESSES */}
            <h3 className="font-bold mb-3 text-lg">عنوان التوصيل</h3>
            {hasSavedAddresses && (
              <div className="space-y-3 mb-4">
                {user.addresses.map((addr: any) => (
                  <div 
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-primary bg-primary/5' : 'border-border/50'}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedAddressId === addr.id ? 'border-primary' : 'border-muted-foreground'}`}>
                        {selectedAddressId === addr.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <span className="font-bold text-sm">{addr.title}</span>
                    </div>
                    <div className="mr-8 text-sm text-muted-foreground space-y-1">
                      <p>{addr.address}</p>
                      <p>{addr.city} {addr.city && addr.governorate ? ' - ' : ''} {addr.governorate}</p>
                      <p className="font-mono mt-1 text-foreground" dir="ltr">{addr.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!hasSavedAddresses && legacyHasAddress && (
              <div 
                className={`border-2 rounded-xl p-4 mb-4 cursor-pointer transition-colors ${selectedAddressId === "legacy" ? 'border-primary bg-primary/5' : 'border-border/50'}`}
                onClick={() => setSelectedAddressId("legacy")}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedAddressId === "legacy" ? 'border-primary' : 'border-muted-foreground'}`}>
                    {selectedAddressId === "legacy" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <span className="font-bold text-sm">العنوان المحفوظ</span>
                </div>
                <div className="mr-8 text-sm text-muted-foreground space-y-1">
                  <p>{user.address}</p>
                  <p>{user.city} - {user.governorate}</p>
                </div>
              </div>
            )}

            <div 
              className={`border-2 rounded-xl p-4 mb-6 cursor-pointer transition-colors ${selectedAddressId === "new" ? 'border-primary bg-primary/5' : 'border-border/50'}`}
              onClick={() => setSelectedAddressId("new")}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedAddressId === "new" ? 'border-primary' : 'border-muted-foreground'}`}>
                  {selectedAddressId === "new" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <span className="font-bold text-sm">استخدام عنوان جديد لطلب اليوم</span>
              </div>
            </div>

            {selectedAddressId === "new" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الاسم الكامل</label>
                    <input 
                      disabled
                      value={user?.name || ""}
                      className="w-full h-12 bg-muted border border-border/50 rounded-xl px-4 opacity-70 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">رقم الهاتف <span className="text-destructive">*</span></label>
                    <input 
                      name="customerPhone"
                      required
                      type="tel"
                      dir="ltr"
                      pattern="^01[0-9]{9}$"
                      maxLength={11}
                      placeholder="01XXXXXXXXX"
                      onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity("رقم الهاتف يجب أن يتكون من 11 رقم ويبدأ بـ 01")}
                      onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}
                      className="w-full h-12 bg-background border border-input rounded-xl px-4 text-right focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {governorates.length > 1 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">المحافظة <span className="text-destructive">*</span></label>
                      <select 
                        required
                        value={selectedGovId}
                        onChange={(e) => {
                          setSelectedGovId(e.target.value)
                          setSelectedCityId("")
                        }}
                        onInvalid={(e) => (e.target as HTMLSelectElement).setCustomValidity("يرجى اختيار المحافظة")}
                        onInput={(e) => (e.target as HTMLSelectElement).setCustomValidity("")}
                        className="w-full h-12 bg-background border border-input rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none"
                      >
                        <option value="" disabled>اختر المحافظة...</option>
                        {governorates.map((g: any) => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {(!selectedGov || !selectedGov.hideCities) && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">المدينة / المنطقة <span className="text-destructive">*</span></label>
                      <select 
                        required
                        disabled={!selectedGovId}
                        value={selectedCityId}
                        onChange={(e) => setSelectedCityId(e.target.value)}
                        onInvalid={(e) => (e.target as HTMLSelectElement).setCustomValidity("يرجى اختيار المدينة")}
                        onInput={(e) => (e.target as HTMLSelectElement).setCustomValidity("")}
                        className="w-full h-12 bg-background border border-input rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
                      >
                        <option value="" disabled>اختر المدينة...</option>
                        {selectedGov?.cities?.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {selectedAddressId === "new" && (
                  <div className="space-y-2 mt-6">
                    <label className="text-sm font-medium">عنوان التوصيل بالتفصيل <span className="text-destructive">*</span></label>
                    <textarea 
                      name="address"
                      required
                      rows={3}
                      placeholder="اسم الحي، الشارع، رقم المبنى أو أي علامة مميزة"
                      onInvalid={(e) => (e.target as HTMLTextAreaElement).setCustomValidity("يرجى إدخال عنوان التوصيل بالتفصيل")}
                      onInput={(e) => (e.target as HTMLTextAreaElement).setCustomValidity("")}
                      className="w-full bg-background border border-input rounded-xl p-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none resize-none"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">طريقة الدفع</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((pm: any) => (
                <div 
                  key={pm.id}
                  onClick={() => setSelectedPaymentId(pm.id)}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-colors flex flex-col gap-2 ${selectedPaymentId === pm.id ? 'border-primary bg-primary/5' : 'border-border/50 hover:bg-muted'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedPaymentId === pm.id ? 'border-primary' : 'border-muted-foreground'}`}>
                      {selectedPaymentId === pm.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <span className="font-bold">{pm.name}</span>
                  </div>
                </div>
              ))}
              {paymentMethods.length === 0 && (
                <p className="text-muted-foreground text-sm col-span-full">عذراً، لا تتوفر طرق دفع حالياً.</p>
              )}
            </div>

            {/* Selected Payment Instructions */}
            {paymentMethods.find((p: any) => p.id === selectedPaymentId)?.instructions && (
              <div className="mt-6 p-4 bg-muted/50 rounded-xl border border-border/50 animate-in fade-in slide-in-from-top-2">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {paymentMethods.find((p: any) => p.id === selectedPaymentId)?.instructions}
                </p>
                {paymentMethods.find((p: any) => p.id === selectedPaymentId)?.type === "INSTAPAY" && paymentMethods.find((p: any) => p.id === selectedPaymentId)?.accountInfo && (
                  <a 
                    href={paymentMethods.find((p: any) => p.id === selectedPaymentId)?.accountInfo}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 bg-[#2453E3] text-white px-4 py-2 rounded-lg mt-4 text-sm font-bold hover:bg-slate-800 transition-colors"
                  >
                    التوجه إلى الرابط
                  </a>
                )}
              </div>
            )}
          </div>
          </>
          )}
        </div>
        {/* Order Summary */}
        <div className="lg:col-span-5">
          <div className="border border-border/50 rounded-3xl p-6 md:p-8 sticky top-28 bg-card shadow-sm">
            <h2 
              className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex justify-between items-center cursor-pointer md:cursor-auto"
              onClick={() => setIsSummaryOpen(!isSummaryOpen)}
            >
              ملخص الطلب
              <ChevronDown className={`w-5 h-5 md:hidden transition-transform ${isSummaryOpen ? "rotate-180" : ""}`} />
            </h2>
            
            <div className={`space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin md:block ${isSummaryOpen ? "block" : "hidden"}`}>
              {items.map(item => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-background border border-border overflow-hidden shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-5 h-5 m-3.5 md:m-4 opacity-20" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs md:text-sm font-semibold line-clamp-1">{item.name}</h4>
                    <p className="text-[10px] md:text-xs text-muted-foreground mt-1">الكمية: {item.quantity}</p>
                  </div>
                  <div className="font-bold text-xs md:text-sm">
                    {(item.price * item.quantity).toFixed(2)} ج.م
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border/50 pt-6 space-y-4">
              
              {/* Coupon Input */}
              <div className="flex gap-2 w-full max-w-full">
                <input 
                  type="text" 
                  placeholder="كود الخصم" 
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value)}
                  disabled={!!appliedCoupon}
                  dir="ltr"
                  className="flex-1 min-w-0 h-12 bg-background border border-input rounded-xl px-4 text-right outline-none focus:border-primary disabled:opacity-50"
                />
                {!appliedCoupon ? (
                  <Button 
                    type="button" 
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon || !couponCodeInput.trim()}
                    className="h-12 px-4 sm:px-6 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 font-bold shrink-0"
                  >
                    {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "تطبيق"}
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    onClick={() => { setAppliedCoupon(null); setCouponCodeInput(""); }}
                    variant="destructive"
                    className="h-12 px-4 sm:px-6 rounded-xl font-bold shrink-0"
                  >
                    إلغاء
                  </Button>
                )}
              </div>
              
              {appliedCoupon && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg border border-green-200">
                  <Tag className="w-4 h-4" />
                  تم تطبيق كود الخصم: {appliedCoupon.code}
                </div>
              )}

              <div className="h-px bg-border/50 my-2" />

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span className="font-semibold">{total.toFixed(2)} ج.م</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>الخصم {appliedCoupon?.code ? `(${appliedCoupon.code})` : ''}</span>
                  <span className="font-bold">- {discountAmount.toFixed(2)} ج.م</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">الشحن</span>
                {!isShippingCalculated ? (
                  <span className="font-semibold text-muted-foreground">يحدد حسب العنوان</span>
                ) : finalShippingCost === 0 ? (
                  <span className="font-semibold text-primary">مجاني</span>
                ) : (
                  <span className="font-semibold">{finalShippingCost.toFixed(2)} ج.م</span>
                )}
              </div>
              
              {(isFreeShippingThresholdMet || isFreeShippingCoupon) && finalShippingCost === 0 && (
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-500/10 p-3 rounded-xl border-none">
                  <Truck className="w-4 h-4" />
                  أنت مؤهل للحصول على شحن مجاني!
                </div>
              )}

              <div className="h-px bg-border/50 my-2" />
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold">الإجمالي</span>
                <span className="text-2xl font-black text-primary">{finalTotal.toFixed(2)} ج.م</span>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-14 mt-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin ml-2" />
                  جاري تأكيد الطلب...
                </>
              ) : (
                "تأكيد الطلب الآن"
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground mt-4">
              بالضغط على تأكيد الطلب، أنت توافق على شروط وأحكام المتجر.
            </p>
          </div>
        </div>
        
      </form>
    </div>
  )
}
