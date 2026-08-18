import { db as prisma } from '@/lib/db'
import { AccountsClient } from './accounts-client'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AccountsPage() {
  const session = await auth()
  const isAdmin = session?.user?.role === 'ADMIN'
  const hasPerm = session?.user?.permissions?.includes('accounts.view')
  
  if (!isAdmin && !hasPerm) {
    redirect('/admin')
  }

  const accounts = await prisma.storeUser.findMany({
    where: { 
      role: { in: ['ADMIN', 'MANAGER'] },
      phone: { not: 'admin@assal.com' }
    },
    orderBy: { createdAt: 'desc' }
  })

  return <AccountsClient accounts={accounts} />
}
