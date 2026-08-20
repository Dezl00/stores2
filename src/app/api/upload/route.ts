import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { resolveStoreId } from "@/lib/store-context"
import { uploadImage } from "@/lib/cloudinary"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Server-side file size check (5MB max)
    const MAX_FILE_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت." }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const storeId = await resolveStoreId().catch(() => session.user?.storeId || "platform")
    const uploadResult: any = await uploadImage(buffer, storeId, "editor")

    return NextResponse.json({ 
      success: true, 
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id
    })
    
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 })
  }
}
