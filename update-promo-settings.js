const fs = require('fs');
let content = fs.readFileSync('src/app/builder/settings-panel.tsx', 'utf8');

const promoRoutingFields = `
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">نص الزر (اختياري)</label>
                <Input 
                  value={widget.settings?.buttonText || ""} 
                  onChange={(e) => {
                    const newWidget = { ...widget, settings: { ...widget.settings, buttonText: e.target.value } }
                    onUpdateWidget(newWidget)
                    onSave(buildSaveState(newWidget))
                  }}
                  className="bg-slate-50 text-xs"
                  placeholder="مثال: تسوق الآن"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">توجيه الزر</label>
                <select
                  value={widget.settings?.redirectType || "custom"}
                  onChange={(e) => {
                    const newWidget = { ...widget, settings: { ...widget.settings, redirectType: e.target.value, redirectId: "", buttonUrl: "" } }
                    onUpdateWidget(newWidget)
                    onSave(buildSaveState(newWidget))
                  }}
                  className="w-full h-10 rounded-md border border-input bg-slate-50 px-3 text-xs"
                >
                  <option value="custom">رابط مخصص</option>
                  <option value="product">منتج</option>
                  <option value="category">تصنيف</option>
                  <option value="page">صفحة</option>
                </select>
              </div>

              {(!widget.settings?.redirectType || widget.settings.redirectType === "custom") && (
                <div className="space-y-2 animate-in fade-in zoom-in duration-200">
                  <label className="text-xs font-bold text-slate-600 block">الرابط المخصص</label>
                  <Input 
                    value={widget.settings?.buttonUrl || ""} 
                    onChange={(e) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, buttonUrl: e.target.value } }
                      onUpdateWidget(newWidget)
                    }}
                    onBlur={() => onSave(buildSaveState())}
                    className="bg-slate-50 text-xs text-left"
                    dir="ltr"
                    placeholder="https://..."
                  />
                </div>
              )}

              {widget.settings?.redirectType === "category" && (
                <div className="space-y-2 animate-in fade-in zoom-in duration-200">
                  <label className="text-xs font-bold text-slate-600 block">اختر التصنيف</label>
                  <select
                    value={widget.settings?.redirectId || ""}
                    onChange={(e) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, redirectId: e.target.value } }
                      onUpdateWidget(newWidget)
                      onSave(buildSaveState(newWidget))
                    }}
                    className="w-full h-10 rounded-md border border-input bg-slate-50 px-3 text-xs"
                  >
                    <option value="">-- اختر --</option>
                    {categories?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {widget.settings?.redirectType === "page" && (
                <div className="space-y-2 animate-in fade-in zoom-in duration-200">
                  <label className="text-xs font-bold text-slate-600 block">اختر الصفحة</label>
                  <select
                    value={widget.settings?.redirectId || ""}
                    onChange={(e) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, redirectId: e.target.value } }
                      onUpdateWidget(newWidget)
                      onSave(buildSaveState(newWidget))
                    }}
                    className="w-full h-10 rounded-md border border-input bg-slate-50 px-3 text-xs"
                  >
                    <option value="">-- اختر --</option>
                    <option value="about">من نحن</option>
                    <option value="contact">اتصل بنا</option>
                    <option value="terms">الشروط والأحكام</option>
                    <option value="privacy">سياسة الخصوصية</option>
                  </select>
                </div>
              )}

              {widget.settings?.redirectType === "product" && (
                <div className="space-y-2 animate-in fade-in zoom-in duration-200">
                  <label className="text-xs font-bold text-slate-600 block">المنتج المختار</label>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between bg-slate-50 text-xs h-10"
                    onClick={() => setProductPickerOpen(true)}
                  >
                    <span className="truncate">{widget.settings?.redirectId ? "تغيير المنتج" : "اختر منتجاً..."}</span>
                  </Button>
                  {productPickerOpen && (
                    <ProductPickerModal 
                      open={productPickerOpen}
                      onOpenChange={setProductPickerOpen}
                      initialSelectedIds={widget.settings?.redirectId ? [widget.settings.redirectId] : []}
                      single={true}
                      onSave={(selected: string[]) => {
                        const newWidget = { ...widget, settings: { ...widget.settings, redirectId: selected[0] || "" } }
                        onUpdateWidget(newWidget)
                        onSave(true, buildSaveState(newWidget))
                      }}
                    />
                  )}
                </div>
              )}
`;

content = content.replace(
  /<div className="grid grid-cols-2 gap-4">([\s\S]*?)<div className="space-y-2">\s*<label className="text-xs font-bold text-slate-600 block">لون الخلفية<\/label>/,
  promoRoutingFields + '\n<div className="grid grid-cols-2 gap-4">$1<div className="space-y-2">\n<label className="text-xs font-bold text-slate-600 block">لون الخلفية</label>'
);

fs.writeFileSync('src/app/builder/settings-panel.tsx', content, 'utf8');
console.log("Added button and routing options to PromoBanner settings.");
