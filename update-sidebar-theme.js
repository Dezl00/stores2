const fs = require('fs');
let code = fs.readFileSync('src/app/builder/builder-sidebar.tsx', 'utf8');

if (!code.includes('themeExpanded')) {
  code = code.replace(
    /const \[expanded, setExpanded\] = React.useState<string \| false>\("content"\)/,
    'const [expanded, setExpanded] = React.useState<string | false>("content")\n  const [themeExpanded, setThemeExpanded] = React.useState<string | false>("typography")'
  );
}

const themeTabContent = `<div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
          
          {/* Accordion: Typography */}
          <div className="bg-white border border-border/50 rounded-lg overflow-hidden shadow-sm">
            <button 
              onClick={() => setThemeExpanded(themeExpanded === "typography" ? false : "typography")}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm">الخطوط (التايبوجرافي)</span>
              </div>
              <Settings2 className={cn("w-4 h-4 text-slate-400 transition-transform", themeExpanded === "typography" && "rotate-90")} />
            </button>
            {themeExpanded === "typography" && (
              <div className="p-4 border-t border-border/50 space-y-3">
                <label className="text-sm font-bold text-slate-600 block">خط المتجر</label>
                <div className="relative">
                  <select 
                    className="w-full p-3 border border-border/50 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#2453E3]/20 focus:border-[#2453E3] transition-all outline-none appearance-none"
                    value={headerSettings?.fontFamily || "ibm"}
                    onChange={(e) => {
                      const newSettings = { ...headerSettings, fontFamily: e.target.value };
                      setHeaderSettings?.(newSettings);
                      onSave(true, { headerSettings: newSettings, footerSettings, widgets });
                    }}
                  >
                    {FONT_OPTIONS.map(font => (
                      <option key={font.id} value={font.id} className={FONT_MAP[font.id]?.className}>{font.name} - {storeName || "اسم المتجر"}</option>
                    ))}
                  </select>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
                <p className="text-xs text-slate-500">اختر الخط الأساسي الذي سيتم تطبيقه على جميع نصوص المتجر.</p>
              </div>
            )}
          </div>

          {/* Accordion: Product Card */}
          <div className="bg-white border border-border/50 rounded-lg overflow-hidden shadow-sm">
            <button 
              onClick={() => setThemeExpanded(themeExpanded === "product-card" ? false : "product-card")}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm">كارت المنتجات</span>
              </div>
              <Settings2 className={cn("w-4 h-4 text-slate-400 transition-transform", themeExpanded === "product-card" && "rotate-90")} />
            </button>
            {themeExpanded === "product-card" && (
              <div className="p-4 border-t border-border/50 space-y-4">
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">أبعاد صورة المنتج</label>
                  <select 
                    className="w-full p-2 border border-border/50 rounded-lg bg-slate-50 text-sm"
                    value={headerSettings?.productCard?.aspectRatio || "square"}
                    onChange={(e) => {
                      const newSettings = { ...headerSettings, productCard: { ...headerSettings.productCard, aspectRatio: e.target.value } };
                      setHeaderSettings?.(newSettings);
                      onSave(true, { headerSettings: newSettings, footerSettings, widgets });
                    }}
                  >
                    <option value="square">1:1 (مربع)</option>
                    <option value="portrait">3:4 (طولي)</option>
                    <option value="landscape">4:3 (عرضي)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600">إظهار التصنيف</label>
                  <input 
                    type="checkbox"
                    checked={headerSettings?.productCard?.showCategory !== false}
                    onChange={(e) => {
                      const newSettings = { ...headerSettings, productCard: { ...headerSettings.productCard, showCategory: e.target.checked } };
                      setHeaderSettings?.(newSettings);
                      onSave(true, { headerSettings: newSettings, footerSettings, widgets });
                    }}
                    className="w-4 h-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600">إظهار الوصف المربع</label>
                  <input 
                    type="checkbox"
                    checked={headerSettings?.productCard?.showDescription === true}
                    onChange={(e) => {
                      const newSettings = { ...headerSettings, productCard: { ...headerSettings.productCard, showDescription: e.target.checked } };
                      setHeaderSettings?.(newSettings);
                      onSave(true, { headerSettings: newSettings, footerSettings, widgets });
                    }}
                    className="w-4 h-4"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">لون السعر</label>
                  <input 
                    type="color"
                    value={headerSettings?.productCard?.priceColor || "#2453E3"}
                    onChange={(e) => {
                      const newSettings = { ...headerSettings, productCard: { ...headerSettings.productCard, priceColor: e.target.value } };
                      setHeaderSettings?.(newSettings);
                      onSave(true, { headerSettings: newSettings, footerSettings, widgets });
                    }}
                    className="w-full h-8 p-0 border-0 rounded"
                  />
                </div>

                <div className="border-t border-border/50 pt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-600">إظهار زر "إضافة للسلة"</label>
                    <input 
                      type="checkbox"
                      checked={headerSettings?.productCard?.showAddToCart !== false}
                      onChange={(e) => {
                        const newSettings = { ...headerSettings, productCard: { ...headerSettings.productCard, showAddToCart: e.target.checked } };
                        setHeaderSettings?.(newSettings);
                        onSave(true, { headerSettings: newSettings, footerSettings, widgets });
                      }}
                      className="w-4 h-4"
                    />
                  </div>
                  
                  {headerSettings?.productCard?.showAddToCart !== false && (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">نص زر الإضافة</label>
                        <input 
                          type="text"
                          value={headerSettings?.productCard?.addToCartText || "أضف للسلة"}
                          onChange={(e) => {
                            const newSettings = { ...headerSettings, productCard: { ...headerSettings.productCard, addToCartText: e.target.value } };
                            setHeaderSettings?.(newSettings);
                            onSave(true, { headerSettings: newSettings, footerSettings, widgets });
                          }}
                          className="w-full p-2 border border-border/50 rounded-lg bg-white text-sm"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">تصميم الزر</label>
                        <select 
                          className="w-full p-2 border border-border/50 rounded-lg bg-slate-50 text-sm"
                          value={headerSettings?.productCard?.addToCartStyle || "solid"}
                          onChange={(e) => {
                            const newSettings = { ...headerSettings, productCard: { ...headerSettings.productCard, addToCartStyle: e.target.value } };
                            setHeaderSettings?.(newSettings);
                            onSave(true, { headerSettings: newSettings, footerSettings, widgets });
                          }}
                        >
                          <option value="solid">ممتلئ</option>
                          <option value="outline">تحديد خارجي</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">لون الزر</label>
                        <input 
                          type="color"
                          value={headerSettings?.productCard?.addToCartColor || "#2453E3"}
                          onChange={(e) => {
                            const newSettings = { ...headerSettings, productCard: { ...headerSettings.productCard, addToCartColor: e.target.value } };
                            setHeaderSettings?.(newSettings);
                            onSave(true, { headerSettings: newSettings, footerSettings, widgets });
                          }}
                          className="w-full h-8 p-0 border-0 rounded"
                        />
                      </div>
                    </>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>`;

const placeholderRegex = /<div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50\/30">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\)\}/;

code = code.replace(placeholderRegex, themeTabContent + "\n        )}");

fs.writeFileSync('src/app/builder/builder-sidebar.tsx', code);
console.log("Updated builder-sidebar.tsx to use accordions and add product card settings.");
