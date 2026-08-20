const fs = require('fs');

function fixWidgetBuilder() {
    const file = 'src/features/widget-builder/actions.ts';
    let content = fs.readFileSync(file, 'utf8');

    // Revert updateWidgetContentItem signature
    content = content.replace(
        /export async function updateWidgetContentItem\(id: string, widgetId: string, data: any\) {[\s\S]*?const item = await db\.widgetContentItem\.update\(\{ where: \{ id \}, data \}\)/,
        `export async function updateWidgetContentItem(id: string, data: any) {
  try {
    await requireStoreAdmin()
    const storeId = await resolveStoreId()
    const existingItem = await db.widgetContentItem.findUnique({ where: { id }, include: { widget: true } })
    if (!existingItem || existingItem.widget.storeId !== storeId) return { success: false, error: "Unauthorized" }
    const item = await db.widgetContentItem.update({ where: { id }, data })`
    );

    fs.writeFileSync(file, content, 'utf8');
}

fixWidgetBuilder();
