const fs = require('fs');
let content = fs.readFileSync('src/app/admin/storefront/theme/widgets-client.tsx', 'utf8');

// Item routing logic in handleSaveItem
content = content.replace(
  /if \(editingWidget\.type === "BannerGrid" \|\| editingWidget\.type === "HeroSlider"\) \{/g,
  'if (editingWidget.type === "BannerGrid" || editingWidget.type === "HeroSlider" || editingWidget.type === "PromoBentoGrid" || editingWidget.type === "MarqueeAlerts") {'
);

// Items list display logic
content = content.replace(
  /\{\(editingWidget\.type === "HeroSlider" \|\| editingWidget\.type === "BannerGrid" \|\| editingWidget\.type === "BrandSlider" \|\| editingWidget\.type === "ProductList"\) && \(/g,
  '{(editingWidget.type === "HeroSlider" || editingWidget.type === "BannerGrid" || editingWidget.type === "PromoBentoGrid" || editingWidget.type === "MarqueeAlerts" || editingWidget.type === "BrandSlider" || editingWidget.type === "ProductList") && ('
);

// Subtitle field
content = content.replace(
  /\{editingWidget\.type === "HeroSlider" && \(/g,
  '{(editingWidget.type === "HeroSlider" || editingWidget.type === "PromoBentoGrid") && ('
);

// Routing options
content = content.replace(
  /\{editingWidget\.type === "BannerGrid" \|\| editingWidget\.type === "HeroSlider" \? \(/g,
  '{editingWidget.type === "BannerGrid" || editingWidget.type === "HeroSlider" || editingWidget.type === "PromoBentoGrid" || editingWidget.type === "MarqueeAlerts" ? ('
);

// Product picker
content = content.replace(
  /\{productPickerOpen && \(editingWidget\.type === "BannerGrid" \|\| editingWidget\.type === "HeroSlider"\) && linkType === "product" \? \(/g,
  '{productPickerOpen && (editingWidget.type === "BannerGrid" || editingWidget.type === "HeroSlider" || editingWidget.type === "PromoBentoGrid" || editingWidget.type === "MarqueeAlerts") && linkType === "product" ? ('
);

fs.writeFileSync('src/app/admin/storefront/theme/widgets-client.tsx', content, 'utf8');
console.log("Updated item fields conditions.");
