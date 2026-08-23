const fs = require('fs');
let c = fs.readFileSync('src/app/builder/settings-panel.tsx', 'utf8');

if (!c.includes('import { Switch }')) {
  c = c.replace(
    'import { GripVertical, Plus, Settings, Trash2, Edit2, Image as ImageIcon, LayoutGrid, X } from "lucide-react"',
    'import { GripVertical, Plus, Settings, Trash2, Edit2, Image as ImageIcon, LayoutGrid, X } from "lucide-react"\nimport { Switch } from "@/components/ui/switch"'
  );
}

const replacer = (match, onChangeBody) => {
  const newBody = onChangeBody.replace(/e\.target\.checked/g, 'checked');
  return '<Switch checked={widget.status !== false} onCheckedChange={(checked) => {' + newBody + '}} />';
};

c = c.replace(/<input\s*type="checkbox"\s*className="w-4 h-4 accent-\[#2453E3\]"\s*checked=\{widget\.status !== false\}\s*onChange=\{\(e\) => \{([\s\S]*?)\}\}\s*\/>/g, 
  (m, body) => '<Switch checked={widget.status !== false} onCheckedChange={(checked) => {' + body.replace(/e\.target\.checked/g, 'checked') + '}} />'
);

c = c.replace(/<input\s*type="checkbox"\s*className="w-4 h-4 accent-\[#2453E3\]"\s*checked=\{widget\.config\?\.showSearch !== false\}\s*onChange=\{\(e\) => onUpdateWidget\(\{ \.\.\.widget, config: \{ \.\.\.widget\.config, showSearch: e\.target\.checked \} \}\)\}\s*\/>/g,
  '<Switch checked={widget.config?.showSearch !== false} onCheckedChange={(checked) => onUpdateWidget({ ...widget, config: { ...widget.config, showSearch: checked } })} />'
);

c = c.replace(/<input\s*type="checkbox"\s*className="w-4 h-4 accent-\[#2453E3\]"\s*checked=\{widget\.config\?\.sticky !== false\}\s*onChange=\{\(e\) => onUpdateWidget\(\{ \.\.\.widget, config: \{ \.\.\.widget\.config, sticky: e\.target\.checked \} \}\)\}\s*\/>/g,
  '<Switch checked={widget.config?.sticky !== false} onCheckedChange={(checked) => onUpdateWidget({ ...widget, config: { ...widget.config, sticky: checked } })} />'
);

c = c.replace(/<input\s*type="checkbox"\s*className="w-4 h-4 accent-\[#2453E3\]"\s*checked=\{widget\.settings\?\.bentoEffectEnabled !== false\}\s*onChange=\{\(e\) => \{([\s\S]*?)\}\}\s*\/>/g,
  (m, body) => '<Switch checked={widget.settings?.bentoEffectEnabled !== false} onCheckedChange={(checked) => {' + body.replace(/e\.target\.checked/g, 'checked') + '}} />'
);

c = c.replace(/<input\s*type="checkbox"\s*className="w-4 h-4 accent-\[#2453E3\]"\s*checked=\{widget\.settings\?\.bgEnabled !== false\}\s*onChange=\{\(e\) => \{([\s\S]*?)\}\}\s*\/>/g,
  (m, body) => '<Switch checked={widget.settings?.bgEnabled !== false} onCheckedChange={(checked) => {' + body.replace(/e\.target\.checked/g, 'checked') + '}} />'
);

c = c.replace(/<input\s*type="checkbox"\s*className="w-3\.5 h-3\.5 accent-\[#2453E3\]"\s*checked=\{!isHidden\}\s*onChange=\{\(e\) => \{([\s\S]*?)\}\}\s*\/>/g,
  (m, body) => '<Switch checked={!isHidden} onCheckedChange={(checked) => {' + body.replace(/e\.target\.checked/g, 'checked') + '}} className="scale-75 origin-left" />'
);

const storeFeaturesExtraSettings = `
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-600">تفعيل حركة السلايدر</label>
              <Switch
                checked={widget.settings?.sliderEnabled !== false}
                onCheckedChange={(checked) => {
                  const newWidget = { ...widget, settings: { ...widget.settings, sliderEnabled: checked } }
                  onUpdateWidget(newWidget)
                  onSave(true, buildSaveState(newWidget))
                }}
              />
            </div>
            {widget.settings?.bgEnabled !== false && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">لون الخلفية</label>
                <Input 
                  type="color"
                  value={widget.settings?.backgroundColor || "#f1f5f9"} 
                  onChange={(e) => {
                    const newWidget = { ...widget, settings: { ...widget.settings, backgroundColor: e.target.value } }
                    onUpdateWidget(newWidget)
                  }}
                  onBlur={() => onSave(true, buildSaveState())}
                  className="h-10 cursor-pointer p-1"
                />
              </div>
            )}
`;

c = c.replace(
  /(<span className="font-bold text-sm">إعدادات المميزات<\/span>\s*<\/div>\s*<div className="flex items-center justify-between">\s*<label className="text-xs font-bold text-slate-600">تفعيل الخلفية الملونة<\/label>\s*<Switch\s*checked=\{widget\.settings\?\.bgEnabled !== false\}\s*onCheckedChange=\{\(checked\) => \{[\s\S]*?\}\}\s*\/>\s*<\/div>)/,
  `$1\n${storeFeaturesExtraSettings}`
);

fs.writeFileSync('src/app/builder/settings-panel.tsx', c, 'utf8');
