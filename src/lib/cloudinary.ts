import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(fileBuffer: Buffer, storeId: string, subfolder: string = "general") {
  return new Promise((resolve, reject) => {
    // Isolate by platform and storeId
    const platformName = process.env.NEXT_PUBLIC_PLATFORM_NAME || "matjark"
    const platformPrefix = platformName === "متجرك" ? "matjark" : platformName.replace(/[^a-zA-Z0-9_-]/g, '')
    const folderPath = `${platformPrefix}/stores/${storeId}/${subfolder}`

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folderPath },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      }
    )

    uploadStream.end(fileBuffer)
  })
}

export async function deleteImage(publicId: string, storeId: string) {
  // Security check: ensure publicId belongs to the storeId before deleting
  const platformName = process.env.NEXT_PUBLIC_PLATFORM_NAME || "matjark"
  const platformPrefix = platformName === "متجرك" ? "matjark" : platformName.replace(/[^a-zA-Z0-9_-]/g, '')
  const expectedPrefix = `${platformPrefix}/stores/${storeId}/`
  
  if (!publicId.startsWith(expectedPrefix)) {
    return Promise.reject(new Error("Unauthorized: Cannot delete media outside your store scope."))
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
  })
}

export { cloudinary }
