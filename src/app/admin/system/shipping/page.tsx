import React from "react"

import { ShippingPaymentClient } from "./shipping-payment-client"
import { getGovernorates, getPaymentMethods } from "@/features/shipping-payment/actions"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "الدفع والشحن",
}

export default async function ShippingPaymentPage() {
  const governorates = await getGovernorates()
  const paymentMethods = await getPaymentMethods()

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>الرئيسية</span>
          <span>/</span>
          <span className="text-foreground">الدفع والشحن</span>
        </nav>
      </div>
      <ShippingPaymentClient 
        initialGovernorates={governorates} 
        initialPaymentMethods={paymentMethods} 
      />
    </div>
  )
}
