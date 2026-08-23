const fs = require('fs');
let c = fs.readFileSync('src/app/builder/builder-sidebar.tsx', 'utf8');

c = c.replace(
  'const existingMarquee = widgets.find((w: any) => w.type === "MarqueeAlerts");',
  'const existingMarquee = widgets.find((w: any) => w.type === "MarqueeAlerts" && w.settings?.placement !== "content");'
);

c = c.replace(
  'settings: { scrollDirection: "right", backgroundColor: "#000000", textColor: "#ffffff" },',
  'settings: { placement: "header", scrollDirection: "right", backgroundColor: "#000000", textColor: "#ffffff" },'
);

c = c.replace(
  'sortOrder: widgets.length,\n                        config: {}',
  'sortOrder: widgets.length,\n                        config: {},\n                        settings: selectedWidgetType.id === "MarqueeAlerts" ? { placement: "content" } : {}'
);

fs.writeFileSync('src/app/builder/builder-sidebar.tsx', c, 'utf8');
