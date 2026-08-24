const fs = require('fs');
let code = fs.readFileSync('src/app/layout.tsx', 'utf8');

code = code.replace(
  /import \{ IBM_Plex_Sans_Arabic \} from "next\/font\/google";([\s\S]*?)const fallbackFont = IBM_Plex_Sans_Arabic\(\{[\s\S]*?\}\);/,
  `import { FONT_MAP, fontIbm } from "@/app/fonts";$1`
);

code = code.replace(
  /<html lang="ar" dir="rtl" className=\{fallbackFont\.variable\} suppressHydrationWarning>/,
  '<html lang="ar" dir="rtl" className={(theme?.headerSettings as any)?.fontFamily ? (FONT_MAP[(theme?.headerSettings as any)?.fontFamily]?.variable || fontIbm.variable) : fontIbm.variable} suppressHydrationWarning>'
);

fs.writeFileSync('src/app/layout.tsx', code);
console.log("Updated layout.tsx");
