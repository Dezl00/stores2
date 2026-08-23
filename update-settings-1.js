const fs = require('fs');
let content = fs.readFileSync('src/app/builder/settings-panel.tsx', 'utf8');

// Update the array of widgets that support items
content = content.replace(
  /\["HeroSlider", "BannerGrid", "BrandSlider", "ValuesSlider", "StoreFeatures"\]/g,
  '["HeroSlider", "BrandSlider", "ValuesSlider", "StoreFeatures", "MarqueeAlerts", "PromoBentoGrid"]'
);

// We need to add PromoBanner settings. Where can we inject them?
// Let's inject them after `widget.type === "TextBlock"`
const promoBannerSettings = `
          {widget.type === "PromoBanner" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#2453E3] border-b border-border/50 pb-2">
                <Settings className="w-4 h-4" />
                <span className="font-bold text-sm">إعدادات الشريط الإعلاني</span>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">صورة الخلفية</label>
                <ImageUploader 
                  value={widget.settings?.backgroundImage || ""} 
                  onChange={(val) => {
                    const newWidget = { ...widget, settings: { ...widget.settings, backgroundImage: val } }
                    onUpdateWidget(newWidget)
                    onSave(buildSaveState(newWidget))
                  }}
                  bucket="widgets"
                  className="h-24"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">تاريخ الانتهاء</label>
                <Input 
                  type="datetime-local"
                  value={widget.settings?.timerEndDate || ""} 
                  onChange={(e) => {
                    const newWidget = { ...widget, settings: { ...widget.settings, timerEndDate: e.target.value } }
                    onUpdateWidget(newWidget)
                  }}
                  onBlur={() => onSave(buildSaveState())}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">لون الخلفية</label>
                  <Input 
                    type="color"
                    value={widget.settings?.backgroundColor || "#2453E3"} 
                    onChange={(e) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, backgroundColor: e.target.value } }
                      onUpdateWidget(newWidget)
                    }}
                    onBlur={() => onSave(buildSaveState())}
                    className="h-10 cursor-pointer p-1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">تعتيم الصورة (Opacity)</label>
                  <Input 
                    type="range" min="0" max="100"
                    value={widget.settings?.overlayOpacity ?? 50} 
                    onChange={(e) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, overlayOpacity: parseInt(e.target.value) } }
                      onUpdateWidget(newWidget)
                    }}
                    onBlur={() => onSave(buildSaveState())}
                  />
                </div>
              </div>
            </div>
          )}
          
          {widget.type === "MarqueeAlerts" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#2453E3] border-b border-border/50 pb-2">
                <Settings className="w-4 h-4" />
                <span className="font-bold text-sm">إعدادات الشريط المتحرك</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">لون الخلفية</label>
                  <Input 
                    type="color"
                    value={widget.settings?.backgroundColor || "#000000"} 
                    onChange={(e) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, backgroundColor: e.target.value } }
                      onUpdateWidget(newWidget)
                    }}
                    onBlur={() => onSave(buildSaveState())}
                    className="h-10 cursor-pointer p-1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">لون النص</label>
                  <Input 
                    type="color"
                    value={widget.settings?.textColor || "#ffffff"} 
                    onChange={(e) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, textColor: e.target.value } }
                      onUpdateWidget(newWidget)
                    }}
                    onBlur={() => onSave(buildSaveState())}
                    className="h-10 cursor-pointer p-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">اتجاه الحركة</label>
                  <select
                    value={widget.settings?.scrollDirection || "right"} 
                    onChange={(e) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, scrollDirection: e.target.value } }
                      onUpdateWidget(newWidget)
                      onSave(buildSaveState(newWidget))
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                     <option value="right">من اليسار لليمين</option>
                     <option value="left">من اليمين لليسار</option>
                  </select>
              </div>
            </div>
          )}
`;

content = content.replace(
  /\{widget\.type === "TextBlock" && \([\s\S]*?<\/div>\s*\)\s*\}/,
  (match) => match + '\n' + promoBannerSettings
);

fs.writeFileSync('src/app/builder/settings-panel.tsx', content, 'utf8');
console.log("Updated generic settings in settings-panel.");
