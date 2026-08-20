const fs = require('fs');

function fixAccounts() {
    const file = 'src/features/accounts/actions.ts';
    let content = fs.readFileSync(file, 'utf8');
    
    // Add requireStoreAdmin if not present
    if (!content.includes('requireStoreAdmin')) {
        content = content.replace(/import { db } from "@\/lib\/db"/, `import { db } from "@/lib/db"\nimport { requireStoreAdmin } from "@/lib/auth/require-admin"`);
    }

    // Fix updateStoreUser
    content = content.replace(
        /export async function updateStoreUser\(id: string, data: any\) {[\s\S]*?try {/,
        `export async function updateStoreUser(id: string, data: any) {
  try {
    await requireStoreAdmin()
    const storeId = await resolveStoreId()
    const existing = await db.storeUser.findFirst({ where: { id, storeId } })
    if (!existing) return { success: false, error: "Unauthorized" }`
    );
    
    content = content.replace(
        /await prisma\.storeUser\.update\(\{[\s]*where: \{ id \},/g,
        `await prisma.storeUser.update({ where: { id },`
    ); // This replaces the old but we already added the findFirst check. Wait, the code uses prisma.storeUser... let's replace prisma with db if needed, or leave it. Actually the file uses `prisma.storeUser`? Let's check.

    // Fix deleteStoreUser
    content = content.replace(
        /export async function deleteStoreUser\(id: string\) {[\s\S]*?try {/,
        `export async function deleteStoreUser(id: string) {
  try {
    await requireStoreAdmin()
    const storeId = await resolveStoreId()
    const existing = await db.storeUser.findFirst({ where: { id, storeId } })
    if (!existing) return { success: false, error: "Unauthorized" }`
    );
    
    fs.writeFileSync(file, content, 'utf8');
}

fixAccounts();
