import { getWidgets } from "@/features/widget-builder/actions"
import { db } from "@/lib/db"
import { StorefrontLivePreview } from "@/components/storefront/storefront-live-preview"

export const revalidate = 3600

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

  // The client component will handle filtering active widgets and live preview updates
  return <StorefrontLivePreview initialWidgets={widgets || []} />
}
