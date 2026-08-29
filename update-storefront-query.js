const fs = require('fs');
let code = fs.readFileSync('src/app/(store)/product/[slug]/page.tsx', 'utf8');

const replacement = `
    include: { 
      images: { orderBy: { sortOrder: 'asc' } },
      options: { include: { values: true }, orderBy: { sortOrder: 'asc' } },
      variants: { include: { selections: true } },
`;

code = code.replace(/include: \{\s*images: \{ orderBy: \{ sortOrder: 'asc' \} \},/, replacement.trim());

fs.writeFileSync('src/app/(store)/product/[slug]/page.tsx', code);
console.log("Updated getProduct include");
