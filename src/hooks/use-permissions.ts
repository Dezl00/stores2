import { useSession } from "next-auth/react"

export function usePermissions() {
  const { data: session } = useSession()
  const permissions = session?.user?.permissions || []
  const isAdmin = session?.user?.role === "STORE_OWNER"

  const hasPermission = (permission: string) => {
    if (isAdmin) return true
    return permissions.includes(permission)
  }

  const hasAnyPermissionPrefix = (prefix: string) => {
    if (isAdmin) return true
    return permissions.some((p: string) => p.startsWith(`${prefix}.`))
  }

  return { hasPermission, hasAnyPermissionPrefix, isAdmin, permissions }
}
