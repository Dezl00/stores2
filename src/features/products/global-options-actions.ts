"use server"

import { requirePermission } from "@/lib/auth/require-admin"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { resolveStoreId } from "@/lib/store-context"
import { OptionBehavior, OptionDataType, OptionDisplayType } from "@prisma/client"
import { SYSTEM_OPTIONS } from "@/lib/product-options"

// Seed system global options if they don't exist
export async function seedGlobalOptions() {
  const storeId = await resolveStoreId()
  
  for (const sysOpt of SYSTEM_OPTIONS) {
    await db.globalOption.upsert({
      where: {
        storeId_name: { storeId, name: sysOpt.name }
      },
      update: {},
      create: {
        storeId,
        name: sysOpt.name,
        behavior: sysOpt.behavior as OptionBehavior,
        dataType: sysOpt.dataType as OptionDataType,
        displayType: sysOpt.defaultDisplayType as OptionDisplayType,
        isActive: false, // Disabled by default
        values: {
          create: sysOpt.suggestedValues.map((v, i) => ({
            label: v.label,
            value: v.value,
            sortOrder: i
          }))
        }
      }
    })
  }
}

export async function getGlobalOptions() {
  const storeId = await resolveStoreId()
  await seedGlobalOptions() // Ensure seeded
  
  return await db.globalOption.findMany({
    where: { storeId },
    include: { values: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { createdAt: 'asc' }
  })
}

export async function toggleGlobalOption(optionId: string, isActive: boolean) {
  await requirePermission("products.edit")
  const storeId = await resolveStoreId()
  
  const option = await db.globalOption.findFirst({ where: { id: optionId, storeId } })
  if (!option) throw new Error("Option not found")
  
  const updated = await db.globalOption.update({
    where: { id: optionId },
    data: { isActive }
  })
  
  revalidatePath("/admin/catalog/options")
  revalidatePath("/admin/catalog/products")
  return { success: true, option: updated }
}

export async function addGlobalOptionValue(optionId: string, label: string, value: string) {
  await requirePermission("products.edit")
  const storeId = await resolveStoreId()
  
  const option = await db.globalOption.findFirst({ where: { id: optionId, storeId } })
  if (!option) throw new Error("Option not found")
  
  const count = await db.globalOptionValue.count({ where: { optionId } })
  
  await db.globalOptionValue.create({
    data: {
      optionId,
      label,
      value,
      sortOrder: count
    }
  })
  
  revalidatePath("/admin/catalog/options")
  return { success: true }
}

export async function deleteGlobalOptionValue(valueId: string) {
  await requirePermission("products.edit")
  const storeId = await resolveStoreId()
  
  const val = await db.globalOptionValue.findUnique({ where: { id: valueId }, include: { option: true } })
  if (!val || val.option.storeId !== storeId) throw new Error("Not found")
  
  await db.globalOptionValue.delete({ where: { id: valueId } })
  
  revalidatePath("/admin/catalog/options")
  return { success: true }
}
