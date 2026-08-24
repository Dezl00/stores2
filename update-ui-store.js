const fs = require('fs');

// 1. Update UI Store
let uiStoreCode = fs.readFileSync('src/store/ui-store.ts', 'utf8');
if (!uiStoreCode.includes('themeConfig:')) {
  uiStoreCode = uiStoreCode.replace(
    /setStoreLogo: \(url: string \| null\) => void/,
    'setStoreLogo: (url: string | null) => void\n  themeConfig: any | null\n  setThemeConfig: (config: any) => void'
  );
  uiStoreCode = uiStoreCode.replace(
    /setStoreLogo: \(url\) => set\(\{ storeLogo: url \}\),/,
    'setStoreLogo: (url) => set({ storeLogo: url }),\n  themeConfig: null,\n  setThemeConfig: (config) => set({ themeConfig: config }),'
  );
  fs.writeFileSync('src/store/ui-store.ts', uiStoreCode);
  console.log("Updated ui-store.ts");
}

// 2. Update Header to set themeConfig
let headerCode = fs.readFileSync('src/components/storefront/header.tsx', 'utf8');
if (!headerCode.includes('setThemeConfig(')) {
  headerCode = headerCode.replace(
    /useUIStore\.getState\(\)\.setStoreLogo\(themeConfig\.logoUrl\)/,
    'useUIStore.getState().setStoreLogo(themeConfig.logoUrl)\n      useUIStore.getState().setThemeConfig(themeConfig)'
  );
  fs.writeFileSync('src/components/storefront/header.tsx', headerCode);
  console.log("Updated header.tsx");
}
