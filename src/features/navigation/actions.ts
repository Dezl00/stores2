"use server"

import { db } from "@/lib/db"
import { requireStoreAdmin, requirePermission } from "@/lib/auth/require-admin"
import { revalidatePath } from "next/cache"
import { resolveStoreId } from "@/lib/store-context"

export async function getMenus() {
  const storeId = await resolveStoreId()
  const menus = await db.menu.findMany({
    where: { storeId },
    include: { items: { orderBy: { sortOrder: 'asc' } } }
  })
  return { success: true, menus }
}

export async function createMenu(data: any) {
  try {
    await requireStoreAdmin()
    const storeId = await resolveStoreId()
    const menu = await db.menu.create({ data: { ...data, storeId } })
    revalidatePath('/admin/storefront/navigation')
    return { success: true, menu }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function updateMenu(id: string, data: any) {
  try {
    await requireStoreAdmin()
    const storeId = await resolveStoreId()
    const existing = await db.menu.findFirst({ where: { id, storeId } })
    if (!existing) return { success: false, error: "Unauthorized" }
    
    const menu = await db.menu.update({ where: { id }, data })
    revalidatePath('/admin/storefront/navigation')
    return { success: true, menu }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function deleteMenu(id: string) {
  try {
    await requireStoreAdmin()
    const storeId = await resolveStoreId()
    const existing = await db.menu.findFirst({ where: { id, storeId } })
    if (!existing) return { success: false, error: "Unauthorized" }
    
    await db.menu.delete({ where: { id }})
    revalidatePath('/admin/storefront/navigation')
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function createMenuItem(menuId: string, data: any) {
  try {
    await requireStoreAdmin()
    const storeId = await resolveStoreId()
    
    // verify menu ownership
    const menu = await db.menu.findFirst({ where: { id: menuId, storeId } })
    if (!menu) return { success: false, error: "Unauthorized" }
    
    const item = await db.menuItem.create({ data: { ...data, menuId } })
    revalidatePath('/admin/storefront/navigation')
    return { success: true, item }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function updateMenuItem(id: string, menuId: string, data: any) {
  try {
    await requireStoreAdmin()
    const storeId = await resolveStoreId()
    const existing = await db.menuItem.findFirst({ where: { id }, include: { menu: true } })
    if (!existing || existing.menu.storeId !== storeId) return { success: false, error: "Unauthorized" }
    
    const item = await db.menuItem.update({ where: { id }, data })
    revalidatePath('/admin/storefront/navigation')
    return { success: true, item }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function deleteMenuItem(id: string, menuId: string) {
  try {
    await requireStoreAdmin()
    const storeId = await resolveStoreId()
    const existing = await db.menuItem.findFirst({ where: { id }, include: { menu: true } })
    if (!existing || existing.menu.storeId !== storeId) return { success: false, error: "Unauthorized" }
    
    await db.menuItem.delete({ where: { id }})
    revalidatePath('/admin/storefront/navigation')
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
