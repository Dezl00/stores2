const fs = require('fs');

const file = 'src/features/settings/actions.ts';
let content = fs.readFileSync(file, 'utf8');

// The file might already import requirePermission. Let's check.
if (!content.includes('requireStoreAdmin')) {
    content = content.replace(/import \{ requirePermission \} from "@\/lib\/auth\/require-admin"/, 'import { requirePermission, requireStoreAdmin } from "@/lib/auth/require-admin"');
}

// 1. updateBranch
content = content.replace(
    /export async function updateBranch\(id: string, formData: FormData\) {\n  try {\n    try {\n      await requirePermission\("settings.general"\)\n    } catch \(e: any\) {\n      return \{ success: false, error: e\.message \|\| 'Unauthorized' \}\n    }\n    const storeId = await resolveStoreId\(\)/g,
    `export async function updateBranch(id: string, formData: FormData) {
  try {
    try {
      await requirePermission("settings.general")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const storeId = await resolveStoreId()
    const existing = await db.branch.findFirst({ where: { id, storeId } })
    if (!existing) return { success: false, error: "Not found or unauthorized" }`
);

// 2. deleteBranch
content = content.replace(
    /export async function deleteBranch\(id: string\) {\n  try {\n    try {\n      await requirePermission\("settings.general"\)\n    } catch \(e: any\) {\n      return \{ success: false, error: e\.message \|\| 'Unauthorized' \}\n    }\n    const storeId = await resolveStoreId\(\)/g,
    `export async function deleteBranch(id: string) {
  try {
    try {
      await requirePermission("settings.general")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const storeId = await resolveStoreId()
    const existing = await db.branch.findFirst({ where: { id, storeId } })
    if (!existing) return { success: false, error: "Not found or unauthorized" }`
);

// 3. updateDomainSettings - add requirePermission
content = content.replace(
    /export async function updateDomainSettings\(formData: FormData\) {\n  try {\n    const storeId = await resolveStoreId\(\)/g,
    `export async function updateDomainSettings(formData: FormData) {
  try {
    await requireStoreAdmin()
    const storeId = await resolveStoreId()`
);

// 4. checkDomainVerification
content = content.replace(
    /export async function checkDomainVerification\(\) {\n  try {\n    const storeId = await resolveStoreId\(\)/g,
    `export async function checkDomainVerification() {
  try {
    await requireStoreAdmin()
    const storeId = await resolveStoreId()`
);

fs.writeFileSync(file, content, 'utf8');
