const fs = require('fs');
let c = fs.readFileSync('src/app/builder/settings-panel.tsx', 'utf8');

c = c.replace(
  '<option value="left">من اليمين لليسار</option>\n                  </select>\n              </div>\n            </div>\n          )}',
  `<option value="left">من اليمين لليسار</option>
                  </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">سرعة الشريط (بالثواني)</label>
                  <Input type="number" min="5" max="100" value={widget.settings?.speed ?? 25} onChange={(e) => { const newWidget = { ...widget, settings: { ...widget.settings, speed: parseInt(e.target.value) } }; onUpdateWidget(newWidget) }} onBlur={() => onSave(true, buildSaveState())} className="bg-slate-50 text-xs h-10" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">حجم النص</label>
                  <select value={widget.settings?.textSize || "text-sm"} onChange={(e) => { const newWidget = { ...widget, settings: { ...widget.settings, textSize: e.target.value } }; onUpdateWidget(newWidget); onSave(true, buildSaveState(newWidget)) }} className="flex h-10 w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-xs">
                     <option value="text-sm">صغير</option>
                     <option value="text-base">متوسط</option>
                     <option value="text-lg">كبير</option>
                     <option value="text-xl">كبير جداً</option>
                     <option value="text-2xl">ضخم</option>
                  </select>
                </div>
              </div>
            </div>
          )}`
);

fs.writeFileSync('src/app/builder/settings-panel.tsx', c, 'utf8');
