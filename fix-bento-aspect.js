const fs = require('fs');
let c = fs.readFileSync('src/app/builder/settings-panel.tsx', 'utf8');

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

c = c.replace(
  '<label className="text-xs font-bold text-slate-600 block">نص الزر (اختياري)</label>',
  bentoAspect + '\n<label className="text-xs font-bold text-slate-600 block">نص الزر (اختياري)</label>'
);

fs.writeFileSync('src/app/builder/settings-panel.tsx', c, 'utf8');
