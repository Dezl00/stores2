"use server"

import { requireStoreAdmin, requirePermission } from "@/lib/auth/require-admin"
import { resolveStoreId } from "@/lib/store-context"
import { db } from "@/lib/db"
import { uploadImage, deleteImage as deleteCloudinaryImage } from "@/lib/cloudinary"
import { revalidatePath } from "next/cache"

export async function uploadMediaAction(formData: FormData) {
  try {
    const storeId = await resolveStoreId()
    try {
      await requirePermission("media.upload")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const file = formData.get("file") as File
    const folder = formData.get("folder") as string || "assal/general"

    if (!file) {
      return { success: false, error: "No file provided" }
    }

    // Upload to Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer())
    const uploadResult: any = await uploadImage(buffer, storeId, folder)

    // Save to database
    const mediaAsset = await db.mediaAsset.create({
      data: {
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        bytes: uploadResult.bytes,
        folder: folder,
        storeId,
      }
    })

    // Log the activity
    

    revalidatePath("/admin/media")
    return { success: true, asset: mediaAsset }
  } catch (error: any) {
    console.error("Media upload error:", error)
    return { success: false, error: error.message || "Failed to upload media" }
  }
}

export async function deleteMediaAction(id: string) {
  try {
    const storeId = await resolveStoreId()
    try {
      await requirePermission("media.delete")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const asset = await db.mediaAsset.findFirst({ where: { id, storeId } })
    if (!asset) return { success: false, error: "Asset not found" }

    await deleteCloudinaryImage(asset.publicId, storeId)
    await db.mediaAsset.delete({ where: { id, storeId } as any })

    // Log the activity
    

    revalidatePath("/admin/media")
    return { success: true }
  } catch (error: any) {
    console.error("Media delete error:", error)
    return { success: false, error: error.message || "Failed to delete media" }
  }
}

export async function getMediaAssets(folder?: string) {
  try {
    const storeId = await resolveStoreId()
    const assets = await db.mediaAsset.findMany({
      where: folder ? { folder, storeId } : { storeId },
      orderBy: { createdAt: "desc" }
    })
    return { success: true, assets }
  } catch (error: any) {
    return { success: false, error: "Failed to fetch media assets" }
  }
}
