import { getWidgets } from "@/features/widget-builder/actions"
import { WidgetRenderer } from "@/components/storefront/widget-renderer"
import { db } from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  let themeConfig = null
  try {
    const { resolveStoreId } = await import("@/lib/store-context")
    const storeId = await resolveStoreId()
    themeConfig = await db.themeConfig.findUnique({
      where: { storeId }
    })
  } catch (e) {
    // Ignore error if store not found
  }
  
  const logo = themeConfig?.logoUrl || "/logo.png" // Fallback to a default logo if none exists
  
  return {
    title: themeConfig?.storeName || "متجر العسال",
    description: "أهلاً بك في متجر العسال",
    openGraph: {
      images: [logo],
    }
  }
}

export default async function StorefrontPage(props: { searchParams?: { preview?: string } }) {
  const { widgets, success } = await getWidgets()

  if (!success) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-destructive">
        عذراً، حدث خطأ أثناء تحميل الصفحة الرئيسية.
      </div>
    )
  }

  // Filter only active widgets
  const activeWidgets = widgets?.filter((w: any) => w.status) || []

  if (activeWidgets.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-muted-foreground bg-secondary/5">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <span className="text-3xl">🍯</span>
        </div>
        <h2 className="text-3xl font-bold text-foreground tracking-tight">أهلاً بك في متجر العسال</h2>
        <p className="mt-3 text-lg">نحن نقوم بتجهيز واجهة المتجر حالياً. يرجى العودة لاحقاً!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {activeWidgets.map((widget: any) => (
        <WidgetRenderer key={widget.id} widget={widget} />
      ))}
    </div>
  )
}
