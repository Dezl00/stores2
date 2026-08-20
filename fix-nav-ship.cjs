const fs = require('fs');

function fixNavigation() {
    const file = 'src/features/navigation/actions.ts';
    let content = fs.readFileSync(file, 'utf8');

    if (!content.includes('import { requireStoreAdmin } from')) {
        content = content.replace(/import { db } from "@\/lib\/db"/, `import { db } from "@/lib/db"\nimport { requireStoreAdmin } from "@/lib/auth/require-admin"`);
    }

    content = content.replace(
        /export async function deleteMenu\(id: string\) {[\s\S]*?try {/,
        `export async function deleteMenu(id: string) {
  try {
    await requireStoreAdmin()
    const storeId = await resolveStoreId()
    const existing = await db.menu.findFirst({ where: { id, storeId } })
    if (!existing) return { success: false, error: "Unauthorized" }`
    );

    content = content.replace(
        /export async function updateMenuItem\(id: string, data: any\) {[\s\S]*?try {/,
        `export async function updateMenuItem(id: string, data: any) {
  try {
    await requireStoreAdmin()
    const storeId = await resolveStoreId()
    const existing = await db.menuItem.findFirst({ where: { id }, include: { menu: true } })
    if (!existing || existing.menu.storeId !== storeId) return { success: false, error: "Unauthorized" }`
    );

    content = content.replace(
        /export async function deleteMenuItem\(id: string\) {[\s\S]*?try {/,
        `export async function deleteMenuItem(id: string) {
  try {
    await requireStoreAdmin()
    const storeId = await resolveStoreId()
    const existing = await db.menuItem.findFirst({ where: { id }, include: { menu: true } })
    if (!existing || existing.menu.storeId !== storeId) return { success: false, error: "Unauthorized" }`
    );

    fs.writeFileSync(file, content, 'utf8');
}

function fixShipping() {
    const file = 'src/features/shipping-payment/actions.ts';
    let content = fs.readFileSync(file, 'utf8');

    if (!content.includes('import { requireStoreAdmin } from')) {
        content = content.replace(/import { db } from "@\/lib\/db"/, `import { db } from "@/lib/db"\nimport { requireStoreAdmin } from "@/lib/auth/require-admin"`);
    }

    const entities = ['Governorate', 'City', 'PaymentMethod'];
    for (const ent of entities) {
        const lower = ent.charAt(0).toLowerCase() + ent.slice(1);
        content = content.replace(
            new RegExp(`export async function update${ent}\\(id: string, data: any\\) {[\\s\\S]*?try {`),
            `export async function update${ent}(id: string, data: any) {\n  try {\n    await requireStoreAdmin()\n    const storeId = await resolveStoreId()\n    const existing = await db.${lower}.findFirst({ where: { id, storeId } })\n    if (!existing) return { success: false, error: "Unauthorized" }`
        );
        content = content.replace(
            new RegExp(`export async function delete${ent}\\(id: string\\) {[\\s\\S]*?try {`),
            `export async function delete${ent}(id: string) {\n  try {\n    await requireStoreAdmin()\n    const storeId = await resolveStoreId()\n    const existing = await db.${lower}.findFirst({ where: { id, storeId } })\n    if (!existing) return { success: false, error: "Unauthorized" }`
        );
    }
    fs.writeFileSync(file, content, 'utf8');
}

fixNavigation();
fixShipping();
