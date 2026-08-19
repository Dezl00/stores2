import React from "react"

import { OffersClient } from "./offers-client"
import { getCoupons, getOfferSettings } from "@/features/offers/actions"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "العروض والخصومات",
}

export default async function OffersPage() {
  const coupons = await getCoupons()
  const settings = await getOfferSettings()

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>الرئيسية</span>
          <span>/</span>
          <span className="text-foreground">العروض والخصومات</span>
        </nav>
      </div>
      <OffersClient 
        initialCoupons={coupons} 
        initialSettings={settings} 
      />
    </div>
  )
}
