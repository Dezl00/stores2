import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import JSZip from "jszip"
import fs from "fs/promises"
import path from "path"

async function addFolderToZipAsync(folderPath: string, zip: JSZip, rootPath: string) {
  try {
    const items = await fs.readdir(folderPath, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(folderPath, item.name);
      if (item.isDirectory()) {
        await addFolderToZipAsync(fullPath, zip, rootPath);
      } else {
        const relativePath = path.relative(rootPath, fullPath);
        const fileData = await fs.readFile(fullPath);
        zip.file(`public/${relativePath.replace(/\\/g, '/')}`, fileData);
      }
    }
  } catch (error) {
    console.error("Error reading folder:", error);
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [products, categories, departments, brands, orders, users, themeConfig, branches, widgets, mediaAssets, collections] = await Promise.all([
      db.product.findMany({ include: { images: true } }),
      db.category.findMany(),
      db.department.findMany(),
      db.brand.findMany(),
      db.order.findMany({ include: { items: true } }),
      db.storeUser.findMany(),
      db.themeConfig.findUnique({ where: { id: "default" } }),
      db.branch.findMany(),
      db.widget.findMany({ include: { items: true } }),
      db.mediaAsset.findMany(),
      db.collection.findMany({ include: { products: true } })
    ])

    const backupData = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: "1.1",
      },
      data: {
        products,
        categories,
        departments,
        brands,
        orders,
        users,
        themeConfig,
        branches,
        widgets,
        mediaAssets,
        collections
      }
    }

    const jsonString = JSON.stringify(backupData, null, 2)

    const zip = new JSZip()
    zip.file("backup.json", jsonString)

    const publicPath = path.join(process.cwd(), "public");
    await addFolderToZipAsync(publicPath, zip, publicPath);

    // Collect all URLs to download
    const urlsToDownload = new Set<string>()
    mediaAssets.forEach(m => urlsToDownload.add(m.url))
    products.forEach(p => p.images.forEach(i => urlsToDownload.add(i.url)))
    categories.forEach(c => c.imageUrl && urlsToDownload.add(c.imageUrl))
    departments.forEach(d => d.imageUrl && urlsToDownload.add(d.imageUrl))
    brands.forEach(b => b.logoUrl && urlsToDownload.add(b.logoUrl))
    
    // Add ThemeConfig images
    if (themeConfig?.logoUrl) urlsToDownload.add(themeConfig.logoUrl)
    if (themeConfig?.faviconUrl) urlsToDownload.add(themeConfig.faviconUrl)

    // Add Widget images
    widgets.forEach(w => {
      const settings = w.settings as any
      if (settings?.image) urlsToDownload.add(settings.image)
      w.items?.forEach((item: any) => {
        if (item.desktopImage) urlsToDownload.add(item.desktopImage)
        if (item.mobileImage) urlsToDownload.add(item.mobileImage)
      })
    })
    
    // Download images and add to zip
    const downloadPromises = Array.from(urlsToDownload).filter(url => url && url.startsWith('http')).map(async (url) => {
      try {
        const response = await fetch(url)
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer()
          const fileName = url.split('/').pop() || `image-${Date.now()}.jpg`
          // Remove query params from filename if any
          const cleanFileName = fileName.split('?')[0]
          zip.file(`images/${cleanFileName}`, arrayBuffer)
        }
      } catch (err) {
        console.error(`Failed to download ${url} for backup`, err)
      }
    })

    await Promise.all(downloadPromises)

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" })

    const filename = `assal-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.zip`

    // Log the backup
    await db.backup.create({
      data: {
        filename,
        size: zipBuffer.byteLength,
        status: "COMPLETED"
      }
    })

    return new NextResponse(zipBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    })

  } catch (error) {
    console.error("Backup export failed", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
