const fs = require('fs');
let c = fs.readFileSync('src/app/builder/settings-panel.tsx', 'utf8');

// Find the end of the textPosition select
const searchStr = 'value={widget.settings?.textPosition || "bottom"}';
const posIdx = c.indexOf(searchStr);

if (posIdx > -1) {
  const selectEnd = c.indexOf('</select>', posIdx) + '</select>'.length;
  // Now find the next closing div
  const divEnd = c.indexOf('</div>', selectEnd) + '</div>'.length;
  
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
              
  c = c.substring(0, divEnd) + newField + c.substring(divEnd);
  fs.writeFileSync('src/app/builder/settings-panel.tsx', c, 'utf8');
  console.log("SUCCESS!");
} else {
  console.error("FAILED to find textPosition");
}
