const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/store-toolbar.tsx', 'utf8');

// Ensure CategoryProductGrid doesn't render its own toggle
let categoryGridCode = fs.readFileSync('src/components/storefront/category-product-grid.tsx', 'utf8');
categoryGridCode = categoryGridCode.replace(
  /const \[viewMode, setViewMode\] = useState<"grid" \| "list">\("grid"\)/,
  'const { categoryViewMode: viewMode } = useUIStore()'
);
categoryGridCode = categoryGridCode.replace(
  /import React, \{ useState \} from "react"/,
  'import React from "react"\nimport { useUIStore } from "@/store/ui-store"'
);
categoryGridCode = categoryGridCode.replace(
  /\{\/\* View mode toggle - shown primarily on mobile\/tablet screens \*\/\}\n\s*<div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl md:hidden">[\s\S]*?<\/div>\n\s*<\/div>/,
  '</div>'
);
fs.writeFileSync('src/components/storefront/category-product-grid.tsx', categoryGridCode);
console.log("Updated category grid");

// Now add the toggle to store-toolbar
code = code.replace(
  /const \{ setFilterSidebarOpen \} = useUIStore\(\)/,
  'const { setFilterSidebarOpen, categoryViewMode, setCategoryViewMode } = useUIStore()'
);

const viewToggleStr = `{/* View Toggles */}
        <div className="md:hidden flex items-center bg-card border border-border/50 rounded-full h-10 px-1 shadow-sm overflow-hidden">
          <button
            onClick={() => setCategoryViewMode("list")}
            className={\`w-8 h-8 flex items-center justify-center rounded-full transition-colors \${categoryViewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}\`}
            title="عامود واحد"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect></svg>
          </button>
          <div className="w-[1px] h-4 bg-border/50 mx-1"></div>
          <button
            onClick={() => setCategoryViewMode("grid")}
            className={\`w-8 h-8 flex items-center justify-center rounded-full transition-colors \${categoryViewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}\`}
            title="عامودين"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="18" rx="1" ry="1"></rect><rect x="14" y="3" width="7" height="18" rx="1" ry="1"></rect></svg>
          </button>
        </div>`;

code = code.replace(
  /<div className="flex items-center gap-2">/,
  '<div className="flex items-center gap-2">\n        ' + viewToggleStr
);

fs.writeFileSync('src/components/storefront/store-toolbar.tsx', code);
console.log("Updated store toolbar");
