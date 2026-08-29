const fs = require('fs');
let code = fs.readFileSync('src/components/admin/product-options-manager.tsx', 'utf8');

code = code.replace(/import \{ Input \} from "@\/components\/ui\/input"\nimport \{ Label \} from "@\/components\/ui\/label"\n/, '');
code = code.replace(/setOptions\(res\.options\)/, 'setOptions(res.options || [])');

fs.writeFileSync('src/components/admin/product-options-manager.tsx', code);
console.log("Fixed product-options-manager.tsx");
