import { db as prisma } from '@/lib/db'
import { LogsClient } from './logs-client'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function LogsPage() {
  const session = await auth()
  if (!session?.user) redirect('/admin')

  const isAdmin = session?.user?.role === 'STORE_OWNER'

  // Only admins see the logs
  const logs = isAdmin ? await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: true }
  }) : []

  return <LogsClient logs={logs} currentUser={session.user} />
}
