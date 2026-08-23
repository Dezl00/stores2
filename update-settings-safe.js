const fs = require('fs');
let content = fs.readFileSync('src/app/builder/settings-panel.tsx', 'utf8');

// 1. Hide fields for MarqueeAlerts in editingItem
content = content.replace(
  /<div className="space-y-2">\s*<label className="text-xs font-bold text-slate-600 block">صورة العنصر \(أو الأيقونة\)<\/label>[\s\S]*?<\/ImageUploader>\s*<\/div>\s*<\/div>/,
  `{widget.type !== "MarqueeAlerts" && (
$&
)}`
);

content = content.replace(
  /<div className="space-y-2">\s*<label className="text-xs font-bold text-slate-600 block">الوصف أو النص الفرعي<\/label>[\s\S]*?placeholder="اكتب الوصف\.\.\."\s*\/>\s*<\/div>/,
  `{widget.type !== "MarqueeAlerts" && (
$&
)}`
);

content = content.replace(
  /<div className="space-y-2">\s*<label className="text-xs font-bold text-slate-600 block">نص الزر \(اختياري\)<\/label>[\s\S]*?placeholder="مثال: تسوق الآن"\s*\/>\s*<\/div>/,
  `{widget.type !== "MarqueeAlerts" && (
$&
)}`
);


// 2. Add Bento & Text Settings
const textSettings = `
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">المحاذاة الأفقية للنصوص</label>
                <select
                  value={widget.settings?.textAlign || "center"} 
                  onChange={(e) => {
                    const newWidget = { ...widget, settings: { ...widget.settings, textAlign: e.target.value } }
                    onUpdateWidget(newWidget)
                    onSave(buildSaveState(newWidget))
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                   <option value="right">يمين</option>
                   <option value="center">منتصف</option>
                   <option value="left">يسار</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">المحاذاة الرأسية للنصوص</label>
                <select
                  value={widget.settings?.textPosition || "bottom"} 
                  onChange={(e) => {
                    const newWidget = { ...widget, settings: { ...widget.settings, textPosition: e.target.value } }
                    onUpdateWidget(newWidget)
                    onSave(buildSaveState(newWidget))
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                   <option value="top">أعلى</option>
                   <option value="center">منتصف</option>
                   <option value="bottom">أسفل</option>
                </select>
              </div>
`;

const bentoSettings = `
          {widget.type === "PromoBentoGrid" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#2453E3] border-b border-border/50 pb-2">
                <Settings className="w-4 h-4" />
                <span className="font-bold text-sm">إعدادات شبكة الصور (Bento)</span>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600 block">تفعيل تأثير Bento Grid</label>
                <input 
                  type="checkbox" 
                  className="w-4 h-4 accent-[#2453E3]" 
                  checked={widget.settings?.bentoEffectEnabled !== false}
                  onChange={(e) => {
                    const newWidget = { ...widget, settings: { ...widget.settings, bentoEffectEnabled: e.target.checked } }
                    onUpdateWidget(newWidget)
                    onSave(buildSaveState(newWidget))
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">لون التعتيم</label>
                  <Input 
                    type="color"
                    value={widget.settings?.overlayColor || "#000000"} 
                    onChange={(e) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, overlayColor: e.target.value } }
                      onUpdateWidget(newWidget)
                    }}
                    onBlur={() => onSave(buildSaveState())}
                    className="h-10 cursor-pointer p-1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">درجة الشفافية (0-100)</label>
                  <Input 
                    type="range" min="0" max="100"
                    value={widget.settings?.overlayOpacity ?? 40} 
                    onChange={(e) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, overlayOpacity: parseInt(e.target.value) } }
                      onUpdateWidget(newWidget)
                    }}
                    onBlur={() => onSave(buildSaveState())}
                  />
                </div>
              </div>
              ${textSettings}
            </div>
          )}
`;

const heroSliderSettings = `
          {widget.type === "HeroSlider" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#2453E3] border-b border-border/50 pb-2">
                <Settings className="w-4 h-4" />
                <span className="font-bold text-sm">إعدادات السلايدر</span>
              </div>
              ${textSettings}
            </div>
          )}
`;

content = content.replace(
  /\{widget\.type === "PromoBanner" && \(/,
  bentoSettings + '\n' + heroSliderSettings + '\n{widget.type === "PromoBanner" && ('
);

fs.writeFileSync('src/app/builder/settings-panel.tsx', content, 'utf8');
console.log("Safely updated settings-panel.");
