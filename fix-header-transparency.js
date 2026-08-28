const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/header.tsx', 'utf8');

// Add import if not present
if (!code.includes('usePathname')) {
  code = code.replace(
    'import { useRouter } from "next/navigation"',
    'import { useRouter, usePathname } from "next/navigation"'
  );
}

// Update isTop logic
code = code.replace(
  "const isTop = scrollState === 'top'",
  `const pathname = usePathname()
  const isHomepage = pathname === '/'
  const isTop = isHomepage && scrollState === 'top'`
);

fs.writeFileSync('src/components/storefront/header.tsx', code);
console.log("Updated header transparent logic for homepage only");
