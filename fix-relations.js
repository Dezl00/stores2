const fs = require('fs');
let code = fs.readFileSync('prisma/schema.prisma', 'utf8');

code = code.replace(/ProductOption\s*ProductOption\[\]/g, 'options ProductOption[]');
code = code.replace(/ProductVariant\s*ProductVariant\[\]/g, 'variants ProductVariant[]');

fs.writeFileSync('prisma/schema.prisma', code);
console.log("Renamed relation fields in schema.prisma");
