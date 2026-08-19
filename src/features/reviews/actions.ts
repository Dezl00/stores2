"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { resolveStoreId } from "@/lib/store-context"

export async function updateReviewStatus(reviewId: string, status: string) {
  const storeId = await resolveStoreId()
  
  if (!storeId) {
    throw new Error("Store ID is required")
  }

  await db.productReview.update({
    where: { 
      id: reviewId,
      storeId 
    },
    data: { status }
  })

  revalidatePath("/admin/catalog/reviews")
}
