const fs = require('fs');
const path = 'C:\\Users\\hp\\.gemini\\antigravity\\scratch\\stores2\\src\\features\\widget-builder\\actions.ts';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('requireStoreAdmin')) {
    content = content.replace('import { resolveStoreId } from "@/lib/store-context"',
        'import { resolveStoreId } from "@/lib/store-context"\nimport { requireStoreAdmin } from "@/lib/auth/require-admin"');
}

content = content.replace(/(export async function createWidget[^{]*\{\s*try\s*\{\s*const storeId = await resolveStoreId\(\))/g, 
    '$1\n    await requireStoreAdmin()');

content = content.replace(/(export async function updateWidgetOrder[^{]*\{\s*try\s*\{\s*const storeId = await resolveStoreId\(\))/g, 
    '$1\n    await requireStoreAdmin()\n    for (const update of updates) {\n      const existing = await db.widget.findFirst({ where: { id: update.id, storeId } })\n      if (!existing) throw new Error("Not found")\n    }');

content = content.replace(/(export async function deleteWidget[^{]*\{\s*try\s*\{\s*const storeId = await resolveStoreId\(\))/g, 
    '$1\n    await requireStoreAdmin()\n    const existing = await db.widget.findFirst({ where: { id, storeId } })\n    if (!existing) throw new Error("Not found")');

content = content.replace(/(export async function updateWidget\([^)]*\)\s*\{\s*try\s*\{\s*const storeId = await resolveStoreId\(\))/g, 
    '$1\n    await requireStoreAdmin()');
    
content = content.replace('const oldWidget = await db.widget.findFirst({ where: { id }, include: { items: true } })', 
    'const oldWidget = await db.widget.findFirst({ where: { id, storeId }, include: { items: true } })\n    if (!oldWidget) throw new Error("Not found")');

content = content.replace(/(export async function createWidgetContentItem[^{]*\{\s*try\s*\{\s*const storeId = await resolveStoreId\(\))/g, 
    '$1\n    await requireStoreAdmin()');

content = content.replace(/(export async function deleteWidgetContentItem[^{]*\{\s*try\s*\{\s*const storeId = await resolveStoreId\(\))/g, 
    '$1\n    await requireStoreAdmin()');

content = content.replace('const item = await db.widgetContentItem.findFirst({\n      where: { id },\n      include: { widget: true }\n    })', 
    'const item = await db.widgetContentItem.findFirst({\n      where: { id, widget: { storeId } },\n      include: { widget: true }\n    })\n    if (!item) throw new Error("Not found")');

content = content.replace(/(export async function updateWidgetContentItem[^{]*\{\s*try\s*\{\s*const storeId = await resolveStoreId\(\))/g, 
    '$1\n    await requireStoreAdmin()');

content = content.replace('const oldItem = await db.widgetContentItem.findFirst({\n      where: { id },\n      include: { widget: true }\n    })', 
    'const oldItem = await db.widgetContentItem.findFirst({\n      where: { id, widget: { storeId } },\n      include: { widget: true }\n    })\n    if (!oldItem) throw new Error("Not found")');

content = content.replace(/(export async function updateWidgetContentItemOrder[^{]*\{\s*try\s*\{\s*const storeId = await resolveStoreId\(\))/g, 
    '$1\n    await requireStoreAdmin()\n    for (const update of updates) {\n      const existing = await db.widgetContentItem.findFirst({ where: { id: update.id, widget: { storeId } } })\n      if (!existing) throw new Error("Not found")\n    }');

content = content.replace(/(export async function saveThemeSettings[^{]*\{\s*try\s*\{\s*const storeId = await resolveStoreId\(\))/g, 
    '$1\n    await requireStoreAdmin()');

content = content.replace('await db.widget.delete({ where: { id: w.id } })', 
    'const existingWidget = await db.widget.findFirst({ where: { id: w.id, storeId } });\n      if (!existingWidget) throw new Error("Not found");\n      await db.widget.delete({ where: { id: w.id } })');

content = content.replace('await db.widget.update({\n          where: { id: w.id },\n          data: widgetData\n        })', 
    'const existingWidget = await db.widget.findFirst({ where: { id: w.id, storeId } });\n        if (!existingWidget) throw new Error("Not found");\n        await db.widget.update({\n          where: { id: w.id },\n          data: widgetData\n        })');

content = content.replace('await db.widgetContentItem.delete({ where: { id: item.id } })', 
    'const existingItem = await db.widgetContentItem.findFirst({ where: { id: item.id, widget: { storeId } } });\n          if (!existingItem) throw new Error("Not found");\n          await db.widgetContentItem.delete({ where: { id: item.id } })');

content = content.replace('await db.widgetContentItem.update({\n              where: { id: item.id },\n              data: itemData\n            })', 
    'const existingItem = await db.widgetContentItem.findFirst({ where: { id: item.id, widget: { storeId } } });\n            if (!existingItem) throw new Error("Not found");\n            await db.widgetContentItem.update({\n              where: { id: item.id },\n              data: itemData\n            })');

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
