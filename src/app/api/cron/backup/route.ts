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
    return NextResponse.json({ message: 'Auto backup pending multi-tenant update' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
