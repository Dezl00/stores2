const fs = require('fs');
let c = fs.readFileSync('src/app/builder/settings-panel.tsx', 'utf8');

const marker = '<label className="text-xs font-bold text-slate-600 block">المحاذاة الرأسية للنصوص</label>';

if (c.includes(marker)) {
  // Find the end of this select block
  const selectEnd = c.indexOf('</select>', c.indexOf(marker)) + '</select>'.length + '\n              </div>'.length;
  
  const newField = `\n              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">درجة تعتيم السلايدر (0-100)</label>
                <Input 
                  type="range" min="0" max="100"
                  value={widget.settings?.overlayOpacity ?? 40} 
                  onChange={(e) => {
                    const newWidget = { ...widget, settings: { ...widget.settings, overlayOpacity: parseInt(e.target.value) } }
                    onUpdateWidget(newWidget)
                  }}
                  onBlur={() => onSave(buildSaveState())}
                />
              </div>`;
              
  c = c.substring(0, selectEnd) + newField + c.substring(selectEnd);
  fs.writeFileSync('src/app/builder/settings-panel.tsx', c, 'utf8');
  console.log("SUCCESS!");
} else {
  console.error("FAILED to find marker");
}
