"use server";

import { requireStoreAdmin, requirePermission } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { resolveStoreId } from "@/lib/store-context";

export async function deleteCustomer(userId: string) {
  try {
    try {
      await requirePermission("customers.delete");
    } catch (e: any) {
      return { success: false, error: e.message || "Unauthorized" };
    }

    const storeId = await resolveStoreId();

    await db.storeUser.delete({
      where: { id: userId, storeId },
    });
    revalidatePath("/admin/customers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Failed to delete customer" };
  }
}
