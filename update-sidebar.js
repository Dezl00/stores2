const fs = require('fs');
let code = fs.readFileSync('src/app/builder/builder-sidebar.tsx', 'utf8');

// Add import
const importStatement = `import { FONT_OPTIONS, FONT_MAP } from "@/app/fonts"\n`;
if (!code.includes('FONT_OPTIONS')) {
  code = code.replace(/import React from "react"/, `import React from "react"\n${importStatement}`);
}

// Ensure setHeaderSettings is extracted from props
code = code.replace(
  /export function BuilderSidebar\(\{([^}]+)\}: any\)/,
  (match, props) => {
    if (!props.includes('setHeaderSettings')) {
      return `export function BuilderSidebar({${props}, setHeaderSettings}: any)`;
    }
    return match;
  }
);

// Replace placeholder
const placeholderRegex = /<div className="flex-1 overflow-y-auto p-4 flex items-center justify-center flex-col text-slate-400 text-sm">[\s\S]*?<\/div>/;

const newThemeSettings = `<div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/30">
          <div className="bg-white border border-border/50 rounded-lg p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <span className="font-bold text-slate-800 text-base">الخطوط (التايبوجرافي)</span>
            </div>
            
            <div className="space-y-3">
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
                    <option key={font.id} value={font.id}>{font.name}</option>
                  ))}
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
              <p className="text-xs text-slate-500">اختر الخط الأساسي الذي سيتم تطبيقه على جميع نصوص المتجر.</p>
              
              <div className="mt-4 p-4 rounded-lg bg-slate-100 border border-slate-200">
                <p className="text-xs text-slate-500 mb-2 font-bold">معاينة الخط:</p>
                <p className={\`text-2xl text-slate-800 \${FONT_MAP[headerSettings?.fontFamily || "ibm"]?.className || ""}\`}>
                  اسم المتجر
                </p>
              </div>
            </div>
          </div>
        </div>`;

code = code.replace(placeholderRegex, newThemeSettings);

fs.writeFileSync('src/app/builder/builder-sidebar.tsx', code);
console.log("Updated builder-sidebar.tsx");
