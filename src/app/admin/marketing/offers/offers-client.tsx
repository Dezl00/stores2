"use client"
import React, { useState } from "react"
import { Plus, Edit2, Trash2, Ticket, Settings, Save, AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { createCoupon, updateCoupon, deleteCoupon, updateOfferSettings } from "@/features/offers/actions"
import { usePermissions } from "@/hooks/use-permissions"

export function OffersClient({ initialCoupons, initialSettings }: any) {
  const { hasPermission } = usePermissions()
  const canAdd = hasPermission("offers.add")
  const canEdit = hasPermission("offers.edit")
  const canDelete = hasPermission("offers.delete")

  const [activeTab, setActiveTab] = useState<'coupons' | 'settings'>('coupons')
  const [coupons, setCoupons] = useState(initialCoupons)
  const [settings, setSettings] = useState(initialSettings || {})
  const [deleteModalOpen, setDeleteModalOpen] = useState<string | null>(null)

  // Form states
  const [editingCoupon, setEditingCoupon] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Optimistic UI handlers (no blocking toast.loading)
  const handleUpdateCouponStatus = async (id: string, isActive: boolean) => {
    // Optimistic update
    setCoupons((prev: any) => prev.map((c: any) => c.id === id ? { ...c, isActive } : c))
    try {
      await updateCoupon(id, { isActive })
      toast.success("تم الحفظ بنجاح")
    } catch (e: any) {
      // Revert on error
      setCoupons((prev: any) => prev.map((c: any) => c.id === id ? { ...c, isActive: !isActive } : c))
      toast.error(e.message || "حدث خطأ")
    }
  }

  const confirmDelete = async () => {
    if (!deleteModalOpen) return
    const id = deleteModalOpen
    setDeleteModalOpen(null)
    
    // Optimistic update
    const previousCoupons = [...coupons]
    setCoupons((prev: any) => prev.filter((c: any) => c.id !== id))
    
    try {
      await deleteCoupon(id)
      toast.success("تم الحذف بنجاح")
    } catch (e: any) {
      setCoupons(previousCoupons)
      toast.error(e.message || "حدث خطأ")
    }
  }

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await updateOfferSettings(settings)
      toast.success("تم حفظ الإعدادات بنجاح")
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء الحفظ")
    }
    setIsSubmitting(false)
  }

  const resetForm = () => {
    setEditingCoupon(null)
    const formEl = document.getElementById("coupon-form") as HTMLFormElement
    if (formEl) formEl.reset()
  }

  const openEdit = (coupon: any) => {
    setEditingCoupon(coupon)
    setTimeout(() => {
      const formEl = document.getElementById("coupon-form") as HTMLFormElement
      if (formEl) {
        formEl.code.value = coupon.code
        formEl.type.value = coupon.type
        formEl.value.value = coupon.value
        formEl.maxUses.value = coupon.maxUses || ""
      }
    }, 50)
  }

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      code: (formData.get("code") as string).toUpperCase(),
      type: formData.get("type") as string,
      value: parseFloat(formData.get("value") as string),
      maxUses: formData.get("maxUses") ? parseInt(formData.get("maxUses") as string) : null,
      isActive: editingCoupon ? editingCoupon.isActive : true
    }

    try {
      if (editingCoupon) {
        const res = await updateCoupon(editingCoupon.id, data)
        setCoupons((prev: any) => prev.map((c: any) => c.id === editingCoupon.id ? res : c))
        toast.success("تم التعديل بنجاح")
      } else {
        const res = await createCoupon(data)
        setCoupons((prev: any) => [res, ...prev])
        toast.success("تمت الإضافة بنجاح")
      }
      resetForm()
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ")
    }
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Tabs Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex overflow-x-auto md:flex-col gap-2 md:gap-1 pb-2 md:pb-0 scrollbar-hide">
          <button
            onClick={() => setActiveTab('coupons')}
            className={`shrink-0 flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'coupons' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            <Ticket className="w-5 h-5" />
            <span className="whitespace-nowrap">أكواد الخصم</span>
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`shrink-0 flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            <Settings className="w-5 h-5" />
            <span className="whitespace-nowrap">إعدادات العروض</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          
          {/* Coupons Tab */}
          {activeTab === 'coupons' && (
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              
              {/* Main List Column */}
              <div className="flex-1 w-full bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                  <div>
                    <h2 className="text-lg font-semibold">أكواد الخصم</h2>
                    <p className="text-sm text-muted-foreground">أضف كوبونات وأكواد خصم لعملائك.</p>
                  </div>
                </div>
                
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm text-right">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">كود الخصم</th>
                        <th className="px-4 py-3">النوع</th>
                        <th className="px-4 py-3">القيمة</th>
                        <th className="px-4 py-3">الحالة</th>
                        <th className="px-4 py-3 w-24 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((coupon: any) => (
                        <tr key={coupon.id} className="border-b border-border/30 hover:bg-muted/20">
                          <td className="px-4 py-4 font-bold text-slate-700" dir="ltr">{coupon.code}</td>
                          <td className="px-4 py-4">
                            <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 font-semibold">
                              {coupon.type === "PERCENTAGE" ? "نسبة مئوية %" : coupon.type === "FIXED" ? "مبلغ ثابت" : "شحن مجاني"}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-bold">{coupon.value} {coupon.type === "PERCENTAGE" ? "%" : "ج.م"}</td>
                          <td className="px-4 py-4 text-center flex justify-center items-center">
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={coupon.isActive}
                                disabled={!canEdit}
                                onChange={(e) => handleUpdateCouponStatus(coupon.id, e.target.checked)}
                              />
                              <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2453E3] disabled:opacity-50"></div>
                            </label>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-2">
                              {canEdit && (
                                <button onClick={() => openEdit(coupon)} className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              )}
                              {canDelete && (
                                <button onClick={() => setDeleteModalOpen(coupon.id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {coupons.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">لا توجد كوبونات خصم.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View */}
                <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
                  {coupons.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground bg-muted/5 rounded-lg border border-border/50">
                      لا توجد كوبونات خصم.
                    </div>
                  ) : (
                    coupons.map((coupon: any) => (
                      <div key={coupon.id} className="bg-card border border-border/50 rounded-lg p-4 shadow-sm flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="font-bold text-slate-800 text-lg" dir="ltr">{coupon.code}</div>
                          <div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={coupon.isActive}
                                disabled={!canEdit}
                                onChange={(e) => handleUpdateCouponStatus(coupon.id, e.target.checked)}
                              />
                              <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2453E3] disabled:opacity-50"></div>
                            </label>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">النوع:</span>
                            <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 font-semibold">
                              {coupon.type === "PERCENTAGE" ? "نسبة مئوية %" : coupon.type === "FIXED" ? "مبلغ ثابت" : "شحن مجاني"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">القيمة:</span>
                            <span className="font-bold">{coupon.value} {coupon.type === "PERCENTAGE" ? "%" : "ج.م"}</span>
                          </div>
                        </div>

                        {(canEdit || canDelete) && (
                          <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                            {canEdit && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 text-muted-foreground hover:text-slate-800"
                                onClick={() => {
                                  openEdit(coupon);
                                  document.getElementById('coupon-form')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                              >
                                <Edit2 className="h-4 w-4 ml-2" />
                                تعديل
                              </Button>
                            )}
                            {canDelete && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20"
                                onClick={() => setDeleteModalOpen(coupon.id)}
                              >
                                <Trash2 className="h-4 w-4 ml-2" />
                                حذف
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Sticky Form Column */}
              {canAdd && (
                <div className="w-full lg:w-[380px] shrink-0 lg:sticky lg:top-4 transition-all duration-300 block opacity-100">
                  <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden flex flex-col">
                  <div className="border-b border-border/50 px-6 py-4 bg-muted/5 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight">{editingCoupon ? "تعديل الكوبون" : "إضافة كوبون جديد"}</h2>
                      <p className="text-xs text-muted-foreground mt-1">أدخل تفاصيل كود الخصم الجديد.</p>
                    </div>
                    {editingCoupon && (
                      <Button variant="ghost" size="icon" onClick={() => { resetForm(); }} className="h-8 w-8 text-muted-foreground">
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <form id="coupon-form" onSubmit={handleFormSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">كود الخصم <span className="text-red-500">*</span></label>
                        <input name="code" type="text" required dir="ltr" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-primary uppercase text-left" placeholder="مثال: SALE20" />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">نوع الخصم</label>
                        <select name="type" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-primary">
                          <option value="PERCENTAGE">نسبة مئوية (%)</option>
                          <option value="FIXED">مبلغ ثابت</option>
                          <option value="FREE_SHIPPING">شحن مجاني</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">قيمة الخصم <span className="text-red-500">*</span></label>
                        <input name="value" type="number" step="0.01" required dir="ltr" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-primary text-left" defaultValue={10} />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">أقصى حد للاستخدام <span className="text-muted-foreground text-xs font-normal">(اختياري)</span></label>
                        <input name="maxUses" type="number" min="1" dir="ltr" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-primary text-left" placeholder="اتركه فارغاً لجعله غير محدود" />
                      </div>

                      <div className="pt-4">
                        <Button type="submit" disabled={isSubmitting} className="w-full h-11 text-base">
                          {isSubmitting ? "جاري الحفظ..." : (editingCoupon ? "حفظ التعديلات" : "إضافة الكوبون")}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-card border border-border/50 rounded-xl shadow-sm p-6 min-h-[500px]">
              <div className="mb-6">
                <h2 className="text-xl font-bold">إعدادات العروض</h2>
                <p className="text-sm text-muted-foreground">تخصيص إعدادات الشحن المجاني والنوافذ المنبثقة الترويجية.</p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-8 max-w-2xl">
                {/* Free Shipping Block */}
                <div className="p-5 bg-muted/10 border border-border/50 rounded-xl space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-primary" />
                    الشحن المجاني
                  </h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">حد الشحن المجاني التلقائي (ج.م)</label>
                    <input 
                      type="number" 
                      value={settings.freeShippingThreshold || ""}
                      onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value ? parseFloat(e.target.value) : null })}
                      className="w-full h-11 bg-background border border-input rounded-md px-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                      placeholder="مثال: 500 (اتركه فارغاً للتعطيل)"
                    />
                    <p className="text-xs text-muted-foreground">سيحصل العميل على شحن مجاني إذا تجاوز إجمالي السلة هذا المبلغ.</p>
                  </div>
                </div>

                {/* Promo Popup Block */}
                <div className="p-5 bg-muted/10 border border-border/50 rounded-xl space-y-5">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    النافذة الترويجية (Promo Popup)
                  </h3>
                  
                  <label className="flex items-center gap-3 cursor-pointer p-3 bg-background border border-input rounded-lg hover:border-primary transition-colors">
                    <input 
                      type="checkbox"
                      checked={settings.promoPopupEnabled || false}
                      onChange={(e) => setSettings({ ...settings, promoPopupEnabled: e.target.checked })}
                      className="w-5 h-5 text-primary rounded focus:ring-primary"
                    />
                    <div>
                      <div className="font-medium">تفعيل النافذة الترويجية</div>
                      <div className="text-xs text-muted-foreground">تظهر للزوار الجدد لتقديم عروض خاصة أو أكواد خصم.</div>
                    </div>
                  </label>

                  {settings.promoPopupEnabled && (
                    <div className="grid gap-4 pt-2 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">عنوان النافذة</label>
                        <input 
                          type="text" 
                          value={settings.promoPopupTitle || ""}
                          onChange={(e) => setSettings({ ...settings, promoPopupTitle: e.target.value })}
                          className="w-full h-10 bg-background border border-input rounded-md px-3 text-sm focus:border-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">الوصف والنص</label>
                        <textarea 
                          value={settings.promoPopupDescription || ""}
                          onChange={(e) => setSettings({ ...settings, promoPopupDescription: e.target.value })}
                          className="w-full h-24 bg-background border border-input rounded-md p-3 text-sm focus:border-primary resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">كود الخصم المرتبط</label>
                          <select 
                            value={settings.promoPopupCode || ""}
                            onChange={(e) => setSettings({ ...settings, promoPopupCode: e.target.value })}
                            className="w-full h-10 bg-background border border-input rounded-md px-3 text-sm focus:border-primary uppercase dir-ltr"
                          >
                            <option value="">-- بدون كود خصم --</option>
                            {coupons.map((c: any) => (
                              <option key={c.id} value={c.code}>{c.code}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">تأخير الظهور (ثواني)</label>
                          <input 
                            type="number" 
                            value={settings.promoPopupDelay || 3}
                            onChange={(e) => setSettings({ ...settings, promoPopupDelay: parseInt(e.target.value) })}
                            className="w-full h-10 bg-background border border-input rounded-md px-3 text-sm focus:border-primary dir-ltr"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  {canEdit && (
                    <Button type="submit" disabled={isSubmitting} className="gap-2 px-8">
                      <Save className="w-4 h-4" />
                      {isSubmitting ? "جاري الحفظ..." : "حفظ الإعدادات"}
                    </Button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-sm rounded-2xl shadow-xl border border-border/50 overflow-hidden animate-in zoom-in-95">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">تأكيد الحذف</h3>
              <p className="text-sm text-muted-foreground">
                هل أنت متأكد من حذف هذا الكوبون نهائياً؟
              </p>
            </div>
            <div className="flex border-t border-border/50">
              <button 
                onClick={() => setDeleteModalOpen(null)}
                className="flex-1 py-4 font-semibold text-muted-foreground hover:bg-muted/50 transition-colors border-l border-border/50"
              >
                إلغاء
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-4 font-bold text-red-500 hover:bg-red-50 transition-colors"
              >
                حذف نهائياً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
