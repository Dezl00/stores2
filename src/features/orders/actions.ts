"use server"

import { requireStoreAdmin, requirePermission } from "@/lib/auth/require-admin"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { sendNotification } from "@/lib/send-notification"
import { auth } from "@/lib/auth"
import { resolveStoreId } from "@/lib/store-context"

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const storeId = await resolveStoreId()
    try {
      await requirePermission("orders.edit")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const order = await db.order.findFirst({ where: { id: orderId, storeId }, include: { user: true } })
    if (!order) return { success: false, error: "Order not found" }

    await db.order.update({ where: { id: orderId },
      data: { status }
    })

    const session = await auth()
    if (session?.user?.id) {
      await db.activityLog.create({
        data: {
          storeId,
          userId: session.user.id,
          action: "UPDATE_ORDER_STATUS",
          entityType: "Order",
          entityId: orderId,
          details: { status }
        }
      })
    }

    // Send notification to customer if they exist and want updates
    if (order.userId) {
      const user = await db.storeUser.findUnique({ where: { id: order.userId } })
      if (user?.orderUpdatesEnabled) {
        let statusAr = status === "CONFIRMED" ? "تم تأكيد الطلب" : status === "SHIPPED" ? "جاري الشحن" : status === "OUT_FOR_DELIVERY" ? "خرج للتوصيل" : status === "DELIVERED" ? "تم التوصيل" : status === "CANCELLED" ? "تم الإلغاء" : status
        
        // Find product image if available
        let imageUrl: string | undefined = undefined;
        const fullOrder = await db.order.findFirst({ where: { id: orderId, storeId },
          include: {
            items: {
              include: { 
                product: {
                  include: { images: true }
                } 
              }
            }
          }
        });
        
        if (fullOrder?.items?.[0]?.product?.images) {
          const images = fullOrder.items[0].product.images as any[];
          if (images && images.length > 0) {
            imageUrl = images[0].url;
          }
        }

        await sendNotification({
          userId: order.userId,
          title: "تحديث حالة الطلب",
          message: `تم تحديث حالة طلبك #${orderId.slice(-6).toUpperCase()} إلى: ${statusAr}`,
          type: "ORDER_UPDATED",
          link: `/account?tab=orders`,
          sound: true,
          image: imageUrl,
          storeId
        })
      }
    }

    revalidatePath("/admin/orders")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to update order status" }
  }
}

export async function deleteOrder(orderId: string) {
  try {
    const storeId = await resolveStoreId()
    try {
      await requirePermission("orders.delete")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const session = await auth()
    
    await db.order.delete({ where: { id: orderId }})

    if (session?.user?.id) {
      await db.activityLog.create({
        data: {
          storeId,
          userId: session.user.id,
          action: "DELETE_ORDER",
          entityType: "Order",
          entityId: orderId
        }
      })
    }
    revalidatePath("/admin/orders")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete order" }
  }
}
