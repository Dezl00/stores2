'use server'
import { db as prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { resolveStoreId } from "@/lib/store-context"
import { requirePermission, requireStoreAdmin } from "@/lib/auth/require-admin"

export async function createAccount(data: FormData) {
  try {
    await requirePermission('accounts.add')
  } catch (e: any) {
    return { success: false, error: e.message || 'Unauthorized' }
  }

  try {
    let permissions = []
    try {
      permissions = JSON.parse(data.get('permissions') as string || '[]')
    } catch (e) {}

    const rawPassword = data.get('password') as string
    const passwordHash = rawPassword ? await bcrypt.hash(rawPassword, 10) : null
    const storeId = await resolveStoreId()

    await prisma.storeUser.create({
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
  try {
    await requirePermission('accounts.edit')
  } catch (e: any) {
    return { success: false, error: e.message || 'Unauthorized' }
  }

  try {
    let permissions = []
    try {
      permissions = JSON.parse(data.get('permissions') as string || '[]')
    } catch (e) {}

    const password = data.get('password') as string
    let hashedPassword: string | undefined
    const storeId = await resolveStoreId()
    
    // Check current user to preserve ADMIN role if they are an admin
    const currentUser = await prisma.storeUser.findFirst({ where: { id, storeId } })
    if (!currentUser) return { success: false, error: "Not found or unauthorized" }
    
    const targetRole = currentUser.role === 'STORE_OWNER' ? 'STORE_OWNER' : (data.get('role') || 'MANAGER')

    const updateData: any = {
      name: data.get('name') as string,
      phone: data.get('phone') as string,
      role: targetRole,
      permissions: permissions,
    }

    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10)
    }

    await prisma.storeUser.update({ where: { id },
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
  try {
    await requirePermission('accounts.edit')
  } catch (e: any) {
    return { success: false, error: e.message || 'Unauthorized' }
  }

  try {
    const storeId = await resolveStoreId()
    const existing = await prisma.storeUser.findFirst({ where: { id, storeId } })
    if (!existing) return { success: false, error: "Not found or unauthorized" }

    await prisma.storeUser.update({ where: { id },
      data: { isActive }
    })
    revalidatePath('/admin/accounts')
    return { success: true, error: undefined }
  } catch(e) {
    return { success: false, error: 'فشل تحديث الحالة' }
  }
}

export async function deleteAccount(id: string) {
  try {
    await requirePermission('accounts.delete')
  } catch (e: any) {
    return { success: false, error: e.message || 'Unauthorized' }
  }

  try {
    const storeId = await resolveStoreId()
    const existing = await prisma.storeUser.findFirst({ where: { id, storeId } })
    if (!existing) return { success: false, error: "Not found or unauthorized" }

    await prisma.storeUser.delete({ where: { id }})
    revalidatePath('/admin/accounts')
    return { success: true, error: undefined }
  } catch(e) {
    return { success: false, error: 'فشل الحذف' }
  }
}

export async function updateProfile(data: FormData) {
  try {
    await requireStoreAdmin()
  } catch (e: any) {
    return { success: false, error: e.message || 'Unauthorized' }
  }

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
    const existing = await prisma.storeUser.findFirst({ where: { id: session.user.id, storeId } })
    if (!existing) return { success: false, error: "Not found or unauthorized" }

    await prisma.storeUser.update({ where: { id: session.user.id },
      data: updateData
    })
    return { success: true, error: undefined }
  } catch(e) {
    return { success: false, error: 'فشل التحديث' }
  }
}
