const fs = require('fs');
let code = fs.readFileSync('src/app/builder/builder-sidebar.tsx', 'utf8');

// Remove onSave calls from theme tab
code = code.replace(
  /onChange=\{\(e\) => \{\n\s*const newSettings = \{ \.\.\.headerSettings, fontFamily: e\.target\.value \};\n\s*setHeaderSettings\?\.\(newSettings\);\n\s*onSave\(true, \{ headerSettings: newSettings, footerSettings, widgets \}\);\n\s*\}\}/g,
  `onChange={(e) => {
                      const newSettings = { ...headerSettings, fontFamily: e.target.value };
                      setHeaderSettings?.(newSettings);
                    }}`
);

code = code.replace(
  /onChange=\{\(e\) => \{\n\s*const newSettings = \{ \.\.\.headerSettings, productCard: \{ \.\.\.headerSettings\.productCard, aspectRatio: e\.target\.value \} \};\n\s*setHeaderSettings\?\.\(newSettings\);\n\s*onSave\(true, \{ headerSettings: newSettings, footerSettings, widgets \}\);\n\s*\}\}/g,
  `onChange={(e) => {
                      const newSettings = { ...headerSettings, productCard: { ...headerSettings.productCard, aspectRatio: e.target.value } };
                      setHeaderSettings?.(newSettings);
                    }}`
);

code = code.replace(
  /onChange=\{\(e\) => \{\n\s*const newSettings = \{ \.\.\.headerSettings, productCard: \{ \.\.\.headerSettings\.productCard, showCategory: e\.target\.checked \} \};\n\s*setHeaderSettings\?\.\(newSettings\);\n\s*onSave\(true, \{ headerSettings: newSettings, footerSettings, widgets \}\);\n\s*\}\}/g,
  `onChange={(e) => {
                      const newSettings = { ...headerSettings, productCard: { ...headerSettings.productCard, showCategory: e.target.checked } };
                      setHeaderSettings?.(newSettings);
                    }}`
);

code = code.replace(
  /onChange=\{\(e\) => \{\n\s*const newSettings = \{ \.\.\.headerSettings, productCard: \{ \.\.\.headerSettings\.productCard, showDescription: e\.target\.checked \} \};\n\s*setHeaderSettings\?\.\(newSettings\);\n\s*onSave\(true, \{ headerSettings: newSettings, footerSettings, widgets \}\);\n\s*\}\}/g,
  `onChange={(e) => {
                      const newSettings = { ...headerSettings, productCard: { ...headerSettings.productCard, showDescription: e.target.checked } };
                      setHeaderSettings?.(newSettings);
                    }}`
);

code = code.replace(
  /onChange=\{\(e\) => \{\n\s*const newSettings = \{ \.\.\.headerSettings, productCard: \{ \.\.\.headerSettings\.productCard, priceColor: e\.target\.value \} \};\n\s*setHeaderSettings\?\.\(newSettings\);\n\s*onSave\(true, \{ headerSettings: newSettings, footerSettings, widgets \}\);\n\s*\}\}/g,
  `onChange={(e) => {
                      const newSettings = { ...headerSettings, productCard: { ...headerSettings.productCard, priceColor: e.target.value } };
                      setHeaderSettings?.(newSettings);
                    }}`
);

code = code.replace(
  /onChange=\{\(e\) => \{\n\s*const newSettings = \{ \.\.\.headerSettings, productCard: \{ \.\.\.headerSettings\.productCard, showAddToCart: e\.target\.checked \} \};\n\s*setHeaderSettings\?\.\(newSettings\);\n\s*onSave\(true, \{ headerSettings: newSettings, footerSettings, widgets \}\);\n\s*\}\}/g,
  `onChange={(e) => {
                        const newSettings = { ...headerSettings, productCard: { ...headerSettings.productCard, showAddToCart: e.target.checked } };
                        setHeaderSettings?.(newSettings);
                      }}`
);

code = code.replace(
  /onChange=\{\(e\) => \{\n\s*const newSettings = \{ \.\.\.headerSettings, productCard: \{ \.\.\.headerSettings\.productCard, addToCartText: e\.target\.value \} \};\n\s*setHeaderSettings\?\.\(newSettings\);\n\s*onSave\(true, \{ headerSettings: newSettings, footerSettings, widgets \}\);\n\s*\}\}/g,
  `onChange={(e) => {
                            const newSettings = { ...headerSettings, productCard: { ...headerSettings.productCard, addToCartText: e.target.value } };
                            setHeaderSettings?.(newSettings);
                          }}`
);

code = code.replace(
  /onChange=\{\(e\) => \{\n\s*const newSettings = \{ \.\.\.headerSettings, productCard: \{ \.\.\.headerSettings\.productCard, addToCartStyle: e\.target\.value \} \};\n\s*setHeaderSettings\?\.\(newSettings\);\n\s*onSave\(true, \{ headerSettings: newSettings, footerSettings, widgets \}\);\n\s*\}\}/g,
  `onChange={(e) => {
                            const newSettings = { ...headerSettings, productCard: { ...headerSettings.productCard, addToCartStyle: e.target.value } };
                            setHeaderSettings?.(newSettings);
                          }}`
);

code = code.replace(
  /onChange=\{\(e\) => \{\n\s*const newSettings = \{ \.\.\.headerSettings, productCard: \{ \.\.\.headerSettings\.productCard, addToCartColor: e\.target\.value \} \};\n\s*setHeaderSettings\?\.\(newSettings\);\n\s*onSave\(true, \{ headerSettings: newSettings, footerSettings, widgets \}\);\n\s*\}\}/g,
  `onChange={(e) => {
                            const newSettings = { ...headerSettings, productCard: { ...headerSettings.productCard, addToCartColor: e.target.value } };
                            setHeaderSettings?.(newSettings);
                          }}`
);


// Add the columns options
const newSettingsStr = `                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">أبعاد صورة المنتج</label>`;
                  
const colsSettingsStr = `                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">الهواتف (في الصف)</label>
                    <select 
                      className="w-full p-2 border border-border/50 rounded-lg bg-slate-50 text-sm"
                      value={headerSettings?.productCard?.mobileCols || "2"}
                      onChange={(e) => {
                        const newSettings = { ...headerSettings, productCard: { ...headerSettings.productCard, mobileCols: e.target.value } };
                        setHeaderSettings?.(newSettings);
                      }}
                    >
                      <option value="1">1</option>
                      <option value="1.5">1.5</option>
                      <option value="2">2</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">الشاشات (في الصف)</label>
                    <select 
                      className="w-full p-2 border border-border/50 rounded-lg bg-slate-50 text-sm"
                      value={headerSettings?.productCard?.desktopCols || "4"}
                      onChange={(e) => {
                        const newSettings = { ...headerSettings, productCard: { ...headerSettings.productCard, desktopCols: e.target.value } };
                        setHeaderSettings?.(newSettings);
                      }}
                    >
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">أبعاد صورة المنتج</label>`;

code = code.replace(newSettingsStr, colsSettingsStr);

// Add Save Button at the bottom of the Theme Settings tab
code = code.replace(
  /<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\)\}/,
  `</div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-border/50 flex justify-end">
              <button
                onClick={() => onSave(true, { headerSettings, footerSettings, widgets })}
                className="bg-[#2453E3] text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors shadow-sm w-full"
              >
                حفظ ونشر التغييرات
              </button>
            </div>
          </div>
        )}`
);


fs.writeFileSync('src/app/builder/builder-sidebar.tsx', code);
console.log("Updated builder-sidebar with columns settings and save button");
