"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { resolveStoreId } from "@/lib/store-context"

async function checkAdmin() {
  const session = await auth()
  if (!session || !session.user) throw new Error("Unauthorized")
  const user = await db.storeUser.findUnique({ where: { id: session.user.id } })
  if (!user || user.role !== "ADMIN" && user.role !== "MANAGER") {
    throw new Error("Unauthorized")
  }
}

// -- Governorates --

export async function getGovernorates() {
  const storeId = await resolveStoreId()
  return await db.governorate.findMany({
    where: { storeId },
    include: { cities: { orderBy: { name: 'asc' } } },
    orderBy: { name: 'asc' }
  })
}

export async function createGovernorate(data: { name: string; shippingCost?: number; hideCities?: boolean; isActive?: boolean }) {
  await checkAdmin()
  const storeId = await resolveStoreId()
  const gov = await db.governorate.create({ data: { ...data, storeId } })
  revalidatePath('/admin/shipping-payment')
  return gov
}

export async function updateGovernorate(id: string, data: { name?: string; shippingCost?: number; hideCities?: boolean; isActive?: boolean }) {
  await checkAdmin()
  const storeId = await resolveStoreId()
  const gov = await db.governorate.update({ where: { id }, data })
  revalidatePath('/admin/shipping-payment')
  return gov
}

export async function deleteGovernorate(id: string) {
  await checkAdmin()
  const storeId = await resolveStoreId()
  await db.governorate.delete({ where: { id }})
  revalidatePath('/admin/shipping-payment')
  return { success: true }
}

// -- Cities --

export async function createCity(data: { name: string; shippingCost: number; governorateId: string; isActive?: boolean }) {
  await checkAdmin()
  const storeId = await resolveStoreId()
  const city = await db.city.create({ data: { ...data, storeId } })
  revalidatePath('/admin/shipping-payment')
  return city
}

export async function updateCity(id: string, data: { name?: string; shippingCost?: number; isActive?: boolean }) {
  await checkAdmin()
  const storeId = await resolveStoreId()
  const city = await db.city.update({ where: { id }, data })
  revalidatePath('/admin/shipping-payment')
  return city
}

export async function deleteCity(id: string) {
  await checkAdmin()
  const storeId = await resolveStoreId()
  await db.city.delete({ where: { id }})
  revalidatePath('/admin/shipping-payment')
  return { success: true }
}

// -- Payment Methods --

export async function getPaymentMethods() {
  const storeId = await resolveStoreId()
  return await db.paymentMethod.findMany({
    where: { storeId },
    orderBy: { sortOrder: 'asc' }
  })
}

export async function createPaymentMethod(data: { name: string; type: string; accountInfo?: string; paymentLink?: string; logoUrl?: string; instructions?: string; isActive?: boolean; sortOrder?: number }) {
  await checkAdmin()
  const storeId = await resolveStoreId()
  const pm = await db.paymentMethod.create({ data: { ...data, storeId } })
  revalidatePath('/admin/shipping-payment')
  return pm
}

export async function updatePaymentMethod(id: string, data: { name?: string; type?: string; accountInfo?: string; paymentLink?: string; logoUrl?: string; instructions?: string; isActive?: boolean; sortOrder?: number }) {
  await checkAdmin()
  const storeId = await resolveStoreId()
  const pm = await db.paymentMethod.update({ where: { id }, data })
  revalidatePath('/admin/shipping-payment')
  return pm
}

export async function deletePaymentMethod(id: string) {
  await checkAdmin()
  const storeId = await resolveStoreId()
  await db.paymentMethod.delete({ where: { id }})
  revalidatePath('/admin/shipping-payment')
  return { success: true }
}
