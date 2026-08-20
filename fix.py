import re

file_path = r'C:\Users\hp\.gemini\antigravity\scratch\stores2\src\features\widget-builder\actions.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
if 'requireStoreAdmin' not in content:
    content = content.replace('import { resolveStoreId } from "@/lib/store-context"',
                              'import { resolveStoreId } from "@/lib/store-context"\nimport { requireStoreAdmin } from "@/lib/auth/require-admin"')

# 1. createWidget
content = re.sub(
    r'(export async function createWidget[^{]*\{\s*try\s*\{\s*const storeId = await resolveStoreId\(\))',
    r'\1\n    await requireStoreAdmin()',
    content
)

# 2. updateWidgetOrder
content = re.sub(
    r'(export async function updateWidgetOrder[^{]*\{\s*try\s*\{\s*const storeId = await resolveStoreId\(\))',
    r'\1\n    await requireStoreAdmin()\n    for (const update of updates) {\n      const existing = await db.widget.findFirst({ where: { id: update.id, storeId } })\n      if (!existing) throw new Error("Not found")\n    }',
    content
)

# 3. deleteWidget
content = re.sub(
    r'(export async function deleteWidget[^{]*\{\s*try\s*\{\s*const storeId = await resolveStoreId\(\))',
    r'\1\n    await requireStoreAdmin()\n    const existing = await db.widget.findFirst({ where: { id, storeId } })\n    if (!existing) throw new Error("Not found")',
    content
)

# 4. updateWidget
content = re.sub(
    r'(export async function updateWidget\([^)]*\)\s*\{\s*try\s*\{\s*const storeId = await resolveStoreId\(\))',
    r'\1\n    await requireStoreAdmin()',
    content
)
content = content.replace(
    'const oldWidget = await db.widget.findFirst({ where: { id }, include: { items: true } })',
    'const oldWidget = await db.widget.findFirst({ where: { id, storeId }, include: { items: true } })\n    if (!oldWidget) throw new Error("Not found")'
)

# 5. createWidgetContentItem
content = re.sub(
    r'(export async function createWidgetContentItem[^{]*\{\s*try\s*\{\s*const storeId = await resolveStoreId\(\))',
    r'\1\n    await requireStoreAdmin()',
    content
)

# 6. deleteWidgetContentItem
content = re.sub(
    r'(export async function deleteWidgetContentItem[^{]*\{\s*try\s*\{\s*const storeId = await resolveStoreId\(\))',
    r'\1\n    await requireStoreAdmin()',
    content
)
content = content.replace(
    'const item = await db.widgetContentItem.findFirst({\n      where: { id },\n      include: { widget: true }\n    })',
    'const item = await db.widgetContentItem.findFirst({\n      where: { id, widget: { storeId } },\n      include: { widget: true }\n    })\n    if (!item) throw new Error("Not found")'
)

# 7. updateWidgetContentItem
content = re.sub(
    r'(export async function updateWidgetContentItem[^{]*\{\s*try\s*\{\s*const storeId = await resolveStoreId\(\))',
    r'\1\n    await requireStoreAdmin()',
    content
)
content = content.replace(
    'const oldItem = await db.widgetContentItem.findFirst({\n      where: { id },\n      include: { widget: true }\n    })',
    'const oldItem = await db.widgetContentItem.findFirst({\n      where: { id, widget: { storeId } },\n      include: { widget: true }\n    })\n    if (!oldItem) throw new Error("Not found")'
)

# 8. updateWidgetContentItemOrder
content = re.sub(
    r'(export async function updateWidgetContentItemOrder[^{]*\{\s*try\s*\{\s*const storeId = await resolveStoreId\(\))',
    r'\1\n    await requireStoreAdmin()\n    for (const update of updates) {\n      const existing = await db.widgetContentItem.findFirst({ where: { id: update.id, widget: { storeId } } })\n      if (!existing) throw new Error("Not found")\n    }',
    content
)

# 9. saveThemeSettings
content = re.sub(
    r'(export async function saveThemeSettings[^{]*\{\s*try\s*\{\s*const storeId = await resolveStoreId\(\))',
    r'\1\n    await requireStoreAdmin()',
    content
)
# saveThemeSettings deletes and updates
content = content.replace(
    'await db.widget.delete({ where: { id: w.id } })',
    'const existingWidget = await db.widget.findFirst({ where: { id: w.id, storeId } });\n      if (!existingWidget) throw new Error("Not found");\n      await db.widget.delete({ where: { id: w.id } })'
)
content = content.replace(
    'await db.widget.update({\n          where: { id: w.id },\n          data: widgetData\n        })',
    'const existingWidget = await db.widget.findFirst({ where: { id: w.id, storeId } });\n        if (!existingWidget) throw new Error("Not found");\n        await db.widget.update({\n          where: { id: w.id },\n          data: widgetData\n        })'
)
content = content.replace(
    'await db.widgetContentItem.delete({ where: { id: item.id } })',
    'const existingItem = await db.widgetContentItem.findFirst({ where: { id: item.id, widget: { storeId } } });\n          if (!existingItem) throw new Error("Not found");\n          await db.widgetContentItem.delete({ where: { id: item.id } })'
)
content = content.replace(
    'await db.widgetContentItem.update({\n              where: { id: item.id },\n              data: itemData\n            })',
    'const existingItem = await db.widgetContentItem.findFirst({ where: { id: item.id, widget: { storeId } } });\n            if (!existingItem) throw new Error("Not found");\n            await db.widgetContentItem.update({\n              where: { id: item.id },\n              data: itemData\n            })'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
