const fs = require('fs');

function fixWidgetBuilder() {
    const file = 'src/features/widget-builder/actions.ts';
    let content = fs.readFileSync(file, 'utf8');

    if (!content.includes('import { requireStoreAdmin } from')) {
        content = content.replace(/import { db } from "@\/lib\/db"/, `import { db } from "@/lib/db"\nimport { requireStoreAdmin } from "@/lib/auth/require-admin"`);
    }

    // Add requireStoreAdmin to createWidget
    content = content.replace(
        /export async function createWidget\(data: z.infer<typeof WidgetSchema>\) {\n  try {\n    const storeId = await resolveStoreId\(\)/,
        `export async function createWidget(data: z.infer<typeof WidgetSchema>) {\n  try {\n    await requireStoreAdmin()\n    const storeId = await resolveStoreId()`
    );

    // fix deleteWidget
    content = content.replace(
        /export async function deleteWidget\(id: string\) {\n  try {\n    const storeId = await resolveStoreId\(\)\n    await db\.widget\.delete\(\{ where: \{ id \}\}\)/,
        `export async function deleteWidget(id: string) {\n  try {\n    await requireStoreAdmin()\n    const storeId = await resolveStoreId()\n    const existing = await db.widget.findFirst({ where: { id, storeId } })\n    if (!existing) return { success: false, error: "Unauthorized" }\n    await db.widget.delete({ where: { id }})`
    );

    // fix updateWidget
    content = content.replace(
        /export async function updateWidget\(id: string, data: any\) {\n  try {\n    const storeId = await resolveStoreId\(\)\n    \/\/ We use ANY here to bypass strict validation on partial updates for now\n    const widget = await db\.widget\.update\(\{ where: \{ id \}, data \}\)/,
        `export async function updateWidget(id: string, data: any) {\n  try {\n    await requireStoreAdmin()\n    const storeId = await resolveStoreId()\n    const existing = await db.widget.findFirst({ where: { id, storeId } })\n    if (!existing) return { success: false, error: "Unauthorized" }\n    // We use ANY here to bypass strict validation on partial updates for now\n    const widget = await db.widget.update({ where: { id }, data })`
    );

    // fix deleteWidgetContentItem
    content = content.replace(
        /export async function deleteWidgetContentItem\(id: string, widgetId: string\) {\n  try {\n    await db\.widgetContentItem\.delete\(\{ where: \{ id \}\}\)/,
        `export async function deleteWidgetContentItem(id: string, widgetId: string) {\n  try {\n    await requireStoreAdmin()\n    const storeId = await resolveStoreId()\n    const widget = await db.widget.findFirst({ where: { id: widgetId, storeId } })\n    if (!widget) return { success: false, error: "Unauthorized" }\n    await db.widgetContentItem.delete({ where: { id }})`
    );

    // fix updateWidgetContentItem
    content = content.replace(
        /export async function updateWidgetContentItem\(id: string, data: any\) {\n  try {\n    const item = await db\.widgetContentItem\.update\(\{ where: \{ id \}, data \}\)/,
        `export async function updateWidgetContentItem(id: string, widgetId: string, data: any) {\n  try {\n    await requireStoreAdmin()\n    const storeId = await resolveStoreId()\n    const widget = await db.widget.findFirst({ where: { id: widgetId, storeId } })\n    if (!widget) return { success: false, error: "Unauthorized" }\n    const item = await db.widgetContentItem.update({ where: { id }, data })`
    );

    fs.writeFileSync(file, content, 'utf8');
}

fixWidgetBuilder();
