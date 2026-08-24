import React from "react"
import { db } from "@/lib/db"
import Link from "next/link"
import { CheckCircle2, MapPin, Phone, User, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"

export default async function CheckoutSuccessPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const params = await props.params;
  const order = await db.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: true } } }
  })

  if (!order) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-destructive">لم يتم العثور على الطلب</h1>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 md:px-6 lg:px-8 py-12 max-w-3xl">
      <div className="bg-card border-2 border-primary/20 rounded-[2rem] p-8 sm:p-12 text-center shadow-2xl shadow-primary/5">
        <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-primary/5">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground">شكراً لتسوقك معنا!</h1>
        <p className="text-lg text-muted-foreground mb-2">تم استلام طلبك بنجاح وجاري تجهيزه.</p>
        <p className="text-sm text-muted-foreground mb-8">
          رقم الطلب: <span className="font-mono font-bold text-foreground">#{order.id.slice(-6).toUpperCase()}</span>
        </p>

        <div className="border-t border-border/50 pt-8 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
            
            <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">الاسم</p>
                <p className="font-bold text-foreground">{order.customerName}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">رقم التواصل</p>
                <p className="font-bold text-foreground" dir="ltr">{order.customerPhone}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors md:col-span-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">عنوان التوصيل</p>
                <p className="font-bold text-foreground leading-relaxed">{order.city} - {order.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors md:col-span-2 border border-primary/20 bg-primary/5">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div className="w-full flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <p className="text-sm font-medium text-primary/80 mb-1">طريقة الدفع</p>
                  <p className="font-bold text-primary">الدفع عند الاستلام</p>
                </div>
                <div className="sm:text-left">
                  <p className="text-sm font-medium text-primary/80 mb-1">الإجمالي المطلوب</p>
                  <p className="font-bold text-2xl text-primary">{order.totalAmount.toFixed(2)} ج.م</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link prefetch={false} href="/" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-12 h-14 text-lg font-bold shadow-lg shadow-primary/20">
              متابعة التسوق
            </Button>
          </Link>
          {session?.user && (
            <Link prefetch={false} href="/account" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-xl px-12 h-14 text-lg font-bold border-2 hover:bg-muted">
                متابعة طلباتي
              </Button>
            </Link>
          )}
        </div>

      </div>
    </div>
  )
}
