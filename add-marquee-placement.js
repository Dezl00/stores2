const fs = require('fs');
let c = fs.readFileSync('src/app/builder/settings-panel.tsx', 'utf8');

const placementUI = `              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">مكان العرض</label>
                <select
                  value={widget.settings?.placement || "header"} 
                  onChange={(e) => {
                    const newWidget = { ...widget, settings: { ...widget.settings, placement: e.target.value } }
                    onUpdateWidget(newWidget)
                    onSave(true, buildSaveState(newWidget))
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-xs"
                >
                   <option value="header">شريط علوي رئيسي (فوق الهيدر)</option>
                   <option value="content">داخل محتوى الصفحة</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">`;

c = c.replace(
  '<div className="flex items-center gap-2 text-[#2453E3] border-b border-border/50 pb-2">\n                <Settings className="w-4 h-4" />\n                <span className="font-bold text-sm">إعدادات الشريط المتحرك</span>\n              </div>\n              <div className="grid grid-cols-2 gap-4">',
  '<div className="flex items-center gap-2 text-[#2453E3] border-b border-border/50 pb-2">\n                <Settings className="w-4 h-4" />\n                <span className="font-bold text-sm">إعدادات الشريط المتحرك</span>\n              </div>\n' + placementUI
);

fs.writeFileSync('src/app/builder/settings-panel.tsx', c, 'utf8');
