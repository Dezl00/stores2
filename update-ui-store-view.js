const fs = require('fs');
let code = fs.readFileSync('src/store/ui-store.ts', 'utf8');

code = code.replace(
  /setThemeConfig: \(config: any\) => void/,
  'setThemeConfig: (config: any) => void\n  categoryViewMode: "grid" | "list"\n  setCategoryViewMode: (mode: "grid" | "list") => void'
);

code = code.replace(
  /setThemeConfig: \(config\) => set\(\{ themeConfig: config \}\),/,
  'setThemeConfig: (config) => set({ themeConfig: config }),\n  categoryViewMode: "grid",\n  setCategoryViewMode: (mode) => set({ categoryViewMode: mode }),'
);

fs.writeFileSync('src/store/ui-store.ts', code);
console.log("Updated ui-store");
