const fs = require('fs');

const file = 'src/features/navigation/actions.ts';
let content = fs.readFileSync(file, 'utf8');

// Replace the duplicate let/const storeId instances.
// We can just find instances of:
// const storeId = await resolveStoreId()
// const storeId = await resolveStoreId()
// and replace with a single one.

content = content.replace(/const storeId = await resolveStoreId\(\)\s+const storeId = await resolveStoreId\(\)/g, "const storeId = await resolveStoreId()");

fs.writeFileSync(file, content, 'utf8');
