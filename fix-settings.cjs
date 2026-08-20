const fs = require('fs');

function fixSettings() {
    const file = 'src/features/settings/actions.ts';
    let content = fs.readFileSync(file, 'utf8');

    if (!content.includes('import { requireStoreAdmin } from')) {
        content = content.replace(/import { db } from "@\/lib\/db"/, `import { db } from "@/lib/db"\nimport { requireStoreAdmin } from "@/lib/auth/require-admin"`);
    }

    content = content.replace(
        /export async function updateBranch\(id: string, data: any\) {[\s\S]*?try {/,
        `export async function updateBranch(id: string, data: any) {
  try {
    await requireStoreAdmin()
    const storeId = await resolveStoreId()
    const existing = await db.branch.findFirst({ where: { id, storeId } })
    if (!existing) return { success: false, error: "Unauthorized" }`
    );

    content = content.replace(
        /export async function deleteBranch\(id: string\) {[\s\S]*?try {/,
        `export async function deleteBranch(id: string) {
  try {
    await requireStoreAdmin()
    const storeId = await resolveStoreId()
    const existing = await db.branch.findFirst({ where: { id, storeId } })
    if (!existing) return { success: false, error: "Unauthorized" }`
    );
    
    // Also updateDomainSettings and updateStoreSettings
    content = content.replace(
        /export async function updateDomainSettings[\s\S]*?try {/,
        `export async function updateDomainSettings(data: any) {
  try {
    await requireStoreAdmin()`
    );

    content = content.replace(
        /export async function updateStoreSettings[\s\S]*?try {/,
        `export async function updateStoreSettings(data: any) {
  try {
    await requireStoreAdmin()`
    );

    fs.writeFileSync(file, content, 'utf8');
}

fixSettings();
