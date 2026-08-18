import { db as prisma } from "@/lib/db";
import { webpush } from "@/lib/web-push";

interface SendNotificationOptions {
  userId?: string; // If null, target admins
  targetRole?: "MANAGER" | "STORE_OWNER" | "CUSTOMER"; 
  title: string;
  message: string;
  type: string;
  link?: string;
  sound?: boolean; // Whether to play sound for push
  image?: string;  // Large image to display in the push notification
  storeId: string; // Required for multi-tenant isolation
}

export async function sendNotification({ userId, targetRole, title, message, type, link, sound = true, image, storeId }: SendNotificationOptions) {
  try {
    // 1. Save to database (in-app notification)
    await prisma.notification.create({
      data: {
        storeUserId: userId || undefined,
        title,
        message,
        type,
        link,
        storeId
      }
    });

    // 2. Find push subscriptions
    let pushSubs: any[] = [];
    if (userId) {
      pushSubs = await prisma.pushSubscription.findMany({
        where: { storeUserId: userId, storeId }
      });
    } else if (targetRole === "MANAGER" || targetRole === "STORE_OWNER") {
      // Find subscriptions that belong to managers or owners of THIS store
      pushSubs = await prisma.pushSubscription.findMany({
        where: { 
          storeId,
          role: { in: ["MANAGER", "STORE_OWNER"] }
        }
      });
    }

    // 3. Send Web Push
    const payload = JSON.stringify({
      title,
      body: message,
      icon: '/icon-512x512.png', // Assuming PWA icon exists, fallback to favicon
      image: image || undefined,
      url: link || '/',
      vibrate: sound ? [200, 100, 200, 100, 200, 100, 200] : [200],
      sound: sound ? '/sounds/bell.ogg' : undefined,
    });

    const sendPromises = pushSubs.map(async (sub) => {
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
        );
      } catch (error: any) {
        // If subscription is invalid/expired (410), delete it
        if (error.statusCode === 410 || error.statusCode === 404) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        } else {
          console.error("Error sending push notification to endpoint:", sub.endpoint, error);
        }
      }
    });

    await Promise.all(sendPromises);
    
    return { success: true };
  } catch (error) {
    console.error("Error in sendNotification:", error);
    return { success: false, error };
  }
}
