const fs = require('fs');
let c = fs.readFileSync('src/app/builder/settings-panel.tsx', 'utf8');

// 1. Fix status toggle onSave call
c = c.replace(
  'onSave(buildSaveState(newWidget))\n                }}\n              />\n            </div>\n          )}',
  'onSave(true, buildSaveState(newWidget))\n                }}\n              />\n            </div>\n          )}'
);

// 2. Hide title for MarqueeAlerts
c = c.replace(
  `<div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block">عنوان القسم</label>
              <Input 
                value={localTitle} 
                onChange={handleTitleChange} 
                className="bg-slate-50 text-xs"
                placeholder="مثال: وصل حديثاً"
              />
            </div>`,
  `{widget.type !== "MarqueeAlerts" && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block">عنوان القسم</label>
              <Input 
                value={localTitle} 
                onChange={handleTitleChange} 
                className="bg-slate-50 text-xs"
                placeholder="مثال: وصل حديثاً"
              />
            </div>
            )}`
);

// 3. Add PromoBanner subtitle + TextBlock settings before the PromoBentoGrid block
const extraSettings = `
            {widget.type === "PromoBanner" && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">الوصف</label>
                <textarea
                  value={widget.subtitle || ""}
                  onChange={(e) => onUpdateWidget({ ...widget, subtitle: e.target.value })}
                  className="w-full h-16 p-3 text-xs bg-slate-50 border border-input rounded-md outline-none focus:border-[#2453E3]"
                  placeholder="أدخل وصف الشريط الإعلاني..."
                />
              </div>
            )}

            {widget.type === "TextBlock" && (
              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-[#2453E3] border-b border-border/50 pb-2">
                  <Settings className="w-4 h-4" />
                  <span className="font-bold text-sm">إعدادات النص</span>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">محاذاة النص</label>
                  <select
                    value={widget.settings?.textAlign || "center"}
                    onChange={(e) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, textAlign: e.target.value } }
                      onUpdateWidget(newWidget)
                      onSave(true, buildSaveState(newWidget))
                    }}
                    className="w-full h-10 rounded-md border border-input bg-slate-50 px-3 text-xs"
                  >
                    <option value="right">يمين</option>
                    <option value="center">منتصف</option>
                    <option value="left">يسار</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">صورة جانبية (اختياري)</label>
                  <div className="bg-slate-50 border border-border/50 rounded-xl p-3">
                    <ImageUploader
                      label=""
                      value={widget.settings?.imageUrl || ""}
                      onChange={(url) => {
                        const newWidget = { ...widget, settings: { ...widget.settings, imageUrl: url } }
                        onUpdateWidget(newWidget)
                        onSave(true, buildSaveState(newWidget))
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">نص الزر (اختياري)</label>
                  <Input
                    value={widget.settings?.buttonText || ""}
                    onChange={(e) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, buttonText: e.target.value } }
                      onUpdateWidget(newWidget)
                    }}
                    onBlur={() => onSave(true, buildSaveState())}
                    className="bg-slate-50 text-xs"
                    placeholder="مثال: اقرأ المزيد"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">توجيه الزر</label>
                  <select
                    value={widget.settings?.redirectType || "custom"}
                    onChange={(e) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, redirectType: e.target.value, redirectId: "", buttonUrl: "" } }
                      onUpdateWidget(newWidget)
                      onSave(true, buildSaveState(newWidget))
                    }}
                    className="w-full h-10 rounded-md border border-input bg-slate-50 px-3 text-xs"
                  >
                    <option value="custom">رابط مخصص</option>
                    <option value="category">تصنيف</option>
                    <option value="page">صفحة</option>
                  </select>
                </div>
                {(!widget.settings?.redirectType || widget.settings.redirectType === "custom") && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">الرابط المخصص</label>
                    <Input
                      value={widget.settings?.buttonUrl || ""}
                      onChange={(e) => {
                        const newWidget = { ...widget, settings: { ...widget.settings, buttonUrl: e.target.value } }
                        onUpdateWidget(newWidget)
                      }}
                      onBlur={() => onSave(true, buildSaveState())}
                      className="bg-slate-50 text-xs text-left" dir="ltr"
                      placeholder="https://..."
                    />
                  </div>
                )}
              </div>
            )}

`;

