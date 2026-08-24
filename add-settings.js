const fs = require('fs');
let c = fs.readFileSync('src/app/builder/settings-panel.tsx', 'utf8');

// Add to MarqueeAlerts
const mSearch = '<option value="left">من اليمين لليسار</option>\n                  </select>\n              </div>';
const mIdx = c.indexOf(mSearch);
if (mIdx > -1) {
  const newFields = `\n              <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">حجم النص</label>
                  <select
                    value={widget.settings?.textSize || "text-sm"} 
                    onChange={(e) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, textSize: e.target.value } }
                      onUpdateWidget(newWidget)
                      onSave(buildSaveState(newWidget))
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                     <option value="text-sm">صغير (افتراضي)</option>
                     <option value="text-base">متوسط</option>
                     <option value="text-lg">كبير</option>
                     <option value="text-xl">كبير جداً</option>
                     <option value="text-2xl">ضخم</option>
                  </select>
              </div>
              <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">سرعة الحركة</label>
                  <select
                    value={widget.settings?.speed || 25} 
                    onChange={(e) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, speed: parseInt(e.target.value) } }
                      onUpdateWidget(newWidget)
                      onSave(buildSaveState(newWidget))
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                     <option value={40}>بطيء جداً</option>
                     <option value={30}>بطيء</option>
                     <option value={20}>عادي</option>
                     <option value={10}>سريع</option>
                     <option value={5}>سريع جداً</option>
                  </select>
              </div>`;
              
  const endIdx = mIdx + mSearch.length;
  c = c.substring(0, endIdx) + newFields + c.substring(endIdx);
  console.log("Added Marquee settings");
}

// Add CategoryGrid block right after StoreFeatures
const catSearch = '{widget.type === "StoreFeatures" && (';
const catIdx = c.indexOf(catSearch);
if (catIdx > -1) {
  const catBlock = `{widget.type === "CategoryGrid" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#2453E3] border-b border-border/50 pb-2">
                <Settings className="w-4 h-4" />
                <span className="font-bold text-sm">إعدادات شبكة التصنيفات</span>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">أبعاد الصورة</label>
                <select
                  value={widget.settings?.aspectRatio || "circle"} 
                  onChange={(e) => {
                    const newWidget = { ...widget, settings: { ...widget.settings, aspectRatio: e.target.value } }
                    onUpdateWidget(newWidget)
                    onSave(buildSaveState(newWidget))
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                   <option value="circle">دائرة (الافتراضي)</option>
                   <option value="1:1">مربع 1:1</option>
                   <option value="3:4">مستطيل طولي 3:4</option>
                   <option value="4:3">مستطيل عرضي 4:3</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">مكان عنوان التصنيف</label>
                <select
                  value={widget.settings?.titlePosition || "bottom"} 
                  onChange={(e) => {
                    const newWidget = { ...widget, settings: { ...widget.settings, titlePosition: e.target.value } }
                    onUpdateWidget(newWidget)
                    onSave(buildSaveState(newWidget))
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                   <option value="bottom">أسفل الكارت</option>
                   <option value="inside">داخل الكارت بالأسفل</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600">تفعيل خلفية لعنوان التصنيف</label>
                <Switch
                  checked={widget.settings?.titleBgEnabled === true}
                  onCheckedChange={(checked: boolean) => {
                    const newWidget = { ...widget, settings: { ...widget.settings, titleBgEnabled: checked } }
                    onUpdateWidget(newWidget)
                    onSave(buildSaveState(newWidget))
                  }}
                />
              </div>
              {widget.settings?.titleBgEnabled && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">لون خلفية العنوان</label>
                  <Input 
                    type="color"
                    value={widget.settings?.titleBgColor || "#ffffff"} 
                    onChange={(e) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, titleBgColor: e.target.value } }
                      onUpdateWidget(newWidget)
                    }}
                    onBlur={() => onSave(buildSaveState())}
                    className="h-10 cursor-pointer p-1"
                  />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">لون نص العنوان</label>
                <Input 
                  type="color"
                  value={widget.settings?.titleColor || "#000000"} 
                  onChange={(e) => {
                    const newWidget = { ...widget, settings: { ...widget.settings, titleColor: e.target.value } }
                    onUpdateWidget(newWidget)
                  }}
                  onBlur={() => onSave(buildSaveState())}
                  className="h-10 cursor-pointer p-1"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">نعومة الحواف (Border Radius)</label>
                <Input 
                  type="range" min="0" max="32"
                  value={widget.settings?.borderRadius ?? 16} 
                  onChange={(e) => {
                    const newWidget = { ...widget, settings: { ...widget.settings, borderRadius: parseInt(e.target.value) } }
                    onUpdateWidget(newWidget)
                  }}
                  onBlur={() => onSave(buildSaveState())}
                />
              </div>
            </div>
          )}
          
          `;
  
  c = c.substring(0, catIdx) + catBlock + c.substring(catIdx);
  console.log("Added CategoryGrid settings");
}

fs.writeFileSync('src/app/builder/settings-panel.tsx', c, 'utf8');
