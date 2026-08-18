import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db as prisma } from "@/lib/db";
import { resolveStoreId } from "@/lib/store-context";

export async function GET(req: Request) {
  try {
    const storeId = await resolveStoreId();
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    const userId = session.user.id;
    const isAdmin = role === "STORE_OWNER" || role === "MANAGER";

    // Fetch notifications
    const notifications = await prisma.notification.findMany({
      where: isAdmin ? { userId: null, storeId } : { userId, storeId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: isAdmin ? { userId: null, isRead: false, storeId } : { userId, isRead: false, storeId },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const storeId = await resolveStoreId();
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ids } = await req.json(); // Array of notification IDs to mark as read

    const role = session.user.role;
    const userId = session.user.id;
    const isAdmin = role === "STORE_OWNER" || role === "MANAGER";

    await prisma.notification.updateMany({
      where: {
        id: { in: ids },
        storeId,
        ...(isAdmin ? { userId: null } : { userId })
      },
      data: { isRead: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

