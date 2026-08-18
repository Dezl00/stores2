import { auth } from "@/lib/auth"
import CheckoutClient from "./checkout-client"
import { db } from "@/lib/db"
import { getGovernorates, getPaymentMethods } from "@/features/shipping-payment/actions"
import { getOfferSettings } from "@/features/offers/actions"

import { Suspense } from "react"

export const dynamic = "force-dynamic"

export default async function CheckoutPage() {
  const session = await auth()
  
  let userDetails = null
  
  if (session?.user?.id) {
    const dbUser = await db.storeUser.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true, name: true, email: true, phone: true, address: true,
        addresses: { orderBy: { isDefault: 'desc' } }
      }
    })
    if (dbUser) {
      userDetails = dbUser
    }
  }

  const governorates = await getGovernorates()
  const paymentMethods = await getPaymentMethods()
  const settings = await getOfferSettings()
  
  // Filter active only
  const activeGovernorates = governorates.filter(g => g.isActive).map(g => ({
    ...g,
    cities: g.cities.filter(c => c.isActive)
  }))
  const activePaymentMethods = paymentMethods.filter(p => p.isActive)

  return (
    <Suspense fallback={<div className="container mx-auto p-8 text-center">جاري تحميل صفحة الدفع...</div>}>
      <CheckoutClient 
        user={userDetails} 
        governorates={activeGovernorates} 
        paymentMethods={activePaymentMethods} 
        settings={settings}
      />
    </Suspense>
  )
}
