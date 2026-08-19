import React from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Toaster } from "@/components/ui/toaster"

export default async function BuilderLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/login")
  }

  // Builder is a specific tool, no extra layouts, just full screen
  return (
    <div className="min-h-screen bg-slate-50 admin-theme" dir="rtl">
      {children}
      <Toaster />
    </div>
  )
}
