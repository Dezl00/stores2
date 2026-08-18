
"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <h1 className="text-4xl font-bold tracking-tighter text-gray-900">ÚĞÑÇğ!</h1>
        <p className="text-lg text-gray-600">
          {error.message === "Not in a store context" || error.message.includes("Store is suspended")
            ? "åĞÇ ÇáãÊÌÑ ÛíÑ ãæÌæÏ Ãæ Êã ÅíŞÇİå."
            : "ÍÏË ÎØÃ ÛíÑ ãÊæŞÚ İí ÇáÎÇÏã."}
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-6 text-sm font-medium text-white shadow transition-colors hover:bg-indigo-700"
          >
            ÊÓÌíá ÇáÏÎæá
          </Link>
        </div>
      </div>
    </div>
  )
}

