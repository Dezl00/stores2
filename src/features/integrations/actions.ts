'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { resolveStoreId } from '@/lib/store-context';

export async function saveIntegration(provider: string, category: string, config: any, isActive: boolean) {
  try {
    const storeId = await resolveStoreId();

    await db.appIntegration.upsert({
      where: {
        storeId_provider: {
          storeId,
          provider
        }
      },
      update: {
        category,
        config,
        isActive
      },
      create: {
        storeId,
        provider,
        category,
        config,
        isActive
      }
    });

    revalidatePath('/admin/system/apps');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to save integration' };
  }
}

export async function toggleIntegration(provider: string, category: string, isActive: boolean) {
  try {
    const storeId = await resolveStoreId();

    await db.appIntegration.upsert({
      where: {
        storeId_provider: {
          storeId,
          provider
        }
      },
      update: {
        isActive
      },
      create: {
        storeId,
        provider,
        category,
        config: {},
        isActive
      }
    });

    revalidatePath('/admin/system/apps');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to toggle integration' };
  }
}
