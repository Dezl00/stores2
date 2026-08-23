const fs = require('fs');
let content = fs.readFileSync('src/app/builder/builder-sidebar.tsx', 'utf8');

// Use regex to remove items by id instead of arabic names
content = content.replace(/\{\s*id:\s*"FeaturedProducts"[\s\S]*?\},?\s*/g, '');
content = content.replace(/\{\s*id:\s*"BannerGrid"[\s\S]*?\},?\s*/g, '');

// Add new items after HeroSlider
const newWidgets = `{ id: "HeroSlider", name: "شريط صور", icon: ImageIcon, desc: "صور متحركة في أعلى الصفحة" },
  { id: "PromoBanner", name: "شريط إعلاني (مؤقت)", icon: LayoutTemplate, desc: "شريط إعلاني مع عداد تنازلي وخلفية" },
  { id: "MarqueeAlerts", name: "شريط تنبيهات متحرك", icon: AlignLeft, desc: "شريط نصوص متحركة للإعلانات" },
  { id: "PromoBentoGrid", name: "صور إعلانية (Bento)", icon: ImagePlus, desc: "شبكة صور إعلانية بأحجام متنوعة" },`;

content = content.replace(/\{\s*id:\s*"HeroSlider"[\s\S]*?\},/, newWidgets);

fs.writeFileSync('src/app/builder/builder-sidebar.tsx', content, 'utf8');
console.log("Updated builder-sidebar.tsx successfully.");
