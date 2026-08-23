import React from "react"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Toaster } from "sonner"

export default async function BuilderLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  // Builder is a specific tool, no extra layouts, just full screen
  return (
    <div className="h-screen overflow-hidden bg-slate-50 admin-theme" dir="rtl">
      {children}
      <Toaster />
    </div>
  )
}