c = c.replace(
  '{widget.type === "PromoBentoGrid" && (',
  extraSettings + '\n          {widget.type === "PromoBentoGrid" && ('
);

// 4. Add cardAspectRatio to bento settings (after bentoEffectEnabled toggle)
const bentoAspect = `
              {widget.settings?.bentoEffectEnabled === false && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <label className="text-xs font-bold text-slate-600 block">أبعاد الكارت</label>
                  <select
                    value={widget.settings?.cardAspectRatio || "3:4"}
                    onChange={(e) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, cardAspectRatio: e.target.value } }
                      onUpdateWidget(newWidget)
                      onSave(true, buildSaveState(newWidget))
                    }}
                    className="w-full h-10 rounded-md border border-input bg-slate-50 px-3 text-xs"
                  >
                    <option value="1:1">مربع (1:1)</option>
                    <option value="3:4">عمودي (3:4)</option>
                    <option value="4:3">أفقي (4:3)</option>
                  </select>
                </div>
              )}
`;

// Insert after bentoEffectEnabled toggle close
c = c.replace(
  `                  onSave(buildSaveState(newWidget))
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">نص الزر (اختياري)</label>`,
  `                  onSave(true, buildSaveState(newWidget))
                  }}
                />
              </div>
              ${bentoAspect}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">نص الزر (اختياري)</label>`
);

// 5. Remove StoreFeatures and MarqueeAlerts from blocks section
c = c.replace(
  '["HeroSlider", "BrandSlider", "ValuesSlider", "StoreFeatures", "MarqueeAlerts", "PromoBentoGrid"]',
  '["HeroSlider", "BrandSlider", "ValuesSlider", "PromoBentoGrid"]'
);

