import { db as prisma } from '@/lib/db'
import { AccountsClient } from './accounts-client'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { resolveStoreId } from '@/lib/store-context'

export const dynamic = 'force-dynamic'

export default async function AccountsPage() {
  const session = await auth()
  const isAdmin = session?.user?.role === 'STORE_OWNER'
  const hasPerm = session?.user?.permissions?.includes('accounts.view')
  
  if (!isAdmin && !hasPerm) {
    redirect('/admin')
  }

  const storeId = await resolveStoreId()

  const accounts = await prisma.storeUser.findMany({
    where: { 
      storeId,
      role: { in: ['STORE_OWNER', 'MANAGER'] },
      phone: { not: 'admin@assal.com' }
    },
    orderBy: { createdAt: 'desc' }
  })

  return <AccountsClient accounts={accounts} />
}
