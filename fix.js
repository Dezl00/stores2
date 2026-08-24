const fs = require('fs');
let c = fs.readFileSync('src/app/builder/settings-panel.tsx', 'utf8');

const badBlock = `</div
              <div className="space-y-2">
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
              </div>>`;

const goodBlock = `</div>
              <div className="space-y-2">
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
              
if (c.includes(badBlock)) {
    c = c.replace(badBlock, goodBlock);
    fs.writeFileSync('src/app/builder/settings-panel.tsx', c, 'utf8');
    console.log("FIXED!");
} else {
    // try to fix manually
    c = c.replace('</div\n              <div className="space-y-2">', '</div>\n              <div className="space-y-2">');
    c = c.replace('</div>>', '</div>');
    fs.writeFileSync('src/app/builder/settings-panel.tsx', c, 'utf8');
    console.log("MANUAL FIX APPLIED!");
}
