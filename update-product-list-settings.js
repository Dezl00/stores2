const fs = require('fs');
let c = fs.readFileSync('src/app/builder/settings-panel.tsx', 'utf8');

const regex = /\{\/\*\s*Dynamic Data \(If Product List\)\s*\*\/\}[\s\S]*?\{\/\*\s*Blocks \(If Slider, BannerGrid, Features\)\s*\*\/\}/;

const newBlock = `{/* Dynamic Data (ProductList) */}
        {widget?.type === "ProductList" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#2453E3] border-b border-border/50 pb-2">
              <Settings className="w-4 h-4" />
              <span className="font-bold text-sm">إعدادات قائمة المنتجات</span>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block">مصدر المنتجات</label>
              <select 
                className="w-full h-10 px-3 py-2 text-sm bg-slate-50 border border-input rounded-md outline-none focus:border-[#2453E3]"
                value={widget.settings?.sourceMode || "category"}
                onChange={(e) => {
                  const newWidget = { ...widget, settings: { ...widget.settings, sourceMode: e.target.value } }
                  onUpdateWidget(newWidget)
                  onSave(buildSaveState(newWidget))
                }}
              >
                <option value="category">من تصنيف معين</option>
                <option value="custom">منتجات مخصصة</option>
              </select>
            </div>

            {(!widget.settings?.sourceMode || widget.settings?.sourceMode === "category") ? (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">التصنيف المصدر</label>
                <select 
                  className="w-full h-10 px-3 py-2 text-sm bg-slate-50 border border-input rounded-md outline-none focus:border-[#2453E3]"
                  value={widget.settings?.categoryId || ""}
                  onChange={(e) => {
                    const newWidget = { ...widget, settings: { ...widget.settings, categoryId: e.target.value } }
                    onUpdateWidget(newWidget)
                    onSave(buildSaveState(newWidget))
                  }}
                >
                  <option value="">اختر تصنيفاً</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">تحديد المنتجات ({widget.settings?.productIds?.length || 0})</label>
                <Button 
                  variant="outline" 
                  className="w-full bg-slate-50 h-10"
                  onClick={() => setProductPickerOpen(true)}
                >
                  {widget.settings?.productIds?.length > 0 ? "تعديل المنتجات المحددة" : "اختيار المنتجات..."}
                </Button>
                {productPickerOpen && (
                  <ProductPickerModal 
                    open={productPickerOpen}
                    onOpenChange={setProductPickerOpen}
                    initialSelectedIds={widget.settings?.productIds || []}
                    single={false}
                    onSave={(selected) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, productIds: selected } }
                      onUpdateWidget(newWidget)
                      onSave(buildSaveState(newWidget))
                    }}
                    returnSlug={false}
                  />
                )}
              </div>
            )}

            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-600 block">طريقة العرض</label>
              <select 
                className="w-full h-10 px-3 py-2 text-sm bg-slate-50 border border-input rounded-md outline-none focus:border-[#2453E3]"
                value={widget.settings?.displayMode || "grid"}
                onChange={(e) => {
                  const newWidget = { ...widget, settings: { ...widget.settings, displayMode: e.target.value } }
                  onUpdateWidget(newWidget)
                  onSave(buildSaveState(newWidget))
                }}
              >
                <option value="grid">شبكة (Grid)</option>
                <option value="carousel">سلايدر متحرك (Slider)</option>
              </select>
            </div>
            
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-600 flex items-center justify-between">
                <span>عدد المنتجات الأقصى</span>
                <span className="text-[#2453E3]">{widget.settings?.productCount || 6}</span>
              </label>
              <input
                type="range"
                min="3" max="20" step="1"
                className="w-full accent-[#2453E3]"
                value={widget.settings?.productCount || 6}
                onChange={(e) => onUpdateWidget({ ...widget, settings: { ...widget.settings, productCount: parseInt(e.target.value) } })}
                onBlur={() => onSave(buildSaveState())}
              />
            </div>
          </div>
        )}

        {/* Featured Product */}
        {widget?.type === "FeaturedProduct" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#2453E3] border-b border-border/50 pb-2">
              <Settings className="w-4 h-4" />
              <span className="font-bold text-sm">المنتج المميز</span>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block">اختر المنتج</label>
              <Button 
                variant="outline" 
                className="w-full bg-slate-50 h-10"
                onClick={() => setProductPickerOpen(true)}
              >
                {widget.settings?.productId ? "تغيير المنتج المحدد" : "اختيار منتج..."}
              </Button>
              {productPickerOpen && (
                <ProductPickerModal 
                  open={productPickerOpen}
                  onOpenChange={setProductPickerOpen}
                  initialSelectedIds={widget.settings?.productId ? [widget.settings.productId] : []}
                  single={true}
                  onSave={(selected) => {
                    const newWidget = { ...widget, settings: { ...widget.settings, productId: selected[0] } }
                    onUpdateWidget(newWidget)
                    onSave(buildSaveState(newWidget))
                  }}
                  returnSlug={false}
                />
              )}
            </div>
          </div>
        )}

        {/* Blocks (If Slider, BannerGrid, Features) */}`;

if (regex.test(c)) {
  c = c.replace(regex, newBlock);
  fs.writeFileSync('src/app/builder/settings-panel.tsx', c, 'utf8');
  console.log("Successfully replaced settings block.");
} else {
  console.error("Could not match regex.");
}
