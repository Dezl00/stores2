'use server'
import { db as prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { resolveStoreId } from "@/lib/store-context"

export async function createAccount(data: FormData) {
  const session = await auth()
  const isAdmin = session?.user?.role === 'ADMIN'
  const hasPerm = session?.user?.permissions?.includes('accounts.add')
  if (!isAdmin && !hasPerm) return { success: false, error: 'Unauthorized' }

  try {
    let permissions = []
    try {
      permissions = JSON.parse(data.get('permissions') as string || '[]')
    } catch (e) {}

    const rawPassword = data.get('password') as string
    const passwordHash = rawPassword ? await bcrypt.hash(rawPassword, 10) : null
    const storeId = await resolveStoreId()

    await prisma.user.create({
      data: {
        name: data.get('name') as string,
        phone: data.get('phone') as string,
        role: data.get('role') as any,
        permissions: permissions,
        passwordHash: passwordHash || null,
        storeId,
      }
    })
    revalidatePath('/admin/accounts')
    return { success: true, error: undefined }
  } catch(e) {
    return { success: false, error: 'فشل الإنشاء (ربما الهاتف مستخدم)' }
  }
}

export async function updateAccount(id: string, data: FormData) {
  const session = await auth()
  const isAdmin = session?.user?.role === 'ADMIN'
  const hasPerm = session?.user?.permissions?.includes('accounts.edit')
  if (!isAdmin && !hasPerm) return { success: false, error: 'Unauthorized' }

  try {
    let permissions = []
    try {
      permissions = JSON.parse(data.get('permissions') as string || '[]')
    } catch (e) {}

    const password = data.get('password') as string
    let hashedPassword: string | undefined
    const storeId = await resolveStoreId()
    
    // Check current user to preserve ADMIN role if they are an admin
    const currentUser = await prisma.user.findUnique({ where: { id, storeId } })
    const targetRole = currentUser?.role === 'ADMIN' ? 'ADMIN' : (data.get('role') || 'MANAGER')

    const updateData: any = {
      name: data.get('name') as string,
      phone: data.get('phone') as string,
      role: targetRole,
      permissions: permissions,
    }

    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10)
    }

    await prisma.user.update({
      where: { id, storeId },
      data: updateData
    })
    revalidatePath('/admin/accounts')
    return { success: true, error: undefined }
  } catch(e: any) {
    console.error("updateAccount error:", e)
    return { success: false, error: 'فشل التحديث: ' + (e.message || String(e)) }
  }
}

export async function updateAccountStatus(id: string, isActive: boolean) {
  const session = await auth()
  const isAdmin = session?.user?.role === 'ADMIN'
  const hasPerm = session?.user?.permissions?.includes('accounts.edit')
  if (!isAdmin && !hasPerm) return { success: false, error: 'Unauthorized' }

  try {
    const storeId = await resolveStoreId()
    await prisma.user.update({
      where: { id, storeId },
      data: { isActive }
    })
    revalidatePath('/admin/accounts')
    return { success: true, error: undefined }
  } catch(e) {
    return { success: false, error: 'فشل تحديث الحالة' }
  }
}

export async function deleteAccount(id: string) {
  const session = await auth()
  const isAdmin = session?.user?.role === 'ADMIN'
  const hasPerm = session?.user?.permissions?.includes('accounts.delete')
  if (!isAdmin && !hasPerm) return { success: false, error: 'Unauthorized' }

  try {
    const storeId = await resolveStoreId()
    await prisma.user.delete({ where: { id, storeId } })
    revalidatePath('/admin/accounts')
    return { success: true, error: undefined }
  } catch(e) {
    return { success: false, error: 'فشل الحذف' }
  }
}

export async function updateProfile(data: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

  try {
    const password = data.get('password') as string
    const updateData: any = {
      name: data.get('name') as string,
    }

    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10)
    }

    const storeId = await resolveStoreId()
    await prisma.user.update({
      where: { id: session.user.id, storeId },
      data: updateData
    })
    return { success: true, error: undefined }
  } catch(e) {
    return { success: false, error: 'فشل التحديث' }
  }
}
