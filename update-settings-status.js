const fs = require('fs');
let content = fs.readFileSync('src/app/builder/settings-panel.tsx', 'utf8');

const statusToggle = `
          {widget.type !== "Header" && widget.type !== "Footer" && (
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-border/50 rounded-xl mb-2">
              <div>
                <span className="font-bold text-sm text-slate-800 block">حالة القسم</span>
                <span className="text-[11px] text-slate-500 block">تفعيل أو إخفاء القسم من المتجر</span>
              </div>
              <input 
                type="checkbox" 
                className="w-4 h-4 accent-[#2453E3]" 
                checked={widget.status !== false}
                onChange={(e) => {
                  const newWidget = { ...widget, status: e.target.checked }
                  onUpdateWidget(newWidget)
                  onSave(buildSaveState(newWidget))
                }}
              />
            </div>
          )}
`;

content = content.replace(
  /<div className="flex-1 overflow-y-auto p-4 space-y-6">\s*/,
  `<div className="flex-1 overflow-y-auto p-4 space-y-6">
${statusToggle}`
);

fs.writeFileSync('src/app/builder/settings-panel.tsx', content, 'utf8');
console.log("Added global status toggle to settings-panel.");
