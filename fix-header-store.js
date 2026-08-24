const fs = require('fs');

let headerCode = fs.readFileSync('src/components/storefront/header.tsx', 'utf8');

headerCode = headerCode.replace(
  /if \(themeConfig\?\.logoUrl\) \{\n\s+useUIStore\.getState\(\)\.setStoreLogo\(themeConfig\.logoUrl\)\n\s+useUIStore\.getState\(\)\.setThemeConfig\(themeConfig\)\n\s+\}\n\s+\}, \[themeConfig\?\.logoUrl\]\)/,
  `useUIStore.getState().setThemeConfig(themeConfig)
    if (themeConfig?.logoUrl) {
      useUIStore.getState().setStoreLogo(themeConfig.logoUrl)
    }
  }, [themeConfig])`
);

fs.writeFileSync('src/components/storefront/header.tsx', headerCode);
console.log("Updated header.tsx again");
