"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Printer, User, Box, MapPin, Phone, Mail, CheckCircle2, XCircle, Truck, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { updateOrderStatus } from "@/features/orders/actions"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function OrderDetailsClient({ order, logoUrl, storeName, branches = [] }: { order: any, logoUrl?: string | null, storeName?: string, branches?: any[] }) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [customerModalOpen, setCustomerModalOpen] = useState(false)

  const statusLabels: Record<string, string> = {
    "PENDING": "قيد المراجعة",
    "CONFIRMED": "تم التأكيد",
    "SHIPPED": "جاري الشحن",
    "OUT_FOR_DELIVERY": "خرج للتوصيل",
    "DELIVERED": "تم التوصيل",
    "CANCELLED": "ملغي"
  }

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true)
    const res = await updateOrderStatus(order.id, newStatus)
    setIsUpdating(false)
    if (res.success) {
      toast.success("تم التحديث بنجاح")
      router.refresh()
    } else {
      toast.error(res.error || "حدث خطأ أثناء التحديث")
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const enNumber = (num: number) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const enDate = (dateString: string) => {
    const d = new Date(dateString)
    return `${d.toLocaleDateString('en-GB')} ${d.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' })}`
  }

  return (
    <div className="space-y-6">
      
      {/* --- Screen Only UI --- */}
      <div className="print:hidden">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2">
            <ArrowRight className="w-4 h-4" />
            عودة للطلبات
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setCustomerModalOpen(true)} className="gap-2">
              <User className="w-4 h-4" />
              تفاصيل العميل
            </Button>
            <Button onClick={handlePrint} className="gap-2 bg-[#2453E3] text-white hover:opacity-90">
              <Printer className="w-4 h-4" />
              طباعة الطلب
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card border border-border shadow-sm rounded-xl p-6">
              <div className="flex items-start justify-between border-b border-border/50 pb-4 mb-4">
                <div>
                  <h2 className="text-lg font-bold">الطلب <span className="font-sans text-primary font-bold ml-1" dir="ltr">#{order.id.slice(-6).toUpperCase()}</span></h2>
                  <p className="text-sm text-muted-foreground mt-1 font-sans" dir="ltr">{enDate(order.createdAt)}</p>
                </div>
                <div className="text-left">
                  <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-semibold rounded-full bg-primary/10 text-primary">
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="text-muted-foreground border-b border-border/50">
                    <tr>
                      <th className="py-3 font-medium">المنتج</th>
                      <th className="py-3 font-medium text-center">الكمية</th>
                      <th className="py-3 font-medium text-left">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {order.items.map((item: any) => (
                      <tr key={item.id}>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-muted rounded-md overflow-hidden shrink-0">
                              {item.product?.images?.[0]?.url && (
                                <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold">{item.product?.name || "منتج غير معروف"}</p>
                              <p className="text-xs text-muted-foreground font-sans mt-0.5" dir="ltr">{enNumber(item.price)} EGP</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-center font-sans font-medium" dir="ltr">{item.quantity}</td>
                        <td className="py-4 text-left font-sans font-bold text-primary" dir="ltr">
                          {enNumber(item.price * item.quantity)} EGP
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 pt-6 border-t border-border/50 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span className="font-sans font-medium" dir="ltr">{enNumber(order.totalAmount - (order.shippingCost || 0) + (order.discount || 0))} EGP</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">تكلفة الشحن</span>
                  <span className="font-sans font-medium" dir="ltr">{enNumber(order.shippingCost || 0)} EGP</span>
                </div>
                {(order.discount > 0) && (
                  <div className="flex justify-between text-sm text-destructive">
                    <span>الخصم</span>
                    <span className="font-sans font-medium" dir="ltr">-{enNumber(order.discount)} EGP</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-border/50 pt-3">
                  <span>الإجمالي</span>
                  <span className="font-sans text-primary" dir="ltr">{enNumber(order.totalAmount)} EGP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-card border border-border shadow-sm rounded-xl p-6">
              <h3 className="font-bold mb-4">إجراءات الطلب</h3>
              <div className="flex flex-col gap-2 w-full">
              {['PENDING', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((s) => (
                <Button 
                  key={s}
                  variant={order.status === s ? "default" : "outline"}
                  onClick={() => handleStatusUpdate(s)}
                  disabled={isUpdating || order.status === s}
                  className={`w-full justify-start ${order.status === s ? 'bg-primary pointer-events-none' : ''}`}
                >
                  {statusLabels[s] || s}
                </Button>
              ))}
              <Button 
                variant={order.status === 'CANCELLED' ? "destructive" : "outline"}
                className={`w-full justify-start ${order.status === 'CANCELLED' ? 'pointer-events-none' : 'text-destructive border-destructive/20 hover:bg-destructive/10'}`}
                onClick={() => handleStatusUpdate('CANCELLED')}
                disabled={isUpdating || order.status === 'CANCELLED'}
              >
                إلغاء الطلب
              </Button>
            </div>
            </div>
            
            <div className="bg-card border border-border shadow-sm rounded-xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2"><MapPin className="w-4 h-4" /> بيانات الطلب</h3>
              <div className="text-sm space-y-2 text-muted-foreground">
                {order.customerName && <p><span className="text-foreground font-medium">الاسم:</span> {order.customerName}</p>}
                <p><span className="text-foreground font-medium">المدينة:</span> {order.city}</p>
                <p><span className="text-foreground font-medium">العنوان:</span> {order.address}</p>
                {order.country && <p><span className="text-foreground font-medium">الدولة:</span> {order.country}</p>}
                {order.postalCode && <p><span className="text-foreground font-medium">الرمز البريدي:</span> <span className="font-sans">{order.postalCode}</span></p>}
                <p><span className="text-foreground font-medium">الهاتف:</span> <span className="font-sans" dir="ltr">{order.customerPhone || order.user?.phone}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Print Only UI --- */}
      <div className="hidden print:block print:bg-white print:text-black font-sans w-full max-w-4xl mx-auto p-8" dir="rtl">
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body * { visibility: hidden; }
            .print\\:block, .print\\:block * { visibility: visible; }
            .print\\:block { position: absolute; left: 0; top: 0; right: 0; width: 100%; margin: 0; padding: 20px; }
            @page { margin: 0; }
          }
        `}} />
        
        {/* Print Header */}
        <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
          <div>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-16 w-auto object-contain mb-2" />
            ) : (
              <h1 className="text-3xl font-bold uppercase tracking-wider">{storeName || 'المتجر'}</h1>
            )}
            <p className="text-sm text-gray-500 mt-2 tracking-wide">فاتورة رسمية</p>
          </div>
          <div className="text-left">
            <h2 className="text-4xl font-light text-gray-400 uppercase tracking-widest mb-2">فاتورة</h2>
            <p className="font-bold font-sans" dir="ltr">#{order.id.slice(-6).toUpperCase()}</p>
            <p className="text-sm text-gray-600 mt-1 font-sans" dir="ltr">{enDate(order.createdAt)}</p>
          </div>
        </div>

        {/* Print Details */}
        <div className="flex justify-between mb-12">
          <div className="w-1/2 pl-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">بيانات العميل</h3>
            <p className="font-bold text-lg">{order.user?.name || order.user?.email || "عميل زائر"}</p>
            <p className="text-gray-600 mt-1 font-sans" dir="ltr">{order.user?.email}</p>
            {order.user?.phone && <p className="text-gray-600 font-sans" dir="ltr">{order.user?.phone}</p>}
          </div>
          <div className="w-1/2 pr-4 text-left">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">بيانات الطلب</h3>
            <p className="font-bold">{order.address}</p>
            <p className="text-gray-600">{order.city}{order.postalCode ? ` - ${order.postalCode}` : ''}</p>
            <p className="text-gray-600">{order.country || 'مصر'}</p>
            <p className="text-gray-600 font-sans" dir="ltr">{order.customerPhone || order.user?.phone}</p>
          </div>
        </div>

        {/* Print Items */}
        <table className="w-full text-right mb-8 border-collapse">
          <thead>
            <tr className="border-b-2 border-black text-xs uppercase tracking-wider text-gray-500">
              <th className="py-3 font-bold text-right">المنتج</th>
              <th className="py-3 font-bold text-center">الكمية</th>
              <th className="py-3 font-bold text-left">السعر</th>
              <th className="py-3 font-bold text-left">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item: any) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-4 pr-4">
                  <p className="font-bold text-gray-900">{item.product?.name || 'منتج غير معروف'}</p>
                </td>
                <td className="py-4 text-center text-gray-700 font-sans" dir="ltr">{item.quantity}</td>
                <td className="py-4 text-left text-gray-700 font-sans" dir="ltr">{enNumber(item.price)} ج.م</td>
                <td className="py-4 text-left font-bold text-gray-900 font-sans" dir="ltr">{enNumber(item.price * item.quantity)} ج.م</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Print Totals */}
        <div className="flex justify-end">
          <div className="w-1/2 sm:w-1/3">
            <div className="flex justify-between py-2 border-b border-gray-200 text-gray-600">
              <span>المجموع الفرعي</span>
              <span className="font-sans" dir="ltr">{enNumber(order.totalAmount - (order.shippingCost || 0) + (order.discount || 0))} ج.م</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 text-gray-600">
              <span>تكلفة الشحن</span>
              <span className="font-sans" dir="ltr">{enNumber(order.shippingCost || 0)} ج.م</span>
            </div>
            {(order.discount > 0) && (
              <div className="flex justify-between py-2 border-b border-gray-200 text-gray-600">
                <span>الخصم</span>
                <span className="font-sans" dir="ltr">-{enNumber(order.discount)} ج.م</span>
              </div>
            )}
            <div className="flex justify-between py-3 font-bold text-xl border-t-2 border-black/10 mt-4">
              <span>الإجمالي</span>
              <span className="font-sans" dir="ltr">{enNumber(order.totalAmount)} ج.م</span>
            </div>
            
            {branches && branches.length > 0 && (
              <div className="mt-12 pt-6 border-t border-dashed border-black/20">
                <h4 className="text-center font-bold mb-4">فروعنا</h4>
                <div className="grid grid-cols-2 gap-4 text-[10px]">
                  {branches.map((branch: any) => (
                    <div key={branch.id} className="text-center space-y-1">
                      <p className="font-bold">{branch.name}</p>
                      <p>{branch.address}</p>
                      {branch.phone && <p>{branch.phone}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-center mt-12 text-sm text-gray-500 italic">
              شكراً لتسوقكم معنا!
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>شكراً لثقتكم بنا!</p>
        </div>
      </div>

      {/* Customer Details Modal */}
      <Dialog open={customerModalOpen} onOpenChange={setCustomerModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              بيانات العميل
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">الاسم</p>
                <p className="font-medium">{order.user?.name || "غير مسجل"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                <p className="font-medium font-sans">{order.user?.email || "غير متوفر"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">الهاتف</p>
                <p className="font-medium font-sans" dir="ltr">{order.phone || order.user?.phone || "غير متوفر"}</p>
              </div>
            </div>
            
            {order.userId && (
              <div className="pt-4 flex justify-end">
                <Link prefetch={false} href={`/admin/customers/${order.userId}`} className="text-sm font-semibold text-primary hover:underline">
                  عرض ملف العميل كاملاً
                </Link>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
