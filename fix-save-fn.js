const fs = require('fs');

let content = fs.readFileSync('src/features/widget-builder/actions.ts', 'utf8');

// Find the saveThemeSettings function and replace it entirely
const startMarker = 'export async function saveThemeSettings';
const startIdx = content.indexOf(startMarker);

if (startIdx === -1) {
  console.error('Could not find saveThemeSettings');
  process.exit(1);
}

// Everything before the function
const before = content.substring(0, startIdx);

const newFunction = `export async function saveThemeSettings(payload: { widgets: any[], headerSettings: any, footerSettings: any }) {
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
    revalidateTag("widgets")
    revalidateTag("layout-data")

    return { success: true }
  } catch (error: any) {
    console.error("Save Theme Error:", error)
    return { success: false, error: "Failed to save theme settings" }
  }
}
`;

fs.writeFileSync('src/features/widget-builder/actions.ts', before + newFunction, 'utf8');
console.log('Fixed saveThemeSettings function');
