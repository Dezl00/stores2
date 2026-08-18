import { NextResponse } from "next/server"
import { resolveStoreId } from "@/lib/store-context"
import { db } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const storeId = await resolveStoreId()

    const collection = await db.collection.findFirst({
      where: { slug, storeId },
      include: {
        products: {
          include: {
            category: true,
            brand: true,
            images: true,
          }
        }
      }
    })

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    return NextResponse.json({ collection })
  } catch (error) {
    console.error("Error fetching collection:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
