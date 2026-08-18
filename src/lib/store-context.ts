import { getCurrentStore, requireStoreId } from '@/lib/tenant'
import { auth } from '@/lib/auth'

// Get storeId from JWT token (for server actions where the user is authenticated)
export async function getStoreIdFromSession(): Promise<string> {
  const session = await auth()
  if (!session?.user?.storeId) {
    // Fallback to header-based resolution
    return requireStoreId()
  }
  return session.user.storeId as string
}

// Get storeId from either session or headers
export async function resolveStoreId(): Promise<string> {
  try {
    return await getStoreIdFromSession()
  } catch {
    return requireStoreId()
  }
}
