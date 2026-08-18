import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';
import JSZip from 'jszip';

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

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const config = await prisma.themeConfig.findFirst({ where: { id: "default" } });
    if (!config || config.backupFrequency === 'never') {
      return NextResponse.json({ message: 'Auto backup disabled' });
    }
    
    const [products, categories, departments, brands, orders, users, themeConfig, branches, widgets, mediaAssets, collections] = await Promise.all([
      prisma.product.findMany({ include: { images: true } }),
      prisma.category.findMany(),
      prisma.department.findMany(),
      prisma.brand.findMany(),
      prisma.order.findMany({ include: { items: true } }),
      prisma.storeUser.findMany(),
      prisma.themeConfig.findUnique({ where: { id: "default" } }),
      prisma.branch.findMany(),
      prisma.widget.findMany({ include: { items: true } }),
      prisma.mediaAsset.findMany(),
      prisma.collection.findMany({ include: { products: true } })
    ]);

    const backupData = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: "1.1",
      },
      data: {
        products, categories, departments, brands, orders, users, themeConfig, branches, widgets, mediaAssets, collections
      }
    };
    
    const jsonString = JSON.stringify(backupData, null, 2);
    const zip = new JSZip();
    zip.file("backup.json", jsonString);

    const publicPath = path.join(process.cwd(), "public");
    await addFolderToZipAsync(publicPath, zip, publicPath);

    const urlsToDownload = new Set<string>();
    mediaAssets.forEach(m => urlsToDownload.add(m.url));
    products.forEach(p => p.images.forEach(i => urlsToDownload.add(i.url)));
    categories.forEach(c => c.imageUrl && urlsToDownload.add(c.imageUrl));
    departments.forEach(d => d.imageUrl && urlsToDownload.add(d.imageUrl));
    brands.forEach(b => b.logoUrl && urlsToDownload.add(b.logoUrl));
    if (themeConfig?.logoUrl) urlsToDownload.add(themeConfig.logoUrl);
    if (themeConfig?.faviconUrl) urlsToDownload.add(themeConfig.faviconUrl);
    widgets.forEach(w => {
      const settings = w.settings as any;
      if (settings?.image) urlsToDownload.add(settings.image);
      w.items?.forEach((item: any) => {
        if (item.desktopImage) urlsToDownload.add(item.desktopImage);
        if (item.mobileImage) urlsToDownload.add(item.mobileImage);
      });
    });

    const downloadPromises = Array.from(urlsToDownload).filter(url => url && url.startsWith('http')).map(async (url) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const fileName = url.split('/').pop() || `image-${Date.now()}.jpg`;
          const cleanFileName = fileName.split('?')[0];
          zip.file(`images/${cleanFileName}`, arrayBuffer);
        }
      } catch (err) {
        console.error(`Failed to download ${url} for backup`, err);
      }
    });

    await Promise.all(downloadPromises);

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    const filename = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.zip`;

    // Save locally to a backups folder
    const backupsDir = path.join(process.cwd(), "backups");
    await fs.mkdir(backupsDir, { recursive: true });
    await fs.writeFile(path.join(backupsDir, filename), zipBuffer);
    
    await prisma.backup.create({
      data: {
        filename,
        size: zipBuffer.byteLength,
        status: 'COMPLETED'
      }
    });
    
    return NextResponse.json({ success: true, message: 'Backup created successfully', filename });
  } catch (error) {
    console.error("Cron backup error:", error);
    return NextResponse.json({ success: false, error: 'Cron backup failed' }, { status: 500 });
  }
}
