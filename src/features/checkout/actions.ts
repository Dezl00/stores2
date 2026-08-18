"use server"
import { db } from "@/lib/db"
import { resolveStoreId } from "@/lib/store-context"

export async function submitOrder(data: {
  customerName: string
  customerPhone: string
  address: string
  city: string
  governorate?: string
  paymentMethod?: string
  shippingCost?: number
  discount?: number
  couponCode?: string
  items: { productId: string; quantity: number; price: number }[]
  totalAmount: number
  userId?: string
}) {
  try {
    if (!data.items || data.items.length === 0) {
      return { success: false, error: "السلة فارغة" }
    }

    const storeId = await resolveStoreId()

    // Find next order ID
    const lastOrder = await db.order.findFirst({
      where: { id: { startsWith: 'AG-' }, storeId },
      orderBy: { createdAt: 'desc' }
    });
    
    let nextId = 1;
    if (lastOrder) {
      const match = lastOrder.id.match(/^AG-(\d+)$/i);
      if (match) {
        nextId = parseInt(match[1], 10) + 1;
      }
    }
    const newOrderId = `AG-${nextId}`;

    const orderData: any = {
      id: newOrderId,
      storeId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      address: data.address,
      city: data.city,
      governorate: data.governorate,
      paymentMethod: data.paymentMethod,
      shippingCost: data.shippingCost || 0,
      discount: data.discount || 0,
      couponCode: data.couponCode,
      totalAmount: data.totalAmount,
      status: "PENDING",
      items: {
        create: data.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        }))
      }
    }

    if (data.userId) {
      orderData.userId = data.userId
      
      // Update user's address/phone for future uses
      await db.user.update({
        where: { id: data.userId },
        data: {
          phone: data.customerPhone,
          address: data.address
        }
      })
    }

    const order = await db.order.create({
      data: orderData
    })

    if (data.couponCode) {
      await db.coupon.update({
        where: { code_storeId: { code: data.couponCode, storeId } },
        data: { usedCount: { increment: 1 } }
      })
    }
    
    // Notify Admin
    const { sendNotification } = await import("@/lib/send-notification")
    const config = await db.themeConfig.findFirst({ where: { storeId } })
    if (config?.adminOrderNotifications !== false) {
      await sendNotification({
        userId: undefined, // Admins
        targetRole: "ADMIN",
        title: "طلب جديد",
        message: `تم استلام طلب جديد #${order.id} بقيمة ${order.totalAmount} ج.م`,
        type: "ORDER_CREATED",
        link: `/admin/orders/${order.id}`,
        sound: true,
        storeId
      })
    }

    return { success: true, orderId: order.id }
  } catch (error) {
    console.error("Order submission failed:", error)
    return { success: false, error: "حدث خطأ أثناء معالجة الطلب" }
  }
}

export async function validateCoupon(code: string) {
  const storeId = await resolveStoreId()
  const coupon = await db.coupon.findUnique({
    where: { code_storeId: { code: code.toUpperCase(), storeId } }
  })
  
  if (!coupon) return { error: "كود الخصم غير صحيح" }
  if (!coupon.isActive) return { error: "هذا الكود غير مفعل" }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return { error: "لقد تم تجاوز الحد الأقصى لاستخدام هذا الكود" }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return { error: "هذا الكود منتهي الصلاحية" }

  return { success: true, coupon }
}
