const fs = require('fs');
let code = fs.readFileSync('src/app/builder/builder-sidebar.tsx', 'utf8');

// Ensure storeName is extracted from props
code = code.replace(
  /export function BuilderSidebar\(\{([^}]+)\}: any\)/,
  (match, props) => {
    if (!props.includes('storeName')) {
      return `export function BuilderSidebar({${props}, storeName}: any)`;
    }
    return match;
  }
);

code = code.replace(
  /اسم المتجر/,
  '{storeName || "اسم المتجر"}'
);

fs.writeFileSync('src/app/builder/builder-sidebar.tsx', code);
console.log("Updated builder-sidebar.tsx to use storeName");