// 6. Add StoreFeatures and MarqueeAlerts inline settings
const inlineSettings = `
        {/* StoreFeatures Settings */}
        {widget.type === "StoreFeatures" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#2453E3] border-b border-border/50 pb-2">
              <Settings className="w-4 h-4" />
              <span className="font-bold text-sm">إعدادات المميزات</span>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-600">تفعيل الخلفية الملونة</label>
              <input
                type="checkbox"
                className="w-4 h-4 accent-[#2453E3]"
                checked={widget.settings?.bgEnabled !== false}
                onChange={(e) => {
                  const newWidget = { ...widget, settings: { ...widget.settings, bgEnabled: e.target.checked } }
                  onUpdateWidget(newWidget)
                  onSave(true, buildSaveState(newWidget))
                }}
              />
            </div>
            <div className="space-y-3">
              {[
                { id: "feat-1", defaultTitle: "شحن سريع", defaultSub: "لجميع المدن" },
                { id: "feat-2", defaultTitle: "ضمان الجودة", defaultSub: "أصلية 100%" },
                { id: "feat-3", defaultTitle: "أفضل الأسعار", defaultSub: "قيمة ممتازة" },
                { id: "feat-4", defaultTitle: "إمكانية الإرجاع", defaultSub: "استرجاع سهل" },
              ].map((feat, idx) => {
                const items = widget.items || []
                const item = items[idx] || { id: feat.id, title: feat.defaultTitle, subtitle: feat.defaultSub }
                const isHidden = item.hidden === true || item.settings?.hidden === true
                return (
                  <div key={feat.id} className="bg-slate-50 border border-border/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">{"ميزة " + (idx + 1)}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">{isHidden ? "مخفي" : "ظاهر"}</span>
                        <input
                          type="checkbox"
                          className="w-3.5 h-3.5 accent-[#2453E3]"
                          checked={!isHidden}
                          onChange={(e) => {
                            const newItems = [...(widget.items || [])]
                            while (newItems.length <= idx) newItems.push({ id: "feat-" + (newItems.length + 1), title: "", subtitle: "" })
                            newItems[idx] = { ...newItems[idx], ...item, hidden: !e.target.checked }
                            const newWidget = { ...widget, items: newItems }
                            onUpdateWidget(newWidget)
                            onSave(true, buildSaveState(newWidget))
                          }}
                        />
                      </div>
                    </div>
                    <Input
                      value={item.title || feat.defaultTitle}
                      onChange={(e) => {
                        const newItems = [...(widget.items || [])]
                        while (newItems.length <= idx) newItems.push({ id: "feat-" + (newItems.length + 1), title: "", subtitle: "" })
                        newItems[idx] = { ...newItems[idx], ...item, title: e.target.value }
                        onUpdateWidget({ ...widget, items: newItems })
                      }}
                      onBlur={() => onSave(true, buildSaveState())}
                      className="bg-white text-xs" placeholder="العنوان"
                    />
                    <Input
                      value={item.subtitle || item.description || feat.defaultSub}
                      onChange={(e) => {
                        const newItems = [...(widget.items || [])]
                        while (newItems.length <= idx) newItems.push({ id: "feat-" + (newItems.length + 1), title: "", subtitle: "" })
                        newItems[idx] = { ...newItems[idx], ...item, subtitle: e.target.value }
                        onUpdateWidget({ ...widget, items: newItems })
                      }}
                      onBlur={() => onSave(true, buildSaveState())}
                      className="bg-white text-xs" placeholder="الوصف"
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* MarqueeAlerts Inline Items */}
        {widget.type === "MarqueeAlerts" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#2453E3] border-b border-border/50 pb-2">
              <ImageIcon className="w-4 h-4" />
              <span className="font-bold text-sm">عناصر الشريط</span>
            </div>
            <div className="space-y-2">
              {(widget.items || []).map((item: any, idx: number) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Input
                    value={item.title || ""}
                    onChange={(e) => {
                      const newItems = [...(widget.items || [])]
                      newItems[idx] = { ...item, title: e.target.value }
                      onUpdateWidget({ ...widget, items: newItems })
                    }}
                    onBlur={() => onSave(true, buildSaveState())}
                    className="bg-slate-50 text-xs flex-1"
                    placeholder={"نص العنصر " + (idx + 1)}
                  />
                  <button
                    onClick={() => {
                      const newItems = (widget.items || []).filter((i: any) => i.id !== item.id)
                      const newWidget = { ...widget, items: newItems }
                      onUpdateWidget(newWidget)
                      onSave(true, buildSaveState(newWidget))
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <Button
                onClick={() => {
                  const newItem = { id: "item-" + Date.now(), title: "نص جديد" }
                  const newItems = [...(widget.items || []), newItem]
                  onUpdateWidget({ ...widget, items: newItems })
                }}
                variant="outline"
                className="w-full border-dashed border-[#2453E3]/30 text-[#2453E3] bg-[#2453E3]/5"
              >
                إضافة عنصر جديد
              </Button>
            </div>
          </div>
        )}
`;

c = c.replace(
  '{/* Dynamic Data (If Product List) */}',
  inlineSettings + '\n        {/* Dynamic Data (If Product List) */}'
);

// 7. Add reorder buttons to items list
c = c.replace(
  `<Button onClick={() => setEditingItem(item)} variant="ghost" size="sm" className="h-8 text-xs text-[#2453E3]">تعديل</Button>`,
  `<div className="flex items-center gap-0.5">
                    {idx > 0 && (
                      <button onClick={(e) => { e.stopPropagation(); const newItems = [...(widget.items || [])]; [newItems[idx-1], newItems[idx]] = [newItems[idx], newItems[idx-1]]; onUpdateWidget({ ...widget, items: newItems }); onSave(true, buildSaveState({ ...widget, items: newItems })); }} className="p-1 text-slate-400 hover:text-[#2453E3] rounded text-xs">▲</button>
                    )}
                    {idx < (widget.items?.length || 0) - 1 && (
                      <button onClick={(e) => { e.stopPropagation(); const newItems = [...(widget.items || [])]; [newItems[idx], newItems[idx+1]] = [newItems[idx+1], newItems[idx]]; onUpdateWidget({ ...widget, items: newItems }); onSave(true, buildSaveState({ ...widget, items: newItems })); }} className="p-1 text-slate-400 hover:text-[#2453E3] rounded text-xs">▼</button>
                    )}
                  </div>
                  <Button onClick={() => setEditingItem(item)} variant="ghost" size="sm" className="h-8 text-xs text-[#2453E3]">تعديل</Button>`
);

fs.writeFileSync('src/app/builder/settings-panel.tsx', c, 'utf8');
console.log('Settings panel updated successfully');
