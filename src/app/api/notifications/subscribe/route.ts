import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db as prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const subscription = await req.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }

    const userId = session?.user?.id;
    const role = session?.user?.role || "GUEST";
    
    // We allow guests to subscribe too, but we track their subscriptions without userId if needed.
    // However, usually we only notify registered users or admins.
    // For admin, if role is ADMIN, we flag it.

    const existingSub = await prisma.pushSubscription.findUnique({
      where: { endpoint: subscription.endpoint }
    });

    if (!existingSub) {
      await prisma.pushSubscription.create({
        data: {
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          userId: userId || null,
          role: role === "STORE_OWNER" || role === "MANAGER" ? "STORE_OWNER" : "CUSTOMER"
        }
      });
    } else {
      // Update userId and role in case they logged in on the same browser
      await prisma.pushSubscription.update({
        where: { endpoint: subscription.endpoint },
        data: {
          userId: userId || existingSub.userId,
          role: role === "STORE_OWNER" || role === "MANAGER" ? "STORE_OWNER" : "CUSTOMER"
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error subscribing to push:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

