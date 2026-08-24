"use server"

import { db } from "@/lib/db"
import { revalidatePath, revalidateTag } from "next/cache"
import { z } from "zod"
import { resolveStoreId } from "@/lib/store-context"
import { requireStoreAdmin } from "@/lib/auth/require-admin"

async function translateToEnglish(text: string): Promise<string> {
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`);
    const data = await res.json();
    return data[0][0][0] || text;
  } catch (e) {
    return text;
  }
}

const WidgetSchema = z.object({
  type: z.string().min(1),
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  status: z.boolean().default(true),
  sortOrder: z.number().default(0),
  showDesktop: z.boolean().default(true),
  showTablet: z.boolean().default(true),
  showMobile: z.boolean().default(true),
  settings: z.any().optional(),
  dataSource: z.any().optional(),
  display: z.any().optional(),
})

export async function createWidget(data: z.infer<typeof WidgetSchema>) {
  try {
    const storeId = await resolveStoreId()
    await requireStoreAdmin()
    const parsed = WidgetSchema.parse(data)
    
    // We should compute sortOrder if it's not provided explicitly, but for now we trust the client.
    const widget = await db.widget.create({ data: { ...parsed, storeId } })
    
    
    
    revalidatePath("/admin/widgets")
    revalidatePath("/")
    revalidateTag("widgets", "default")
    return { success: true, widget }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateWidgetOrder(updates: { id: string, sortOrder: number }[]) {
  try {
    const storeId = await resolveStoreId()
    await requireStoreAdmin()
    for (const update of updates) {
      const existing = await db.widget.findFirst({ where: { id: update.id, storeId } })
      if (!existing) throw new Error("Not found")
    }
    // Perform sequentially or in a transaction. Let's do a transaction.
    await db.$transaction(
      updates.map((update) => 
        db.widget.update({ where: { id: update.id },
          data: { sortOrder: update.sortOrder }
        })
      )
    )
    
    
    
    revalidatePath("/admin/widgets")
    revalidatePath("/")
    revalidateTag("widgets", "default")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to update widget order" }
  }
}

export async function getWidgets() {
  try {
    const storeId = await resolveStoreId()
    const widgets = await db.widget.findMany({
      where: { storeId },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' }
    })
    return { success: true, widgets }
  } catch (error: any) {
    return { success: false, error: "Failed to fetch widgets" }
  }
}

export async function deleteWidget(id: string) {
  try {
    const storeId = await resolveStoreId()
    await requireStoreAdmin()
    const existing = await db.widget.findFirst({ where: { id, storeId } })
    if (!existing) throw new Error("Not found")
    await db.widget.delete({ where: { id }})
    
    
    
    revalidatePath("/admin/widgets")
    revalidatePath("/")
    revalidateTag("widgets", "default")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete widget" }
  }
}

export async function updateWidget(id: string, data: any) {
  try {
    const storeId = await resolveStoreId()
    await requireStoreAdmin()
    const oldWidget = await db.widget.findFirst({ where: { id, storeId }, include: { items: true } })
    if (!oldWidget) throw new Error("Not found")
    const widget = await db.widget.update({ where: { id },
      data
    })
    
    // Cleanup if disableRouting was toggled ON for BrandSlider
    if (widget.type === "BrandSlider") {
      const oldDisable = (oldWidget?.settings as any)?.disableRouting === true
      const newDisable = (widget.settings as any)?.disableRouting === true
      if (!oldDisable && newDisable && oldWidget) {
        for (const item of oldWidget.items) {
          if (item.title) {
            const existingBrand = await db.brand.findFirst({ where: { name: item.title, storeId } })
            if (existingBrand) {
              await db.product.updateMany({ where: { brandId: existingBrand.id, storeId }, data: { brandId: null } })
              await db.brand.delete({ where: { id: existingBrand.id }})
            }
          }
        }
      }
    }
    
    revalidatePath("/admin/widgets")
    revalidatePath("/")
    revalidateTag("widgets", "default")
    return { success: true, widget }
  } catch (error: any) {
    return { success: false, error: "Failed to update widget" }
  }
}

export async function createWidgetContentItem(widgetId: string, formData: FormData) {
  try {
    const storeId = await resolveStoreId()
    await requireStoreAdmin()
    const desktopImage = formData.get("desktopImage") as string || null
    const mobileImage = formData.get("mobileImage") as string || null
    const title = formData.get("title") as string || null
    const subtitle = formData.get("subtitle") as string || null
    const buttonText = formData.get("buttonText") as string || null
    let buttonUrl = formData.get("buttonUrl") as string || null
    const sortOrder = parseInt(formData.get("sortOrder") as string) || 0

    // Check if widget is BrandSlider
    const widget = await db.widget.findFirst({ where: { id: widgetId, storeId } })
    const disableRouting = (widget?.settings as any)?.disableRouting === true
    
    if (widget?.type === "BrandSlider" && title && !disableRouting) {
      // Auto-sync: Create Brand
      const translated = await translateToEnglish(title);
      let baseSlug = translated.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w0-9\-]+/g, '');
      if (!baseSlug || baseSlug === '-') {
        baseSlug = 'brand';
      }
      let slug = baseSlug;
      let counter = 1;
      
      // Ensure unique slug
      while (await db.brand.findFirst({ where: { slug, storeId } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      const brand = await db.brand.create({
        data: {
          storeId,
          name: title,
          slug: slug,
          logoUrl: desktopImage,
        }
      })
      // Auto-link the buttonUrl to the brand products if not explicitly set
      if (!buttonUrl) {
        buttonUrl = `/brand/${brand.slug}`
      }
    } else if (widget?.type === "ProductList" && title) {
      // Create Collection
      const translated = await translateToEnglish(title);
      let baseSlug = translated.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w0-9\-]+/g, '');
      if (!baseSlug || baseSlug === '-') baseSlug = 'collection';
      
      let slug = baseSlug;
      let counter = 1;
      while (await db.collection.findFirst({ where: { slug, storeId } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      const productIds = formData.get("productIds") as string;
      const parsedProductIds = productIds ? JSON.parse(productIds) : [];
      
      const collection = await db.collection.create({
        data: {
          storeId,
          name: title,
          slug: slug,
          products: {
            connect: parsedProductIds.map((id: string) => ({ id }))
          }
        }
      })
      if (!buttonUrl) buttonUrl = `/collection/${collection.slug}`
    }

    let settings: any = null;
    if (widget?.type === "HeroSlider") {
      settings = {
        alignment: formData.get("alignment") as string || "center",
        buttonStyle: formData.get("buttonStyle") as string || "solid",
        buttonBgColor: formData.get("buttonBgColor") as string || "primary",
        buttonCustomBgColor: formData.get("buttonCustomBgColor") as string || "",
        buttonTextColor: formData.get("buttonTextColor") as string || "white",
        buttonCustomTextColor: formData.get("buttonCustomTextColor") as string || "",
        overlayOpacity: formData.get("overlayOpacity") ? parseInt(formData.get("overlayOpacity") as string) : 40,
      };
    }

    const item = await db.widgetContentItem.create({
      data: {
        widgetId,
        desktopImage,
        mobileImage,
        title,
        subtitle,
        buttonText,
        buttonUrl,
        sortOrder,
        settings
      }
    })

    revalidatePath("/admin/widgets")
    revalidatePath("/")
    revalidateTag("widgets", "default")
    return { success: true, item }
  } catch (error: any) {
    return { success: false, error: "Failed to create widget item" }
  }
}

export async function deleteWidgetContentItem(id: string) {
  try {
    const storeId = await resolveStoreId()
    await requireStoreAdmin()
    const item = await db.widgetContentItem.findFirst({
      where: { id, widget: { storeId } },
      include: { widget: true }
    })
    if (!item) throw new Error("Not found")
    
    if (item?.widget?.type === "BrandSlider" && item.title) {
      const existingBrand = await db.brand.findFirst({
        where: { name: item.title, storeId }
      })
      if (existingBrand) {
        await db.product.updateMany({ where: { brandId: existingBrand.id, storeId }, data: { brandId: null } })
        await db.brand.delete({ where: { id: existingBrand.id }})
      }
    } else if (item?.widget?.type === "ProductList" && item.title) {
      const existingCollection = await db.collection.findFirst({
        where: { name: item.title, storeId }
      })
      if (existingCollection) {
        await db.collection.delete({ where: { id: existingCollection.id }})
      }
    }

    await db.widgetContentItem.delete({ where: { id }})
    revalidatePath("/admin/widgets")
    revalidatePath("/")
    revalidateTag("widgets", "default")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete widget item" }
  }
}

export async function updateWidgetContentItem(id: string, formData: FormData) {
  try {
    const storeId = await resolveStoreId()
    await requireStoreAdmin()
    const dataToUpdate: any = {}
    
    if (formData.has("desktopImage")) dataToUpdate.desktopImage = formData.get("desktopImage") as string
    if (formData.has("mobileImage")) dataToUpdate.mobileImage = formData.get("mobileImage") as string
    if (formData.has("title")) dataToUpdate.title = formData.get("title") as string
    if (formData.has("subtitle")) dataToUpdate.subtitle = formData.get("subtitle") as string
    if (formData.has("buttonText")) dataToUpdate.buttonText = formData.get("buttonText") as string
    
    let buttonUrl: string | null | undefined = undefined;
    if (formData.has("buttonUrl")) {
      buttonUrl = formData.get("buttonUrl") as string
      dataToUpdate.buttonUrl = buttonUrl
    }
    
    if (formData.has("alignment")) {
      dataToUpdate.settings = {
        alignment: formData.get("alignment") as string || "center",
        buttonStyle: formData.get("buttonStyle") as string || "solid",
        buttonBgColor: formData.get("buttonBgColor") as string || "primary",
        buttonCustomBgColor: formData.get("buttonCustomBgColor") as string || "",
        buttonTextColor: formData.get("buttonTextColor") as string || "white",
        buttonCustomTextColor: formData.get("buttonCustomTextColor") as string || "",
        overlayOpacity: formData.get("overlayOpacity") ? parseInt(formData.get("overlayOpacity") as string) : 40,
      }
    }

    const title = dataToUpdate.title

    const oldItem = await db.widgetContentItem.findFirst({
      where: { id, widget: { storeId } },
      include: { widget: true }
    })
    if (!oldItem) throw new Error("Not found")

    if (oldItem?.widget?.type === "BrandSlider" && title !== undefined) {
      const disableRouting = (oldItem?.widget?.settings as any)?.disableRouting === true
      
      const slug = title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0621-\u064A0-9\-]+/g, '') + '-' + Math.random().toString(36).substring(2, 6)
      
      const existingBrand = await db.brand.findFirst({
        where: { name: oldItem.title || "", storeId }
      })

      if (disableRouting) {
        if (existingBrand) {
          await db.product.updateMany({ where: { brandId: existingBrand.id, storeId }, data: { brandId: null } })
          await db.brand.delete({ where: { id: existingBrand.id }})
        }
      } else {
        // If the title changed, we create a new brand (since we don't have a direct link to the old brand ID)
        // If the title is the same, we update the existing brand's logo
        if (existingBrand) {
          await db.brand.update({ where: { id: existingBrand.id },
            data: {
              name: title,
              logoUrl: dataToUpdate.desktopImage || existingBrand.logoUrl
            }
          })
          if (!buttonUrl) {
            buttonUrl = `/brand/${existingBrand.slug}`
            dataToUpdate.buttonUrl = buttonUrl
          }
        } else {
          const brand = await db.brand.create({
            data: {
              storeId,
              name: title,
              slug: slug,
              logoUrl: dataToUpdate.desktopImage || oldItem.desktopImage,
            }
          })
          if (!buttonUrl) {
            buttonUrl = `/brand/${brand.slug}`
            dataToUpdate.buttonUrl = buttonUrl
          }
        }
      }
    } else if (oldItem?.widget?.type === "ProductList" && title !== undefined) {
      const slug = title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0621-\u064A0-9\-]+/g, '') + '-' + Math.random().toString(36).substring(2, 6)
      const existingCollection = await db.collection.findFirst({ where: { name: oldItem.title || "", storeId } })
      
      let newCollection;
      if (existingCollection) {
        newCollection = await db.collection.update({ where: { id: existingCollection.id },
          data: { name: title }
        })
        if (!buttonUrl) {
          buttonUrl = `/collection/${existingCollection.slug}`
          dataToUpdate.buttonUrl = buttonUrl
        }
      } else {
        newCollection = await db.collection.create({
          data: { storeId, name: title, slug }
        })
        if (!buttonUrl) {
          buttonUrl = `/collection/${newCollection.slug}`
          dataToUpdate.buttonUrl = buttonUrl
        }
      }

      if (formData.has("productIds")) {
        const productIds = JSON.parse(formData.get("productIds") as string);
        await db.collection.update({ where: { id: newCollection.id },
          data: {
            products: {
              set: productIds.map((id: string) => ({ id }))
            }
          }
        })
      }
    }

    const item = await db.widgetContentItem.update({ where: { id },
      data: dataToUpdate
    })

    revalidatePath("/admin/widgets")
    revalidatePath("/")
    revalidateTag("widgets", "default")
    return { success: true, item }
  } catch (error: any) {
    return { success: false, error: "Failed to update widget item" }
  }
}

export async function getProducts() {
  const storeId = await resolveStoreId()
  const products = await db.product.findMany({
    where: { storeId },
    select: { id: true, name: true, price: true, categoryId: true, slug: true },
    orderBy: { createdAt: 'desc' }
  })
  return products
}

export async function getCategories() {
  const storeId = await resolveStoreId()
  const categories = await db.category.findMany({
    where: { storeId },
    select: { id: true, name: true, slug: true },
    orderBy: { createdAt: 'desc' }
  })
  return categories
}

export async function getCollections() {
  const storeId = await resolveStoreId()
  const collections = await db.collection.findMany({
    where: { storeId },
    select: { id: true, name: true, slug: true },
    orderBy: { createdAt: 'desc' }
  })
  return collections
}

export async function getCollectionProducts(collectionId: string) {
  const storeId = await resolveStoreId()
  const collection = await db.collection.findFirst({
    where: { id: collectionId, storeId },
    include: { products: { select: { id: true } } }
  })
  return collection?.products.map(p => p.id) || []
}

export async function updateWidgetContentItemOrder(updates: { id: string, sortOrder: number }[]) {
  try {
    const storeId = await resolveStoreId()
    await requireStoreAdmin()
    for (const update of updates) {
      const existing = await db.widgetContentItem.findFirst({ where: { id: update.id, widget: { storeId } } })
      if (!existing) throw new Error("Not found")
    }
    await db.$transaction(
      updates.map((update) => 
        db.widgetContentItem.update({ where: { id: update.id },
          data: { sortOrder: update.sortOrder }
        })
      )
    )
    
    revalidatePath("/admin/widgets")
    revalidatePath("/")
    revalidateTag("widgets", "default")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to update widget item order" }
  }
}

export async function saveThemeSettings(payload: { widgets: any[], headerSettings: any, footerSettings: any }) {
  try {
    const storeId = await resolveStoreId()
    await requireStoreAdmin()
    const { widgets, headerSettings, footerSettings } = payload

    // 1. Update ThemeConfig for Header and Footer
    const themeConfig = await db.themeConfig.findUnique({ where: { storeId } })
    if (themeConfig) {
      await db.themeConfig.update({
        where: { storeId },
        data: {
          headerSettings: headerSettings || {},
          footerSettings: footerSettings || {}
        }
      })
    } else {
      await db.themeConfig.create({
        data: {
          storeId,
          headerSettings: headerSettings || {},
          footerSettings: footerSettings || {}
        }
      })
    }

    // 2. Handle Widgets (Bulk Sync)
    const currentWidgets = await db.widget.findMany({ where: { storeId } })
    const incomingIds = widgets.filter(w => !w.id.startsWith('new-')).map(w => w.id)
    
    // Delete widgets that are no longer in the payload
    const widgetsToDelete = currentWidgets.filter(w => !incomingIds.includes(w.id))
    for (const w of widgetsToDelete) {
      const existingWidget = await db.widget.findFirst({ where: { id: w.id, storeId } });
      if (!existingWidget) throw new Error("Not found");
      await db.widget.delete({ where: { id: w.id } })
    }

    // Upsert remaining widgets
    for (const [index, w] of widgets.entries()) {
      const widgetData = {
        type: w.type,
        title: w.title,
        subtitle: w.subtitle,
        status: w.status,
        sortOrder: index,
        showDesktop: w.showDesktop !== false,
        showTablet: w.showTablet !== false,
        showMobile: w.showMobile !== false,
        settings: w.settings || {},
      }

      let currentWidgetId = w.id;
      if (w.id.startsWith('new-')) {
        const newW = await db.widget.create({
          data: { ...widgetData, storeId }
        })
        currentWidgetId = newW.id
      } else {
        const existingWidget = await db.widget.findFirst({ where: { id: w.id, storeId } });
        if (!existingWidget) throw new Error("Not found");
        await db.widget.update({
          where: { id: w.id },
          data: widgetData
        })
      }

      // Sync items if modified
      if (w.items && Array.isArray(w.items)) {
        const existingItems = await db.widgetContentItem.findMany({ where: { widgetId: currentWidgetId } })
        const incomingItemIds = w.items.filter((item: any) => !item.id.startsWith('new-') && !item.id.startsWith('item-')).map((item: any) => item.id)
        
        // Delete removed items
        const itemsToDelete = existingItems.filter(item => !incomingItemIds.includes(item.id))
        for (const item of itemsToDelete) {
          const existingItem = await db.widgetContentItem.findFirst({ where: { id: item.id, widget: { storeId } } });
          if (!existingItem) throw new Error("Not found");
          await db.widgetContentItem.delete({ where: { id: item.id } })
        }

        // Upsert items
        for (const [itemIndex, item] of w.items.entries()) {
          const itemData = {
            title: item.title,
            subtitle: item.subtitle,
            desktopImage: item.desktopImage,
            mobileImage: item.mobileImage,
            buttonText: item.buttonText,
            buttonUrl: item.buttonUrl,
            sortOrder: itemIndex,
            settings: item.settings || {},
          }

          if (item.id.startsWith('new-') || item.id.startsWith('item-')) {
            await db.widgetContentItem.create({
              data: { ...itemData, widgetId: currentWidgetId }
            })
          } else {
            const existingItem = await db.widgetContentItem.findFirst({ where: { id: item.id, widget: { storeId } } });
            if (!existingItem) throw new Error("Not found");
            await db.widgetContentItem.update({
              where: { id: item.id },
              data: itemData
            })
          }
        }
      }
    }

    revalidatePath("/admin/storefront/theme")
    revalidatePath("/", "layout")
    revalidatePath("/", "page")
    revalidateTag("widgets", "default")
    revalidateTag("layout-data", "default")

    return { success: true }
  } catch (error: any) {
    console.error("Save Theme Error:", error)
    return { success: false, error: "Failed to save theme settings" }
  }
}
