const fs = require('fs');
let content = fs.readFileSync('src/app/(store)/layout.tsx', 'utf8');

// Import MarqueeAlerts and db
content = content.replace(
  /import \{ StorefrontHeader \} from "@\/components\/storefront\/header"/,
  'import { StorefrontHeader } from "@/components/storefront/header"\nimport { MarqueeAlerts } from "@/components/storefront/widgets/marquee-alerts"\nimport { db } from "@/lib/db"'
);

// Fetch Marquee Widget
content = content.replace(
  /const session = await auth\(\)/,
  `const session = await auth()
  const storeId = await resolveStoreId()
  const marqueeWidget = await db.widget.findFirst({
    where: { storeId, type: "MarqueeAlerts", status: true },
    include: { items: { orderBy: { sortOrder: 'asc' } } }
  })`
);

// Render Marquee Widget
content = content.replace(
  /<StorefrontHeader /,
  `{marqueeWidget && <MarqueeAlerts widget={marqueeWidget} />}\n        <StorefrontHeader `
);

fs.writeFileSync('src/app/(store)/layout.tsx', content, 'utf8');
console.log("Updated layout.tsx with MarqueeAlerts.");
