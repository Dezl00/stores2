import React from "react"
import { Loader2 } from "lucide-react"

export default function CheckoutSuccessLoading() {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 md:px-6 lg:px-8 py-12 max-w-3xl min-h-[60vh] flex flex-col items-center justify-center">
      <div className="w-24 h-24 bg-primary/5 text-primary rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse ring-8 ring-primary/5">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
      <div className="h-8 w-64 bg-muted rounded-md animate-pulse mb-4 mx-auto"></div>
      <div className="h-4 w-48 bg-muted rounded-md animate-pulse mx-auto"></div>
    </div>
  )
}
