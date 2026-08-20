const fs = require('fs');
const path = require('path');

function scanDirectory(dir) {
    let results = [];
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            results = results.concat(scanDirectory(filePath));
        } else if (file === 'actions.ts') {
            results.push(filePath);
        }
    }
    return results;
}

const actionFiles = scanDirectory('src/features');
let auditReport = [];

for (const file of actionFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const exports = [...content.matchAll(/export async function (\w+)/g)].map(m => m[1]);
    
    for (const func of exports) {
        const funcRegex = new RegExp(`export async function ${func}[\\s\\S]*?\\n}`);
        const match = content.match(funcRegex);
        
        if (match) {
            const body = match[0];
            const hasAuth = body.includes('requireStoreAdmin') || body.includes('requirePermission');
            const hasStoreId = body.includes('resolveStoreId');
            const hasDbCall = body.includes('db.');
            const hasWhere = body.includes('where:');
            const hasStoreIdInWhere = body.includes('storeId');
            
            if (hasDbCall && (!hasAuth || !hasStoreId || (!hasStoreIdInWhere && hasWhere))) {
                auditReport.push({
                    file: file.replace(/\\/g, '/'),
                    function: func,
                    issue: 'Missing Auth/StoreId check for DB call'
                });
            }
            
            if (body.includes('revalidateTag') && !body.match(/revalidateTag\([^,]+,\s*[^)]+\)/)) {
                 auditReport.push({
                    file: file.replace(/\\/g, '/'),
                    function: func,
                    issue: 'revalidateTag missing second argument'
                });
            }
        }
    }
}

console.log(JSON.stringify(auditReport, null, 2));
