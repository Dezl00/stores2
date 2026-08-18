import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { webpush } from "@/lib/web-push"

export async function POST(req: Request) {
  try {
    const session = await auth()
    
    // Check if user is authenticated and has permission
    if (!session?.user?.id) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 401 })
    }

    const user = await db.storeUser.findUnique({ where: { id: session.user.id } })
    if (user?.role !== "ADMIN" && user?.role !== "MANAGER") {
      return NextResponse.json({ error: "لا تملك صلاحية لإرسال الإشعارات" }, { status: 403 })
    }

    const { title, message, link, imageUrl } = await req.json()

    if (!title || !message) {
      return NextResponse.json({ error: "العنوان والوصف مطلوبان" }, { status: 400 })
    }

    // Get all subscriptions that do NOT belong to ADMIN or MANAGER (target customers and guests)
    // We target subscriptions where role is null or CUSTOMER
    const subscriptions = await db.pushSubscription.findMany({
      where: {
        OR: [
          { role: "CUSTOMER" },
          { role: null }
        ]
      }
    })

    if (subscriptions.length === 0) {
      return NextResponse.json({ error: "لا يوجد مشتركون لإرسال الإشعار إليهم" }, { status: 400 })
    }

    const payload = JSON.stringify({
      title,
      body: message,
      icon: '/icon-512x512.png',
      image: imageUrl || undefined,
      url: link || '/',
      vibrate: [200, 100, 200, 100, 200, 100, 200],
      sound: '/sounds/bell.ogg',
    })

    let successCount = 0
    let failureCount = 0

    // Send notifications in parallel chunks to avoid blocking
    const chunkSize = 50
    for (let i = 0; i < subscriptions.length; i += chunkSize) {
      const chunk = subscriptions.slice(i, i + chunkSize)
      
      const promises = chunk.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              }
            },
            payload
          )
          successCount++
        } catch (error: any) {
          failureCount++
          // If subscription is invalid/expired, delete it from DB
          if (error.statusCode === 410 || error.statusCode === 404) {
            await db.pushSubscription.delete({ where: { id: sub.id } }).catch(console.error)
          }
        }
      })

      await Promise.all(promises)
    }

    // Save campaign log
    const campaign = await db.notificationCampaign.create({
      data: {
        title,
        message,
        imageUrl,
        link,
        successCount,
        failureCount
      }
    })

    return NextResponse.json({ 
      success: true, 
      campaign,
      totalSent: subscriptions.length 
    })
    
  } catch (error) {
    console.error("Error sending notification campaign:", error)
    return NextResponse.json({ error: "حدث خطأ داخلي أثناء إرسال الإشعارات" }, { status: 500 })
  }
}
