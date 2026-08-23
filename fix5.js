const fs = require('fs');
const path = 'C:\\Users\\hp\\.gemini\\antigravity\\scratch\\stores2\\src\\features\\widget-builder\\actions.ts';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('requireStoreAdmin')) {
    content = content.replace('import { resolveStoreId } from "@/lib/store-context"',
        'import { resolveStoreId } from "@/lib/store-context"\r\nimport { requireStoreAdmin } from "@/lib/auth/require-admin"');
}

function insertAuth(funcName) {
    const rx = new RegExp(`(export async function ${funcName}\\b.*?\\r?\\n\\s*try\\s*\\{\\r?\\n\\s*const storeId = await resolveStoreId\\(\\))`, 'g');
    content = content.replace(rx, '$1\n    await requireStoreAdmin()');
}

function insertAuthAndFind(funcName, findStr) {
    const rx = new RegExp(`(export async function ${funcName}\\b.*?\\r?\\n\\s*try\\s*\\{\\r?\\n\\s*const storeId = await resolveStoreId\\(\\))`, 'g');
    content = content.replace(rx, '$1\n    await requireStoreAdmin()\n' + findStr);
}

insertAuth('createWidget');

insertAuthAndFind('updateWidgetOrder', 
    '    for (const update of updates) {\n      const existing = await db.widget.findFirst({ where: { id: update.id, storeId } })\n      if (!existing) throw new Error("Not found")\n    }');

insertAuthAndFind('deleteWidget', 
    '    const existing = await db.widget.findFirst({ where: { id, storeId } })\n    if (!existing) throw new Error("Not found")');

insertAuth('updateWidget');
content = content.replace(/const oldWidget = await db\.widget\.findFirst\(\{\s*where:\s*\{\s*id\s*\},\s*include:\s*\{\s*items:\s*true\s*\}\s*\}\)/, 
    'const oldWidget = await db.widget.findFirst({ where: { id, storeId }, include: { items: true } })\n    if (!oldWidget) throw new Error("Not found")');

insertAuth('createWidgetContentItem');
insertAuth('deleteWidgetContentItem');
content = content.replace(/const item = await db\.widgetContentItem\.findFirst\(\{\s*where:\s*\{\s*id\s*\},\s*include:\s*\{\s*widget:\s*true\s*\}\s*\}\)/, 
    'const item = await db.widgetContentItem.findFirst({\n      where: { id, widget: { storeId } },\n      include: { widget: true }\n    })\n    if (!item) throw new Error("Not found")');

insertAuth('updateWidgetContentItem');
content = content.replace(/const oldItem = await db\.widgetContentItem\.findFirst\(\{\s*where:\s*\{\s*id\s*\},\s*include:\s*\{\s*widget:\s*true\s*\}\s*\}\)/, 
    'const oldItem = await db.widgetContentItem.findFirst({\n      where: { id, widget: { storeId } },\n      include: { widget: true }\n    })\n    if (!oldItem) throw new Error("Not found")');

insertAuthAndFind('updateWidgetContentItemOrder', 
    '    for (const update of updates) {\n      const existing = await db.widgetContentItem.findFirst({ where: { id: update.id, widget: { storeId } } })\n      if (!existing) throw new Error("Not found")\n    }');

insertAuth('saveThemeSettings');

content = content.replace(/await db\.widget\.delete\(\{\s*where:\s*\{\s*id:\s*w\.id\s*\}\s*\}\)/, 
    'const existingWidget = await db.widget.findFirst({ where: { id: w.id, storeId } });\n      if (!existingWidget) throw new Error("Not found");\n      await db.widget.delete({ where: { id: w.id } })');

content = content.replace(/await db\.widget\.update\(\{\s*where:\s*\{\s*id:\s*w\.id\s*\},\s*data:\s*widgetData\s*\}\)/, 
    'const existingWidget = await db.widget.findFirst({ where: { id: w.id, storeId } });\n        if (!existingWidget) throw new Error("Not found");\n        await db.widget.update({\n          where: { id: w.id },\n          data: widgetData\n        })');

content = content.replace(/await db\.widgetContentItem\.delete\(\{\s*where:\s*\{\s*id:\s*item\.id\s*\}\s*\}\)/, 
    'const existingItem = await db.widgetContentItem.findFirst({ where: { id: item.id, widget: { storeId } } });\n          if (!existingItem) throw new Error("Not found");\n          await db.widgetContentItem.delete({ where: { id: item.id } })');

content = content.replace(/await db\.widgetContentItem\.update\(\{\s*where:\s*\{\s*id:\s*item\.id\s*\},\s*data:\s*itemData\s*\}\)/, 
    'const existingItem = await db.widgetContentItem.findFirst({ where: { id: item.id, widget: { storeId } } });\n            if (!existingItem) throw new Error("Not found");\n            await db.widgetContentItem.update({\n              where: { id: item.id },\n              data: itemData\n            })');

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
