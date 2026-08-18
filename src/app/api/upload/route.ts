import { NextResponse } from "next/server"
import { requireStoreAdmin } from "@/lib/auth/require-admin"
import { resolveStoreId } from "@/lib/store-context"
import { uploadImage } from "@/lib/cloudinary"

export async function POST(request: Request) {
  try {
    try {
      await requireStoreAdmin()
    } catch (e: any) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const storeId = await resolveStoreId()
    const uploadResult: any = await uploadImage(buffer, storeId, "editor")

    return NextResponse.json({ 
      success: true, 
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id
    })
    
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
