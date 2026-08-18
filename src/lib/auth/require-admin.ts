import { auth } from "@/lib/auth"
import { requireStoreId } from "@/lib/tenant"

/**
 * Require an authenticated SUPER_ADMIN session (Platform Level).
 */
export async function requireSuperAdmin() {
  const session = await auth()
  if (!session?.user || session.user.context !== 'platform' || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Super Admin required")
  }
  return session
}

/**
 * Require an authenticated Platform Staff session (Platform Level).
 */
export async function requirePlatformStaff() {
  const session = await auth()
  if (!session?.user || session.user.context !== 'platform' || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "PLATFORM_STAFF")) {
    throw new Error("Unauthorized: Platform Staff required")
  }
  return session
}

/**
 * Require an authenticated Store Owner or Manager session.
 * Throws an error if the user is not authenticated, not part of the correct store, or not an owner/manager.
 */
export async function requireStoreAdmin() {
  const session = await auth()
  if (!session?.user || session.user.context !== 'store') {
    throw new Error("Unauthorized: Store session required")
  }
  
  const currentStoreId = await requireStoreId()
  if (session.user.storeId !== currentStoreId) {
    throw new Error("Unauthorized: Store mismatch")
  }

  if (session.user.role !== "STORE_OWNER" && session.user.role !== "MANAGER") {
    throw new Error("Unauthorized: Store Admin or Manager required")
  }
  
  return session
}

/**
 * Require an authenticated Store Owner or Manager session with a specific permission.
 * Falls through if the user is STORE_OWNER (owners have all permissions).
 * For MANAGER, checks if the user has the specified permission.
 */
export async function requirePermission(permission: string) {
  const session = await requireStoreAdmin() // implies store checking is done
  
  if (session.user.role === "STORE_OWNER") return session
  
  const permissions = session.user.permissions || []
  if (!permissions.includes(permission) && !permissions.some((p: string) => p.startsWith(`${permission}.`))) {
    throw new Error(`Insufficient permissions: ${permission} required`)
  }
  
  return session
}
