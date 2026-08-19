"use client"
import React, { useState } from "react"
import { Plus, Edit2, Trash2, ShieldCheck, MapPin, CreditCard, Save, X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ImageUploader } from "@/components/ui/image-uploader"
import {
  createGovernorate, updateGovernorate, deleteGovernorate,
  createCity, updateCity, deleteCity,
  createPaymentMethod, updatePaymentMethod, deletePaymentMethod
} from "@/features/shipping-payment/actions"

export function ShippingPaymentClient({ initialGovernorates, initialPaymentMethods }: any) {
  const [activeTab, setActiveTab] = useState<'shipping' | 'payment'>('shipping')
  const [governorates, setGovernorates] = useState(initialGovernorates)
  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods)
  const [activeGovId, setActiveGovId] = useState<string | null>(governorates[0]?.id || null)

  // Modals / Inline states
  const [isAddingGov, setIsAddingGov] = useState(false)
  const [newGovName, setNewGovName] = useState("")

  const [isAddingCity, setIsAddingCity] = useState(false)
  const [newCityName, setNewCityName] = useState("")
  const [newCityCost, setNewCityCost] = useState("0")

  // Payment form states
  const [isPaymentFormVisible, setIsPaymentFormVisible] = useState(false)
  const [editingPayment, setEditingPayment] = useState<any>(null)
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false)
  const [paymentLogoUrl, setPaymentLogoUrl] = useState("")

  const [deleteModal, setDeleteModal] = useState<{ type: 'gov' | 'city' | 'payment', id: string, name?: string } | null>(null)

  // -- Governorate Handlers --
  const handleAddGov = async () => {
    if (!newGovName.trim()) return
    const name = newGovName
    setIsAddingGov(false)
    setNewGovName("")
    
    // Optimistic UI could be tricky if we don't have ID, so we wait for creation but without toast block
    try {
      const res = await createGovernorate({ name })
      setGovernorates((prev: any) => [...prev, { ...res, cities: [] }])
      if (!activeGovId) setActiveGovId(res.id)
      toast.success("تم إضافة المحافظة بنجاح")
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ أثناء الإضافة")
    }
  }

  // -- City Handlers --
  const handleAddCity = async (govId: string) => {
    if (!newCityName.trim() || !newCityCost) return
    const shippingCost = parseFloat(newCityCost)
    const name = newCityName
    
    setIsAddingCity(false)
    setNewCityName("")
    setNewCityCost("0")

    try {
      const res = await createCity({ name, shippingCost, governorateId: govId })
      setGovernorates((prev: any) => prev.map((g: any) => {
        if (g.id === govId) return { ...g, cities: [...g.cities, res] }
        return g
      }))
      toast.success("تم إضافة المدينة بنجاح")
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ أثناء الإضافة")
    }
  }

  const handleEditCity = async (city: any, newCost: number) => {
    // Optimistic update
    setGovernorates((prev: any) => prev.map((g: any) => {
      if (g.id === city.governorateId) {
        return { ...g, cities: g.cities.map((c: any) => c.id === city.id ? { ...c, shippingCost: newCost } : c) }
      }
      return g
    }))
    
    try {
      await updateCity(city.id, { shippingCost: newCost })
      toast.success("تم التحديث بنجاح")
    } catch (e: any) {
      // Revert if error (simplification: refetch or just alert)
      toast.error(e.message || "حدث خطأ، يرجى تحديث الصفحة")
    }
  }

  // -- Payment Method Handlers --
  const resetPaymentForm = () => {
    setEditingPayment(null)
    setPaymentLogoUrl("")
    const formEl = document.getElementById("payment-form") as HTMLFormElement
    if (formEl) formEl.reset()
  }

  const openEditPayment = (payment: any) => {
    setEditingPayment(payment)
    setIsPaymentFormVisible(true)
    setPaymentLogoUrl(payment.logoUrl || "")
    setTimeout(() => {
      const formEl = document.getElementById("payment-form") as HTMLFormElement
      if (formEl) {
        formEl.methodName.value = payment.name
        formEl.type.value = payment.type
        if (payment.type !== 'CASH_ON_DELIVERY') {
          formEl.accountInfo.value = payment.accountInfo || ""
          formEl.paymentLink.value = payment.paymentLink || ""
        }
      }
    }, 50)
  }

  const handlePaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmittingPayment(true)
    const formData = new FormData(e.currentTarget)
    const type = formData.get("type") as string
    const data: any = {
      name: formData.get("methodName") as string,
      type,
      accountInfo: type !== 'CASH_ON_DELIVERY' ? formData.get("accountInfo") as string : undefined,
      paymentLink: type !== 'CASH_ON_DELIVERY' ? formData.get("paymentLink") as string : undefined,
      logoUrl: paymentLogoUrl
    }

    try {
      if (editingPayment) {
        const res = await updatePaymentMethod(editingPayment.id, data)
        setPaymentMethods((prev: any) => prev.map((p: any) => p.id === editingPayment.id ? res : p))
        toast.success("تم التعديل بنجاح")
      } else {
        const res = await createPaymentMethod(data)
        setPaymentMethods((prev: any) => [...prev, res])
        toast.success("تمت الإضافة بنجاح")
      }
      resetPaymentForm()
      setIsPaymentFormVisible(false)
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ")
    }
    setIsSubmittingPayment(false)
  }

  const confirmDelete = async () => {
    if (!deleteModal) return
    const { type, id } = deleteModal
    setDeleteModal(null)
    
    try {
      if (type === 'gov') {
        const previous = [...governorates]
        const newGovs = governorates.filter((g: any) => g.id !== id)
        setGovernorates(newGovs)
        if (activeGovId === id) setActiveGovId(newGovs[0]?.id || null)
        await deleteGovernorate(id).catch(() => setGovernorates(previous))
      } else if (type === 'city') {
        setGovernorates((prev: any) => prev.map((g: any) => ({ ...g, cities: g.cities.filter((c: any) => c.id !== id) })))
        await deleteCity(id)
      } else if (type === 'payment') {
        const previous = [...paymentMethods]
        setPaymentMethods((prev: any) => prev.filter((p: any) => p.id !== id))
        await deletePaymentMethod(id).catch(() => setPaymentMethods(previous))
      }
      toast.success("تم الحذف بنجاح")
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ أثناء الحذف")
    }
  }

  const activeGov = governorates.find((g: any) => g.id === activeGovId)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-6 relative items-start">
        {/* Tabs Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex overflow-x-auto md:flex-col gap-2 md:gap-1 pb-2 md:pb-0 scrollbar-hide md:sticky md:top-4 border-b md:border-b-0 border-border/50">
          <button
            onClick={() => setActiveTab('shipping')}
            className={`shrink-0 flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'shipping' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            <MapPin className="w-5 h-5" />
            <span className="whitespace-nowrap">الشحن والمحافظات</span>
          </button>
          
          <button
            onClick={() => setActiveTab('payment')}
            className={`shrink-0 flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'payment' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="whitespace-nowrap">طرق الدفع</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'shipping' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              {/* Governorates Sidebar */}
              <div className="lg:col-span-1 border border-border/50 rounded-xl bg-card overflow-hidden flex flex-col lg:max-h-[85vh] lg:sticky lg:top-4 shadow-sm">
                <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/5">
                  <h3 className="font-bold">المحافظات</h3>
                  <Button size="icon" variant="ghost" onClick={() => setIsAddingGov(!isAddingGov)} className="h-8 w-8 text-muted-foreground">
                    {isAddingGov ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </Button>
                </div>
                
                {isAddingGov && (
                  <div className="p-3 border-b border-border/50 bg-muted/10 space-y-2 animate-in slide-in-from-top-2">
                    <input 
                      type="text"
                      placeholder="اسم المحافظة..."
                      value={newGovName}
                      onChange={e => setNewGovName(e.target.value)}
                      className="w-full text-sm bg-background border border-input rounded-md px-3 py-2 outline-none focus:border-primary"
                      autoFocus
                      onKeyDown={(e) => { if(e.key === 'Enter') handleAddGov() }}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 h-8 text-xs" onClick={handleAddGov}>حفظ</Button>
                      <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => setIsAddingGov(false)}>إلغاء</Button>
                    </div>
                  </div>
                )}

                <div className="overflow-y-auto flex-1 p-2 space-y-1">
                  {governorates.map((g: any) => (
                    <div 
                      key={g.id} 
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${activeGovId === g.id ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted'}`}
                      onClick={() => setActiveGovId(g.id)}
                    >
                      <span className="font-medium text-sm truncate">{g.name}</span>
                      <div className="flex items-center opacity-70 hover:opacity-100">
                        <button onClick={(e) => { e.stopPropagation(); setDeleteModal({ type: 'gov', id: g.id, name: g.name }); }} className={`p-1 ${activeGovId === g.id ? 'hover:text-primary-foreground/70' : 'hover:text-red-500'}`}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {governorates.length === 0 && <p className="text-center text-xs text-muted-foreground py-4">لا توجد محافظات</p>}
                </div>
              </div>

              {/* Cities Content */}
              <div className="lg:col-span-3 border border-border/50 rounded-xl bg-card shadow-sm">
                {activeGov ? (
                  <>
                    <div className="p-4 sm:p-6 border-b border-border/50 flex flex-col gap-4 bg-muted/5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold">إعدادات المحافظة - {activeGov.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">قم بضبط إعدادات الشحن للمحافظة أو أضف مدن بتسعيرة مختلفة.</p>
                        </div>
                        <Button onClick={() => setIsAddingCity(!isAddingCity)} variant={isAddingCity ? "ghost" : "default"} className="gap-2 shrink-0">
                          {isAddingCity ? <><X className="w-4 h-4" /> إلغاء الإضافة</> : <><Plus className="w-4 h-4" /> إضافة مدينة</>}
                        </Button>
                      </div>

                      <div className="bg-background border rounded-lg p-4 space-y-4 shadow-sm mt-2">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <h4 className="font-semibold text-sm">سعر الشحن الموحد للمحافظة (ج.م)</h4>
                            <p className="text-xs text-muted-foreground">سيتم تطبيق هذا السعر في حال لم يتم تحديد مدينة، أو إذا تم إخفاء المدن.</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              className="w-24 text-sm bg-background border border-input rounded-md px-3 py-2 outline-none focus:border-primary text-left"
                              dir="ltr"
                              defaultValue={activeGov.shippingCost || 0}
                              onBlur={async (e) => {
                                const val = parseFloat(e.target.value) || 0
                                if (val !== activeGov.shippingCost) {
                                  try {
                                    const res = await updateGovernorate(activeGov.id, { shippingCost: val })
                                    setGovernorates((prev: any) => prev.map((g: any) => g.id === activeGov.id ? { ...g, shippingCost: val } : g))
                                    toast.success("تم تحديث السعر بنجاح")
                                  } catch(e) { toast.error("فشل التحديث") }
                                }
                              }}
                            />
                          </div>
                        </div>

                        <div className="border-t pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <h4 className="font-semibold text-sm">إخفاء حقل المدن</h4>
                            <p className="text-xs text-muted-foreground">تفعيل هذا الخيار سيخفي حقل اختيار المدينة في صفحة الدفع للعملاء من هذه المحافظة.</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={activeGov.hideCities || false}
                              onChange={async (e) => {
                                const val = e.target.checked
                                // Optimistic update
                                setGovernorates((prev: any) => prev.map((g: any) => g.id === activeGov.id ? { ...g, hideCities: val } : g))
                                try {
                                  await updateGovernorate(activeGov.id, { hideCities: val })
                                  toast.success(val ? "تم إخفاء المدن" : "تم إظهار المدن")
                                } catch(e) { 
                                  toast.error("فشل التحديث") 
                                  // Revert
                                  setGovernorates((prev: any) => prev.map((g: any) => g.id === activeGov.id ? { ...g, hideCities: !val } : g))
                                }
                              }}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2453E3]"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {isAddingCity && (
                      <div className="p-4 bg-muted/10 border-b border-border/50 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end animate-in fade-in">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold">اسم المدينة</label>
                          <input 
                            type="text" 
                            value={newCityName}
                            onChange={e => setNewCityName(e.target.value)}
                            className="w-full text-sm bg-background border border-input rounded-md px-3 py-2 outline-none focus:border-primary"
                            placeholder="مثال: مدينة نصر"
                            autoFocus
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold">سعر الشحن (ج.م)</label>
                          <input 
                            type="number" 
                            value={newCityCost}
                            onChange={e => setNewCityCost(e.target.value)}
                            className="w-full text-sm bg-background border border-input rounded-md px-3 py-2 outline-none focus:border-primary"
                            onKeyDown={(e) => { if(e.key === 'Enter') handleAddCity(activeGov.id) }}
                          />
                        </div>
                        <Button onClick={() => handleAddCity(activeGov.id)} className="w-full">حفظ المدينة</Button>
                      </div>
                    )}

                    <div className="p-0 overflow-x-auto">
                      <table className="w-full text-sm text-right">
                        <thead className="bg-muted/30 text-muted-foreground border-b border-border/50">
                          <tr>
                            <th className="px-6 py-4 font-semibold">المدينة</th>
                            <th className="px-6 py-4 font-semibold">سعر الشحن (ج.م)</th>
                            <th className="px-6 py-4 font-semibold w-24 text-center">حذف</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeGov.cities.map((city: any) => (
                            <tr key={city.id} className="border-b border-border/30 hover:bg-muted/10">
                              <td className="px-6 py-4 font-medium">{city.name}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2 w-32">
                                  <input 
                                    type="number" 
                                    defaultValue={city.shippingCost}
                                    onBlur={(e) => {
                                      const val = parseFloat(e.target.value)
                                      if (!isNaN(val) && val !== city.shippingCost) {
                                        handleEditCity(city, val)
                                      }
                                    }}
                                    className="w-full h-8 bg-background border border-input rounded px-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                  />
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button onClick={() => setDeleteModal({ type: 'city', id: city.id, name: city.name })} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors inline-block">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {activeGov.cities.length === 0 && (
                            <tr>
                              <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                                لا توجد مدن مضافة في هذه المحافظة.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                    <MapPin className="w-12 h-12 mb-4 opacity-20" />
                    <p>يرجى اختيار محافظة أو إضافة واحدة جديدة.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Payment List */}
              <div className="flex-1 w-full bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/5">
                  <div>
                    <h2 className="text-lg font-semibold">طرق الدفع المتاحة</h2>
                    <p className="text-sm text-muted-foreground">أضف طرق دفع لعملائك لإتمام طلباتهم.</p>
                  </div>
                  <Button onClick={() => { resetPaymentForm(); setIsPaymentFormVisible(!isPaymentFormVisible); }} className="gap-2" variant={isPaymentFormVisible && !editingPayment ? "ghost" : "default"}>
                    {isPaymentFormVisible && !editingPayment ? <><X className="w-4 h-4" /> إلغاء</> : <><Plus className="w-4 h-4" /> إضافة طريقة الدفع</>}
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-right">
                    <thead className="bg-muted/30 text-muted-foreground">
                      <tr>
                        <th className="px-4 py-4">اسم الطريقة</th>
                        <th className="px-4 py-4">النوع</th>
                        <th className="px-4 py-4">بيانات الحساب</th>
                        <th className="px-4 py-4 w-24 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentMethods.map((p: any) => (
                        <tr key={p.id} className="border-b border-border/30 hover:bg-muted/10">
                          <td className="px-4 py-4 font-bold">{p.name}</td>
                          <td className="px-4 py-4">
                            <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 font-semibold">
                              {p.type === 'CASH_ON_DELIVERY' ? 'الدفع عند الاستلام' : p.type === 'VODAFONE_CASH' ? 'فودافون كاش' : p.type === 'INSTAPAY' ? 'انستاباي' : 'تحويل بنكي'}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {p.type !== 'CASH_ON_DELIVERY' ? (
                              <div className="text-xs text-muted-foreground space-y-1">
                                {p.accountInfo && <div>رقم المحفظة / الحساب: <span className="font-medium text-foreground" dir="ltr">{p.accountInfo}</span></div>}
                                {p.paymentLink && <div>الرابط: <a href={p.paymentLink} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-500 hover:underline" dir="ltr">{p.paymentLink}</a></div>}
                              </div>
                            ) : <span className="text-muted-foreground text-xs">-</span>}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => openEditPayment(p)} className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => setDeleteModal({ type: 'payment', id: p.id, name: p.name })} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {paymentMethods.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">لا توجد طرق دفع.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Sticky Form */}
              <div className={`w-full lg:w-[380px] shrink-0 lg:sticky lg:top-4 transition-all duration-300 block opacity-100`}>
                <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden flex flex-col max-h-[85vh]">
                  <div className="border-b border-border/50 px-6 py-4 bg-muted/5 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight">{editingPayment ? "تعديل طريقة الدفع" : "إضافة طريقة جديدة"}</h2>
                      <p className="text-xs text-muted-foreground mt-1">أدخل بيانات وسيلة الدفع.</p>
                    </div>
                    {editingPayment && (
                      <Button variant="ghost" size="icon" onClick={() => { resetPaymentForm(); setIsPaymentFormVisible(false); }} className="h-8 w-8 text-muted-foreground">
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="p-6">
                    <form id="payment-form" onSubmit={handlePaymentSubmit} className="space-y-4">
                      <div className="flex justify-center mb-4">
                        <div className="w-32">
                          <ImageUploader 
                            label="شعار الدفع" 
                            value={paymentLogoUrl} 
                            onChange={setPaymentLogoUrl} 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">اسم الطريقة <span className="text-red-500">*</span></label>
                        <input name="methodName" type="text" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-primary" placeholder="مثال: انستاباي" />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">النوع <span className="text-red-500">*</span></label>
                        <select name="type" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-primary" onChange={(e) => {
                          const formEl = e.target.form;
                          if (formEl) {
                            const isCash = e.target.value === 'CASH_ON_DELIVERY';
                            const fields = formEl.querySelectorAll('.payment-account-field');
                            fields.forEach(f => f.classList.toggle('hidden', isCash));
                          }
                        }}>
                          <option value="ELECTRONIC_WALLET">محفظة إلكترونية أو انستاباي</option>
                          <option value="BANK_TRANSFER">تحويل بنكي</option>
                          <option value="CASH_ON_DELIVERY">الدفع عند الاستلام</option>
                        </select>
                      </div>

                      <div className="space-y-2 payment-account-field">
                        <label className="text-sm font-medium">رقم المحفظة / الحساب (اختياري)</label>
                        <input name="accountInfo" type="text" dir="ltr" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-primary text-left" placeholder="010..." />
                      </div>

                      <div className="space-y-2 payment-account-field">
                        <label className="text-sm font-medium">رابط الدفع (اختياري)</label>
                        <input name="paymentLink" type="url" dir="ltr" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-primary text-left" placeholder="https://..." />
                      </div>

                      <div className="pt-4">
                        <Button type="submit" disabled={isSubmittingPayment} className="w-full gap-2">
                          <Save className="w-4 h-4" />
                          {isSubmittingPayment ? "جاري الحفظ..." : "حفظ"}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-sm rounded-2xl shadow-xl border border-border/50 overflow-hidden animate-in zoom-in-95">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">تأكيد الحذف</h3>
              <p className="text-sm text-muted-foreground">
                هل أنت متأكد من حذف {deleteModal.name ? `"${deleteModal.name}"` : "هذا العنصر"} نهائياً؟
              </p>
            </div>
            <div className="flex border-t border-border/50">
              <button 
                onClick={() => setDeleteModal(null)}
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
