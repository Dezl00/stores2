const fs = require('fs');
let c = fs.readFileSync('src/app/builder/settings-panel.tsx', 'utf8');

const mSearch = '<option value="left">من اليمين لليسار</option>';
const mIdx = c.indexOf(mSearch);

if (mIdx > -1) {
  const selectEnd = c.indexOf('</select>', mIdx) + '</select>'.length;
  const divEnd = c.indexOf('</div>', selectEnd) + '</div>'.length;
  
  const newFields = `\n              <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">حجم النص</label>
                  <select
                    value={widget.settings?.textSize || "text-sm"} 
                    onChange={(e) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, textSize: e.target.value } }
                      onUpdateWidget(newWidget)
                      onSave(buildSaveState(newWidget))
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                     <option value="text-sm">صغير (افتراضي)</option>
                     <option value="text-base">متوسط</option>
                     <option value="text-lg">كبير</option>
                     <option value="text-xl">كبير جداً</option>
                     <option value="text-2xl">ضخم</option>
                  </select>
              </div>
              <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">سرعة الحركة</label>
                  <select
                    value={widget.settings?.speed || 25} 
                    onChange={(e) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, speed: parseInt(e.target.value) } }
                      onUpdateWidget(newWidget)
                      onSave(buildSaveState(newWidget))
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                     <option value={40}>بطيء جداً</option>
                     <option value={30}>بطيء</option>
                     <option value={20}>عادي</option>
                     <option value={10}>سريع</option>
                     <option value={5}>سريع جداً</option>
                  </select>
              </div>`;
              
  c = c.substring(0, divEnd) + newFields + c.substring(divEnd);
  console.log("Added Marquee settings");
  fs.writeFileSync('src/app/builder/settings-panel.tsx', c, 'utf8');
} else {
  console.log("Could not find mSearch");
}
